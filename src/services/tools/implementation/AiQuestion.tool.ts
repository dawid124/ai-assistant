import type { Query } from '../../../controler/mqtt/types.ts';
import type { AssistantAction } from '../../intent/Intent.interface.ts';
import { EndSessionPositive } from '../../intent/Action.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import aiAnswerPromptService from '../prompt/AiAnswerPrompt.service.ts';
import { ToolsServiceClass } from '../ToolsService.ts';

export class AiQuestionTool extends ToolAbstract {
    constructor(toolsService: ToolsServiceClass) {
        super(
            toolsService,
            'AI_QUESTION',
            'pytanie na które AI jest w stanie odpowiedzieć, tłumaczenie słów lub zdań na inne języki'
        );
    }

    async doAction(query: Query): Promise<AssistantAction> {
        const answer = (await aiAnswerPromptService.awswer(query.customData)) as string;

        console.log(`Ai answer: ${answer}`);

        const intent = {
            intent: { intentName: 'AiAnswer', confidenceScore: 1 },
            slots: [{ entity: 'text', value: { value: answer } }],
        };

        return EndSessionPositive(query, intent, answer);
    }
}
