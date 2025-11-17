import type { MessageHistory } from './Intent.interface.ts';

export interface SessionContext {
    current: number;
    tasks: Task[];
    usedPrevContext?: boolean;
}
export enum ETaskStatus {
    CREATED = 'CREATED',
    CONTINUED = 'CONTINUED',
    TERMINATED = 'TERMINATED',
    COMPLETED = 'COMPLETED',
}

export interface Task {
    createdDate: Date;
    siteId: string;
    tool: string;
    query: string;
    status: ETaskStatus;
    messages: MessageHistory[];
    data?: object | string;
    say?: string;
    cached?: boolean;
}
