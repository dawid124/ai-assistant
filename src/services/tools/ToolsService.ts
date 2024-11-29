import type { Query } from '../../controler/mqtt/types.ts';
import { notRecognized, type ToolAbstract } from './Abstract.tool.ts';
import { type AssistantAction } from '../intent/Intent.interface.ts';
import { EndSessionNegative } from '../intent/Action.interface.ts';
import { SmartHomeTool } from './implementation/SmartHome.tool.ts';
import { AiQuestionTool } from './implementation/AiQuestion.tool.ts';
import { WebSearchTool } from './implementation/WebSearch.tool.ts';
import { NotRecognizedTool } from './implementation/NotRecognized.tool.ts';

export class ToolsServiceClass {
    private _tools: Record<string, ToolAbstract>;
    private _toolsDescription: Record<string, string>;

    constructor() {
        this._tools = {};
        this._toolsDescription = {};
    }

    addTool(toolName: string, description: string, tool: ToolAbstract): void {
        this._tools[toolName] = tool;
        this._toolsDescription[toolName] = description;
    }

    async doAction(toolName: string, query: Query): Promise<AssistantAction> {
        const tool = this._tools[toolName];
        if (tool) {
            try {
                return await tool.doAction(query);
            } catch (ex) {
                return notRecognized(query);
            }
        } else {
            console.error(`Tool ${toolName} not found. Input: ${query.input}`);
            return EndSessionNegative(query, 'Akcja nie została jeszcze zaimplementowana');
        }
    }

    get toolsDescription(): Record<string, string> {
        return this._toolsDescription;
    }
}

const toolsService = new ToolsServiceClass();

new SmartHomeTool(toolsService);
new AiQuestionTool(toolsService);
new WebSearchTool(toolsService);
new NotRecognizedTool(toolsService);

export default toolsService;
