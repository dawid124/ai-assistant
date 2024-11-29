import type { Query } from '../../../controler/mqtt/types.ts';
import type { AssistantAction } from '../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import webSearchPromptService from '../prompt/WebSearchPrompt.service.ts';
import { EndSessionPositive } from '../../intent/Action.interface.ts';
import { ToolsServiceClass } from '../ToolsService.ts';

export class WebSearchTool extends ToolAbstract {
    constructor(toolsService: ToolsServiceClass) {
        super(
            toolsService,
            'WEB_SEARCH',
            'Use this tool only when you need to use search web results'
        );
    }

    async doAction(query: Query): Promise<AssistantAction> {
        const answer = (await webSearchPromptService.search(query.input as string)) as string;

        console.log(`Web search answer: ${answer}`);

        const intent = {
            intent: { intentName: 'AiWebSearchAnswer', confidenceScore: 1 },
            slots: [{ entity: 'text', value: { value: answer } }],
        };

        return EndSessionPositive(query, intent, answer);
    }
}
