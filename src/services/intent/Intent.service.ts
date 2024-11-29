import type { Query } from '../../controler/mqtt/types.ts';
import IntentTypePromptService, {
    IntentTypePromptClass,
} from '../tools/prompt/IntentTypePrompt.service.ts';
import envProps from '../../property/Property.manager.ts';
import { type AssistantAction } from './Intent.interface.ts';
import ExactQueryCache, { ExactQueryCacheClass } from '../cache/ExactCache.cache.ts';
import { EndSessionNegative, MergeMessage, UserMessage } from './Action.interface.ts';
import toolsService, { ToolsServiceClass } from '../tools/ToolsService.ts';
import { notRecognized } from '../tools/Abstract.tool.ts';

export class IntentServiceClass {
    private endSentences: string[];
    private exactQueryCache: ExactQueryCacheClass;
    private intentTypePromptService: IntentTypePromptClass;
    private toolsService: ToolsServiceClass;

    constructor(
        exactQueryCacheClass: ExactQueryCacheClass,
        intentTypePromptService: IntentTypePromptClass,
        toolsService: ToolsServiceClass,
        endSentences: string[]
    ) {
        this.exactQueryCache = exactQueryCacheClass;
        this.intentTypePromptService = intentTypePromptService;
        this.toolsService = toolsService;
        this.endSentences = endSentences.map(text => text.trim());
    }

    async recognize(query: Query): Promise<AssistantAction> {
        return this.exactQueryCache.wrap(query, this._recognize.bind(this));
    }

    private async _recognize(query: Query): Promise<AssistantAction> {
        if (!query.input || this.isEndAction(query.input)) {
            return EndSessionNegative(query);
        }

        query.customData = MergeMessage(UserMessage(query.input), query.customData);

        try {
            console.log(`Message received: ${query.input}`);

            const intentType = await this.intentTypePromptService.recognizeTypeOfIntent(
                query.input
            );

            console.log(`Chosen intent type: ${intentType as string}`);

            return await this.toolsService.doAction(intentType, query);
        } catch (er) {
            console.error(er);
            return notRecognized(query);
        }
    }

    private isEndAction(input: string): boolean {
        return this.endSentences.indexOf(input) !== -1;
    }
}

export default new IntentServiceClass(
    ExactQueryCache,
    IntentTypePromptService,
    toolsService,
    envProps.intent.endSentences
);
