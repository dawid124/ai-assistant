import type { Query } from '../../../../controler/mqtt/types.ts';
import { EMessageType } from '../../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import { ETaskStatus, type SessionContext, type Task } from '../../../intent/Context.interface.ts';
import IntentTypePromptService from '../../../intent/SessionPlan.prompt.ts';
import envProps from '../../../../property/Property.manager.ts';

export const NOT_RECOGNIZED: string = 'NOT_RECOGNIZED';

class NotRecognizedTool extends ToolAbstract {
    constructor() {
        super('NOT_RECOGNIZED', 'kompletnie niemożlwie do rozczytania lub zrozumienia');
    }

    async doAction(task: Task, query: Query): Promise<void> {
        if (task.messages.length === 1) {
            task.messages[0].type = EMessageType.INTENT_NOT_RECOGNIZED;
            task.status = ETaskStatus.CONTINUED;
            task.say = envProps.intent.pleaseRepeat;
            return;
        }

        const plan = await IntentTypePromptService.createPlan(query.input as string, query.siteId);

        if (plan.tasks[0] && plan.tasks[0].tool === 'NOT_RECOGNIZED') {
            task.messages[task.messages.length - 1].type = EMessageType.INTENT_NOT_RECOGNIZED;
            task.status = ETaskStatus.TERMINATED;
            task.say = '';
            return;
        } else {
            task.status = ETaskStatus.COMPLETED;
            task.say = '';
            (query.customData as SessionContext).tasks = [...(query.customData as SessionContext).tasks, ...plan.tasks];
        }

        console.log('Plan of actions:');
        console.table(plan.tasks);
    }
}

export default new NotRecognizedTool();
