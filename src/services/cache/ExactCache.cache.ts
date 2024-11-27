import JSONdb from 'simple-json-db';
import type { CachedAssistantAction } from './Cache.interface.ts';
import envProps from '../../property/Property.manager.ts';
import * as path from 'node:path';
import {
    type AssistantAction,
    EActionType,
    EMessageType,
    type RecognizeType,
} from '../intent/Intent.interface.ts';
import type { Query } from '../../controler/mqtt/types.ts';
import type { IExactCacheProps } from '../../property/Property.interface.ts';

export class ExactQueryCacheClass {
    private active: boolean;
    private cacheNotRecognizeAfterCorrection: boolean;
    private types: string[];

    private cache?: JSONdb;

    constructor(props: IExactCacheProps) {
        this.active = props.active;
        this.cacheNotRecognizeAfterCorrection = props.cacheNotRecognizeAfterCorrection;
        this.types = props.types;
        if (this.active) {
            this.cache = new JSONdb(path.join(envProps.databasePath, 'cache.json'));
        }
    }

    async wrap(query: Query, recognize: RecognizeType): Promise<AssistantAction> {
        if (!this.active || !query.input) return await recognize(query);

        const cachedAssistantAction = this.get(query.input);
        if (cachedAssistantAction) {
            this.cacheHistoricNotRecognized(query, cachedAssistantAction);
            const action: AssistantAction = {
                siteId: query.siteId,
                sessionId: query.sessionId,
                type: cachedAssistantAction.type,
                output: cachedAssistantAction.output,
                cached: true,
            };
            if (cachedAssistantAction.intent) {
                action.intent = {
                    ...cachedAssistantAction.intent,
                    siteId: query.siteId,
                    sessionId: query.sessionId,
                    input: query.input,
                };
            }
            return action;
        }

        const assistantAction = await recognize(query);

        this.cacheAction(query, assistantAction);
        this.cacheHistoricNotRecognized(query, assistantAction);

        return assistantAction;
    }

    private cacheAction(query: Query, assistantAction: AssistantAction): void {
        if (!this.shouldCache(assistantAction.type)) {
            return;
        }

        const action = this.parseAction(assistantAction);

        this.add(query.input as string, action);
    }

    private cacheHistoricNotRecognized(
        query: Query,
        assistantAction: AssistantAction | CachedAssistantAction
    ): void {
        if (!this.shouldCache(assistantAction.type)) {
            return;
        }
        const action = this.parseAction(assistantAction);

        if (this.cacheNotRecognizeAfterCorrection && query.customData) {
            for (const conversation of query.customData) {
                if (
                    conversation.type === EMessageType.INTENT_NOT_RECOGNIZED &&
                    conversation.content.length > 10
                ) {
                    this.add(conversation.content, { ...action, notRecognized: true });
                }
            }
        }
    }

    private parseAction(
        assistantAction: AssistantAction | CachedAssistantAction
    ): CachedAssistantAction {
        const action: CachedAssistantAction = {
            type: assistantAction.type,
            output: assistantAction.output,
            cached: true,
        };
        if (assistantAction.intent) {
            action.intent = {
                intent: assistantAction.intent.intent,
                slots: assistantAction.intent.slots,
            };
        }
        return action;
    }

    private shouldCache(actionType: EActionType): boolean {
        return this.types.indexOf(actionType) !== -1;
    }

    private get(key: string): CachedAssistantAction {
        if (!this.cache) {
            throw new Error('Cache not initialized');
        }
        return this.cache.get(key.toLowerCase()) as CachedAssistantAction;
    }

    private add(key: string, value: CachedAssistantAction): void {
        if (!this.cache) {
            throw new Error('Cache not initialized');
        }
        this.cache.set(key.toLowerCase(), value);
    }
}

export default new ExactQueryCacheClass(envProps.cache.exactQueryCache);
