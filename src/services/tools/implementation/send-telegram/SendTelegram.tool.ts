import type { Query } from '../../../../controler/mqtt/types.ts';
import { EAssistantRole, EMessageType } from '../../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import type { Task } from '../../../intent/Context.interface.ts';

class SendTelegramTool extends ToolAbstract {
    constructor() {
        super('SEND_TELEGRAM', 'wysyłanie odpowiedzi na telefon / komunikator telegram');
    }

    async doAction(task: Task, query: Query): Promise<void> {
        const answer = 'gotowe';
        task.messages.push({
            type: EMessageType.COMPLETED,
            role: EAssistantRole.ASSISTANT,
            content: answer,
        });

        task.say = answer;
    }
}

export default new SendTelegramTool();
