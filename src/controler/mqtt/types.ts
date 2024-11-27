import type { MqttMessage } from '../../services/mqtt/Mqtt.service.ts';
import type { MessageHistory } from '../../services/intent/Intent.interface.ts';

export interface Query extends MqttMessage {
    siteId: string;
    sessionId: string;
    input?: string;
    id?: string;
    customData?: MessageHistory[];
}

export interface ProcessingQuery extends MqttMessage {
    siteId: string;
    sessionId: string;
    id?: string;
    customData: MessageHistory[];
}

export interface IntentNotRecognized extends Query {}

export interface Intent extends Query {
    intent: IntentName;
    slots: Slot[];
}

export interface IntentName {
    intentName: string;
    confidenceScore: number;
}

export interface Slot {
    entity: string;
    value: IValue;
}

export interface IValue {
    value: number | string;
}

export interface TtsSay {
    siteId: string;
    sessionId: string;
    text: string;
}

export interface DialogueEndSession {
    sessionId: string;
    text?: string;
    customData?: MessageHistory[];
    sendIntentNotRecognized?: boolean;
    intentFilter?: string[];
}

export interface DialogueContinueSession {
    siteId: string;
    sessionId: string;
    text?: string;
    customData?: MessageHistory[];
}
