import type { MqttMessage } from '../../services/mqtt/Mqtt.service.ts';
import type { SessionContext } from '../../services/intent/Context.interface.ts';

export interface Query extends MqttMessage {
    siteId: string;
    sessionId: string;
    input?: string;
    id?: string;
    customData?: SessionContext;
}

export interface ProcessingQuery extends MqttMessage {
    siteId: string;
    sessionId: string;
    id?: string;
    customData: SessionContext;
}

export interface IntentNotRecognized extends Query {}

export interface Intent {
    siteId: string;
    intent: IntentName;
    slots: Slot[];
}

export interface IntentName {
    intentName: string;
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
    customData?: SessionContext;
    sendIntentNotRecognized?: boolean;
    intentFilter?: string[];
}

export interface DialogueContinueSession {
    siteId: string;
    sessionId: string;
    text?: string;
    customData?: SessionContext;
}
