import type { Slot } from '../../../../controler/mqtt/types.ts';

export enum EIntentType {
    SMART_HOME_ACTION = 'SMART_HOME_ACTION',
    WEB_SEARCH = 'WEB_SEARCH',
    FILM_RATING = 'FILM_RATING',
    AI_QUESTION = 'AI_QUESTION',
    NOT_RECOGNIZED = 'NOT_RECOGNIZED',
}

export interface ISmartHomeIntent {
    intentName: string;
    slots: Slot[];
}

export interface VoiceResponse {
    text: string;
}
