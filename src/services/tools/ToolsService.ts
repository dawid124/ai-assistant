import type { Query } from '../../controler/mqtt/types.ts';
import { type ToolAbstract } from './implementation/Abstract.tool.ts';
import { ETaskStatus, type Task } from '../intent/Context.interface.ts';
import NotRecognizedTool from './implementation/not-recognized/NotRecognized.tool.ts';
import AiQuestionTool from './implementation/ai-qustion/AiQuestion.tool.ts';
import SendTelegramTool from './implementation/send-telegram/SendTelegram.tool.ts';
import ShowOnTvTool from './implementation/show-on-tv/ShowOnTv.tool.ts';
import SmartHomeTool from './implementation/smart-home/SmartHome.tool.ts';
import WebSearchTool from './implementation/web-search/WebSearch.tool.ts';

export class ToolsServiceClass {
    private _tools: Record<string, ToolAbstract>;
    private _toolsDescription: Record<string, string>;

    constructor(toolsClasses: ToolAbstract[]) {
        this._tools = {};
        this._toolsDescription = {};
        toolsClasses.forEach(tool => {
            tool.init(this);
        });
    }

    addTool(toolName: string, description: string, tool: ToolAbstract): void {
        this._tools[toolName] = tool;
        this._toolsDescription[toolName] = description;
    }

    async doAction(task: Task, query: Query): Promise<void> {
        const tool = this._tools[task.tool];
        if (tool) {
            try {
                await tool.doAction(task, query);
            } catch (ex) {
                task.status = ETaskStatus.TERMINATED;
            }
        } else {
            console.error(`Tool ${task.tool} not found. Input: ${query.input}`);
            task.status = ETaskStatus.TERMINATED;
            task.say = 'Wybrane narzędzie nie jest jeszcze zaimplementowane';
        }
    }

    get toolsDescription(): Record<string, string> {
        return this._toolsDescription;
    }
}

export default new ToolsServiceClass([
    NotRecognizedTool,
    SmartHomeTool,
    AiQuestionTool,
    WebSearchTool,
    SendTelegramTool,
    ShowOnTvTool,
]);
