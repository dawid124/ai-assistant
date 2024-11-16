export interface Query {
    input: string;
    siteId: string;
    sessionId: string;
    id?: string;
    customData?: string;
}

export interface NluQueryMsg extends Query {
    intentFilter?: string[];
    asrConfidence?: string;
}

export interface IntentNotRecognized extends Query {}

export interface IntentRecognized extends Query {
    intent: Intent;
    slots: Slot[];
}

export interface Intent {
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
    text: string;
    customData?: string;
    sendIntentNotRecognized: ?boolean;
    intentFilter?: string[];
}

export interface DialogueContinueSession {
    sessionId: string;
    text?: string;
    customData?: string;
}
