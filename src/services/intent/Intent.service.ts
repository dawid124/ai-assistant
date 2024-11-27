import type { Query } from '../../controler/mqtt/types.ts';
import IntentTypePromptService, {
    IntentTypePromptClass,
} from '../prompt/IntentTypePrompt.service.ts';
import { EIntentType, type ISmartHomeIntent } from '../prompt/tepes.ts';
import smartHomePromptService from '../prompt/SmartHomePrompt.service.ts';
import aiAnswerPromptService from '../prompt/AiAnswerPrompt.service.ts';
import envProps from '../../property/Property.manager.ts';
import webSearchPromptService from '../prompt/WebSearchPrompt.service.ts';
import { type AssistantAction, EMessageType } from './Intent.interface.ts';
import ExactQueryCache, { ExactQueryCacheClass } from '../cache/ExactCache.cache.ts';
import {
    ContinueSession,
    EndSessionNegative,
    EndSessionPositive,
    MergeMessage,
    SmartHomeActionRedirect,
    UserMessage,
} from './Action.interface.ts';

export class IntentServiceClass {
    private endSentences: string[];
    private exactQueryCache: ExactQueryCacheClass;
    private intentTypePromptService: IntentTypePromptClass;

    constructor(
        exactQueryCacheClass: ExactQueryCacheClass,
        intentTypePromptService: IntentTypePromptClass,
        endSentences: string[]
    ) {
        this.exactQueryCache = exactQueryCacheClass;
        this.intentTypePromptService = intentTypePromptService;
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

            // return Promise.all(undefined);

            return await this.processAction(intentType, query);
        } catch (er) {
            console.error(er);
            return this.notRecognized(query);
        }
    }

    private isEndAction(input: string): boolean {
        return this.endSentences.indexOf(input) !== -1;
    }

    private async processAction(intentType: EIntentType, query: Query): Promise<AssistantAction> {
        switch (intentType) {
            case EIntentType.SMART_HOME_ACTION:
                return await this.smartHomeAction(query);
            case EIntentType.AI_QUESTION:
                return await this.aiQuestion(query);
            // case EIntentType.WEB_SEARCH:
            //     return await this.webSearch(query);
            case EIntentType.NOT_RECOGNIZED:
                return this.notRecognized(query);
            default:
                return EndSessionNegative(query, 'Akcja nie została jeszcze zaimplementowana');
        }
    }

    private async smartHomeAction(query: Query): Promise<AssistantAction> {
        const actionStr = await smartHomePromptService.recognize(query.customData);
        if (!actionStr) {
            return this.notRecognized(query);
        }

        const action: ISmartHomeIntent = JSON.parse(actionStr);
        if (!action || action.intentName === 'NotRecognized') {
            return this.notRecognized(query);
        }
        console.log('SmartHomeAction:', action);

        return SmartHomeActionRedirect(query, {
            slots: action.slots,
            intent: { intentName: action.intentName, confidenceScore: 1 },
        });
    }

    private async aiQuestion(query: Query): Promise<AssistantAction> {
        const answer = (await aiAnswerPromptService.awswer(query.customData)) as string;

        console.log(`Ai answer: ${answer}`);

        const intent = {
            intent: { intentName: 'AiAnswer', confidenceScore: 1 },
            slots: [{ entity: 'text', value: { value: answer } }],
        };

        return EndSessionPositive(query, intent, answer);
    }

    private async webSearch(query: Query) {
        const answer = (await webSearchPromptService.search(query.input as string)) as string;

        console.log(`Web search answer: ${answer}`);

        const intent = {
            intent: { intentName: 'AiWebSearchAnswer', confidenceScore: 1 },
            slots: [{ entity: 'text', value: { value: answer } }],
        };

        return EndSessionPositive(query, intent, answer);
    }

    private notRecognized(query: Query): AssistantAction {
        const prevNotRecognize = query.customData?.find(
            item => item.type === EMessageType.INTENT_NOT_RECOGNIZED
        );

        const userMessage = query.customData?.find(msg => msg.content === query.input);
        if (userMessage?.type) userMessage.type = EMessageType.INTENT_NOT_RECOGNIZED;

        if (prevNotRecognize) {
            return EndSessionNegative(query);
        } else {
            return ContinueSession(query, envProps.intent.pleaseRepeat);
        }
    }
}

export default new IntentServiceClass(
    ExactQueryCache,
    IntentTypePromptService,
    envProps.intent.endSentences
);
