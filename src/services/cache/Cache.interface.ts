import type { IntentName, Slot } from '../../controler/mqtt/types.ts';
import { EActionType } from '../intent/Intent.interface.ts';
import type { EIntentType } from '../tools/prompt/tepes.ts';

export interface AppIntent {
    intent: IntentName;
    slots: Slot[];
}

export interface CachedAssistantAction {
    type: EActionType;
    intent?: AppIntent;
    cached: true;
    output?: string;
    notRecognized?: true;
}

export interface CachedIntentType {
    id: string;
    score: number;
    payload: {
        text: string;
        type: EIntentType;
    };
}
