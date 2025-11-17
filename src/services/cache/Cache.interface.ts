import { type MessageHistory } from '../intent/Intent.interface.ts';
import { ETaskStatus } from '../intent/Context.interface.ts';

export interface CachedSessionContext {
    tasks: CachedTask[];
}

export interface CachedTask {
    tool: string;
    query: string;
    status: ETaskStatus;
    messages: MessageHistory[];
    data?: object | string;
    cached?: boolean;
}
