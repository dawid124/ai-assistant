import type { Query } from '../../../../controler/mqtt/types.ts';
import { EAssistantRole, EMessageType } from '../../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import AiAnswerPrompt, { AiAnswerPromptClass } from './AiAnswer.prompt.ts';
import { ETaskStatus, type Task } from '../../../intent/Context.interface.ts';

class AiQuestionToolClass extends ToolAbstract {
    private readonly aiAnswerPrompt: AiAnswerPromptClass;

    constructor(aiAnswerPrompt: AiAnswerPromptClass) {
        super('AI_QUESTION', 'pytanie na które AI jest w stanie odpowiedzieć samodzielnie na podstawie swojej bazy');
        this.aiAnswerPrompt = aiAnswerPrompt;
    }

    async doAction(task: Task, query: Query): Promise<void> {
        const answer = (await this.aiAnswerPrompt.awswer(task.messages)) as string;

        console.log(`Ai answer: ${answer}`);

        task.messages.push({
            type: EMessageType.COMPLETED,
            role: EAssistantRole.ASSISTANT,
            content: answer,
        });

        task.status = ETaskStatus.COMPLETED;
        task.say = answer;
    }
}

export default new AiQuestionToolClass(AiAnswerPrompt);
