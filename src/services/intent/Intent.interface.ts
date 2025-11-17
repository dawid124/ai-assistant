import type { Intent, Query } from '../../controler/mqtt/types.ts';
import type { SessionContext } from './Context.interface.ts';

export type RecognizeType = (msg: Query) => Promise<AssistantAction>;

export interface AssistantAction {
    siteId: string;
    sessionId: string;
    type: EActionType;

    customData?: SessionContext;
    intents?: Intent[];

    input?: string;
    output?: string;

    cached?: boolean;
}

export interface MessageHistory {
    role: EAssistantRole;
    content: string;
    type: EMessageType;
}

export enum EAssistantRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
}

export enum EMessageType {
    USER_REQUESTED = 'USER_REQUESTED',
    COMPLETED = 'COMPLETED',
    INTENT_NOT_RECOGNIZED = 'INTENT_NOT_RECOGNIZED',
    AI_QUESTION = 'AI_QUESTION',
}

export enum EActionType {
    CONTINUE_SESSION = 'CONTINUE_SESSION',
    END_SESSION_POSITIVE = 'END_SESSION_POSITIVE',
    END_SESSION_NEGATIVE = 'END_SESSION_NEGATIVE',
}
