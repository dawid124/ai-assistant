import type { Query } from '../../controler/mqtt/types.ts';
import {
    type AssistantAction,
    EActionType,
    EAssistantRole,
    EMessageType,
    type MessageHistory,
} from './Intent.interface.ts';
import type { AppIntent } from '../cache/Cache.interface.ts';

export const MergeMessage = (
    newEntry: MessageHistory,
    customData?: MessageHistory[]
): MessageHistory[] => {
    if (typeof customData === 'string') {
        return [newEntry];
    }

    return Array.isArray(customData)
        ? [...customData.filter(data => typeof data === 'object'), newEntry]
        : [newEntry];
};

export const UserMessage = (input: string): MessageHistory => ({
    type: EMessageType.USER_REQUESTED,
    role: EAssistantRole.USER,
    content: input,
});

export const IntentNotRecognizedMessage = (input: string): MessageHistory => ({
    type: EMessageType.INTENT_NOT_RECOGNIZED,
    role: EAssistantRole.SYSTEM,
    content: input,
});

export const EndSessionNegative = (query: Query, text?: string): AssistantAction => ({
    type: EActionType.END_SESSION_NEGATIVE,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    history: query.customData,
    output: text,
});

export const EndSessionPositive = (
    query: Query,
    intent: AppIntent,
    text?: string
): AssistantAction => ({
    type: EActionType.END_SESSION_POSITIVE,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    history: query.customData,
    intent: {
        input: query.input,
        sessionId: query.sessionId,
        siteId: query.siteId,
        ...intent,
    },
    output: text,
});

export const ContinueSession = (query: Query, text?: string): AssistantAction => ({
    type: EActionType.CONTINUE_SESSION,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    history: query.customData,
    output: text,
});

export const SmartHomeActionRedirect = (
    query: Query,
    intent: AppIntent,
    text?: string
): AssistantAction => ({
    type: EActionType.SMART_HOME_ACTION_REDIRECT,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    history: query.customData,
    intent: {
        input: query.input,
        sessionId: query.sessionId,
        siteId: query.siteId,
        ...intent,
    },
    output: text,
});
