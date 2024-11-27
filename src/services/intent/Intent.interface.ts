import type { Intent, Query } from '../../controler/mqtt/types.ts';

export type RecognizeType = (msg: Query) => Promise<AssistantAction>;

export interface AssistantAction {
    siteId: string;
    sessionId: string;
    type: EActionType;

    history?: MessageHistory[];
    intent?: Intent;

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
    INTENT_NOT_RECOGNIZED = 'INTENT_NOT_RECOGNIZED',
    INTENT_RECOGNIZED = 'INTENT_RECOGNIZED',
}

export enum EActionType {
    SMART_HOME_ACTION_REDIRECT = 'SMART_HOME_ACTION_REDIRECT',
    CONTINUE_SESSION = 'CONTINUE_SESSION',
    END_SESSION_POSITIVE = 'END_SESSION_POSITIVE',
    END_SESSION_NEGATIVE = 'END_SESSION_NEGATIVE',
    NEED_CONFIRMATION = 'NEED_CONFIRMATION',
}
