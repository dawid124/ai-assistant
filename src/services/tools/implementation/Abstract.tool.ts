import type { Query } from '../../../controler/mqtt/types.ts';
import { EMessageType } from '../../intent/Intent.interface.ts';
import envProps from '../../../property/Property.manager.ts';
import { ToolsServiceClass } from '../ToolsService.ts';
import { ETaskStatus, type Task } from '../../intent/Context.interface.ts';

export const notRecognized = (task: Task, query: Query) => {
    const prevNotRecognize = task.messages[task.messages.length - 1].type === EMessageType.INTENT_NOT_RECOGNIZED;

    const userMessage = task.messages.find(msg => msg.content === query.input);
    if (userMessage?.type) userMessage.type = EMessageType.INTENT_NOT_RECOGNIZED;

    if (prevNotRecognize) {
        task.status = ETaskStatus.TERMINATED;
        task.say = '';
    } else {
        task.status = ETaskStatus.CONTINUED;
        task.say = envProps.intent.pleaseRepeat;
    }
};

export abstract class ToolAbstract {
    protected readonly name: string;
    protected readonly description: string;

    abstract doAction(task: Task, query: Query): Promise<void>;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    notRecognized(task: Task, query: Query): void {
        notRecognized(task, query);
    }

    init(toolsService: ToolsServiceClass): void {
        toolsService.addTool(this.name, this.description, this);
        console.log(`Initialize new tool: ${this.name}`);
    }
}
