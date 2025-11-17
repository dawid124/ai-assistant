import type { Task } from '../intent/Context.interface.ts';

export class MemoryServiceClass {
    private memory: Task[];

    constructor() {
        this.memory = [];
    }

    add(tasks?: Task[]) {
        if (tasks) tasks.forEach(task => this.memory.unshift(task));
    }

    getLast3Min(siteId: string) {
        return this.memory
            .filter(task => task.siteId === siteId)
            .filter(task => task.createdDate > new Date(Date.now() - 1000 * 60 * 3));
    }
}

export default new MemoryServiceClass();
