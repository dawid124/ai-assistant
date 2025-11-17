import type { Query } from '../../controler/mqtt/types.ts';
import IntentTypePromptService, { SessionPlanPromptClass } from './SessionPlan.prompt.ts';
import envProps from '../../property/Property.manager.ts';
import { type AssistantAction } from './Intent.interface.ts';
import ExactQueryCache, { ExactQueryCacheClass } from '../cache/ExactCache.cache.ts';
import {
    ContinueSession,
    EndSessionNegative,
    EndSessionPositive,
    MergeMessage,
    UserMessage,
} from './Action.interface.ts';
import toolsService, { ToolsServiceClass } from '../tools/ToolsService.ts';
import { ETaskStatus, type SessionContext } from './Context.interface.ts';
import MemoryService, { MemoryServiceClass } from '../data/Memory.service.ts';

export class IntentServiceClass {
    private endSentences: string[];
    private exactQueryCache: ExactQueryCacheClass;
    private intentTypePromptService: SessionPlanPromptClass;
    private toolsService: ToolsServiceClass;
    private memoryService: MemoryServiceClass;

    constructor(
        exactQueryCacheClass: ExactQueryCacheClass,
        intentTypePromptService: SessionPlanPromptClass,
        toolsService: ToolsServiceClass,
        memoryService: MemoryServiceClass,
        endSentences: string[]
    ) {
        this.exactQueryCache = exactQueryCacheClass;
        this.intentTypePromptService = intentTypePromptService;
        this.memoryService = memoryService;
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

        console.log(`Message received: ${query.input}`);

        if (this.shouldCreateNewPlan(query)) {
            query.customData = await this.createPlan(query);
        } else {
            const context = query.customData as SessionContext;
            context.tasks[context.current].messages = MergeMessage(
                UserMessage(query.input),
                context.tasks[context.current].messages
            );
        }

        try {
            return await this.processTasks(query);
        } catch (er) {
            console.error(er);
            return EndSessionNegative(query, 'Przepraszam wystąpił błąd');
        }
    }

    private async processTasks(query: Query): Promise<AssistantAction> {
        const context = query.customData as SessionContext;
        for (let i = context.current; i < context.tasks.length; i++) {
            const task = context.tasks[i];

            await this.toolsService.doAction(task, query);

            switch (task.status) {
                case ETaskStatus.COMPLETED:
                    context.current++;
                    break;
                case ETaskStatus.CONTINUED:
                    return ContinueSession(query, task.say);
                case ETaskStatus.TERMINATED:
                    return EndSessionNegative(query, task.say);
            }
        }

        this.memoryService.add(query.customData?.tasks);

        return EndSessionPositive(
            query,
            context.tasks
                .filter(task => task.say)
                .map(task => task.say)
                .join(',')
        );
    }

    private shouldCreateNewPlan(query: Query): boolean {
        return !query.customData || typeof query.customData === 'string';
    }

    private async createPlan(query: Query): Promise<SessionContext> {
        const plan = await this.intentTypePromptService.createPlan(query.input as string, query.siteId);

        console.log('Plan of actions:');
        console.table(plan.tasks);

        return plan;
    }

    private isEndAction(input: string): boolean {
        return this.endSentences.indexOf(input.trim().replaceAll('\n', '')) !== -1;
    }
}

export default new IntentServiceClass(
    ExactQueryCache,
    IntentTypePromptService,
    toolsService,
    MemoryService,
    envProps.intent.endSentences
);
