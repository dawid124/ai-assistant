import type { Query } from '../../../../controler/mqtt/types.ts';
import { EAssistantRole, EMessageType } from '../../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import type { Task } from '../../../intent/Context.interface.ts';

class ShowOnTvTool extends ToolAbstract {
    constructor() {
        super('SHOW_ON_TV', 'wysyłanie odpowiedzi tekstowej do telewizora');
    }

    async doAction(task: Task, query: Query): Promise<void> {
        const answer = 'gotowe';
        task.messages.push({
            type: EMessageType.COMPLETED,
            role: EAssistantRole.ASSISTANT,
            content: answer,
        });

        task.say = answer;

        return Promise.resolve();
    }
}

export default new ShowOnTvTool();
