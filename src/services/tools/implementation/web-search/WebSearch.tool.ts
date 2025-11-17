import type { Query } from '../../../../controler/mqtt/types.ts';
import { EAssistantRole, EMessageType } from '../../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import webSearchPromptService from './WebSearchPrompt.service.ts';
import type { Task } from '../../../intent/Context.interface.ts';

class WebSearchToolClass extends ToolAbstract {
    constructor() {
        super('WEB_SEARCH', 'Uzywaj tylko i wyłącznie w wtedy gdy potrzeba dostępu do najnowszych informacji z sieci');
    }

    async doAction(task: Task, query: Query): Promise<void> {
        const answer = (await webSearchPromptService.search(query.input as string)) as string;

        console.log(`Web search answer: ${answer}`);

        task.messages.push({
            type: EMessageType.COMPLETED,
            role: EAssistantRole.ASSISTANT,
            content: answer,
        });

        task.say = answer;
    }
}

export default new WebSearchToolClass();
