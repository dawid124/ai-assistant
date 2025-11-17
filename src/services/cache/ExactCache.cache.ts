import JSONdb from 'simple-json-db';
import type { CachedSessionContext, CachedTask } from './Cache.interface.ts';
import envProps from '../../property/Property.manager.ts';
import * as path from 'node:path';
import {
    type AssistantAction,
    EMessageType,
    type MessageHistory,
    type RecognizeType,
} from '../intent/Intent.interface.ts';
import type { Query } from '../../controler/mqtt/types.ts';
import type { IExactCacheProps } from '../../property/Property.interface.ts';
import { ETaskStatus, type SessionContext, type Task } from '../intent/Context.interface.ts';
import { NOT_RECOGNIZED } from '../tools/implementation/not-recognized/NotRecognized.tool.ts';

export class ExactQueryCacheClass {
    private active: boolean;
    private cacheNotRecognizeAfterCorrection: boolean;
    private types: string[];
    private preventCacheKeys: string[];

    private cache?: JSONdb;

    constructor(props: IExactCacheProps) {
        this.active = props.active;
        this.cacheNotRecognizeAfterCorrection = props.cacheNotRecognizeAfterCorrection;
        this.types = props.types;
        this.preventCacheKeys = ['errorfailed to read audio file', ...envProps.intent.endSentences];
        if (this.active) {
            this.cache = new JSONdb(path.join(envProps.databasePath, 'cache.json'));
        }
    }

    async wrap(query: Query, recognize: RecognizeType): Promise<AssistantAction> {
        if (!this.active || !query.input) return await recognize(query);

        const cachedSession = this.get(query.input);
        if (cachedSession) {
            this.cacheHistoricNotRecognized(query, cachedSession);

            query.customData = this.convertFromCached(cachedSession, query);

            return await recognize(query);
        } else {
            const assistantAction = await recognize(query);

            if (this.isAllTasksCompletedAndNotUsedPrevContext(assistantAction)) {
                this.cacheSession(query, assistantAction.customData as SessionContext);
                this.cacheHistoricNotRecognized(query, assistantAction.customData as SessionContext);
            }

            return assistantAction;
        }
    }

    private isAllTasksCompletedAndNotUsedPrevContext(assistantAction: AssistantAction): boolean {
        return (
            assistantAction.customData?.tasks.filter(task => task.status !== ETaskStatus.COMPLETED).length === 0 &&
            !assistantAction.customData.usedPrevContext
        );
    }

    private cacheSession(query: Query, context: SessionContext): void {
        if (!this.shouldCache(context)) {
            return;
        }

        const cachedContext = this.convertToCached(context);

        this.add(query.input as string, cachedContext);

        if (context.tasks.length === 1 && query.input !== context.tasks[0].query) {
            this.add(context.tasks[0].query, cachedContext);
        }
    }

    private cacheHistoricNotRecognized(query: Query, context: SessionContext | CachedSessionContext): void {
        if (!this.shouldCache(context)) {
            return;
        }

        const cachedContext = this.convertToCached(context);

        if (this.cacheNotRecognizeAfterCorrection && query.customData && query.customData.tasks) {
            for (const task of query.customData.tasks.filter(task => task.tool === NOT_RECOGNIZED)) {
                for (const msg of task.messages) {
                    if (
                        msg.type === EMessageType.INTENT_NOT_RECOGNIZED &&
                        msg.content.length > 10 &&
                        this.preventCacheKeys.indexOf(msg.content) === -1
                    ) {
                        this.add(msg.content, cachedContext);
                    }
                }
            }
        }
    }

    private convertFromCached(cachedPlan: CachedSessionContext, query: Query): SessionContext {
        return {
            tasks: cachedPlan.tasks.map(task => ({
                ...task,
                siteId: query.siteId,
                createdDate: new Date(),
            })),
            current: 0,
        };
    }

    private convertToCached(context: SessionContext | CachedSessionContext): CachedSessionContext {
        return {
            tasks: [
                ...context.tasks
                    .filter(t => t.tool !== NOT_RECOGNIZED)
                    .map(task => ({
                        tool: task.tool,
                        query: task.query,
                        status: ETaskStatus.CREATED,
                        messages: [this.findFirstRecognizedMessage(task)],
                        data: task.data,
                        cached: true,
                    })),
            ],
        };
    }

    private findFirstRecognizedMessage(task: Task | CachedTask): MessageHistory {
        return task.messages.filter(msg => msg.type !== EMessageType.INTENT_NOT_RECOGNIZED)[0];
    }

    private shouldCache(context: SessionContext | CachedSessionContext): boolean {
        return (
            context.tasks.filter(task => this.types.indexOf(task.tool) === -1 && task.tool !== NOT_RECOGNIZED)
                .length === 0
        );
    }

    private get(key: string): CachedSessionContext {
        if (!this.cache) {
            throw new Error('Cache not initialized');
        }
        return this.cache.get(this.trimInput(key)) as CachedSessionContext;
    }

    private trimInput(key: string): string {
        return key.toLowerCase().trim().replaceAll('\n', '');
    }

    private add(key: string, value: CachedSessionContext): void {
        if (!this.cache) {
            throw new Error('Cache not initialized');
        }
        this.cache.set(this.trimInput(key), value);
    }
}

export default new ExactQueryCacheClass(envProps.cache.exactQueryCache);
