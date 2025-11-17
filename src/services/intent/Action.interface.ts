import type { Query } from '../../controler/mqtt/types.ts';
import {
    type AssistantAction,
    EActionType,
    EAssistantRole,
    EMessageType,
    type MessageHistory,
} from './Intent.interface.ts';

export const MergeMessage = (
    newEntry: MessageHistory,
    customData?: MessageHistory[]
): MessageHistory[] => {
    return Array.isArray(customData)
        ? [...customData.filter(data => typeof data === 'object'), newEntry]
        : [newEntry];
};

export const UserMessage = (input: string): MessageHistory => ({
    type: EMessageType.USER_REQUESTED,
    role: EAssistantRole.USER,
    content: input,
});

export const EndSessionNegative = (query: Query, text?: string): AssistantAction => ({
    type: EActionType.END_SESSION_NEGATIVE,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    customData: query.customData,
    output: text,
});

export const EndSessionPositive = (query: Query, text?: string): AssistantAction => ({
    type: EActionType.END_SESSION_POSITIVE,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    customData: query.customData,
    output: text,
});

export const ContinueSession = (query: Query, text?: string): AssistantAction => ({
    type: EActionType.CONTINUE_SESSION,
    input: query.input,
    sessionId: query.sessionId,
    siteId: query.siteId,
    customData: query.customData,
    output: text,
});
