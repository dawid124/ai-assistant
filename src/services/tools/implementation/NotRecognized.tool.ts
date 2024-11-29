import type { Query } from '../../../controler/mqtt/types.ts';
import type { AssistantAction } from '../../intent/Intent.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import { ToolsServiceClass } from '../ToolsService.ts';

export class NotRecognizedTool extends ToolAbstract {
    constructor(toolsService: ToolsServiceClass) {
        super(toolsService, 'NOT_RECOGNIZED', 'kompletnie niemożlwie do rozczytania ');
    }

    async doAction(query: Query): Promise<AssistantAction> {
        return Promise.resolve(this.notRecognized(query));
    }
}
