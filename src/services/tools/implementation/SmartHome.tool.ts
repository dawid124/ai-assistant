import type { Query } from '../../../controler/mqtt/types.ts';
import type { AssistantAction } from '../../intent/Intent.interface.ts';
import smartHomePromptService from '../prompt/SmartHomePrompt.service.ts';
import type { ISmartHomeIntent } from '../prompt/tepes.ts';
import { SmartHomeActionRedirect } from '../../intent/Action.interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import { ToolsServiceClass } from '../ToolsService.ts';

export class SmartHomeTool extends ToolAbstract {
    constructor(toolsService: ToolsServiceClass) {
        super(
            toolsService,
            'SMART_HOME_ACTION',
            'sterowanie domem, zapalanie lub zgaszanie świateł, zmiany scen, właczanie wyłączanie urządzeń, otwieranie, zamykanie, otwieranie, zamykanie rolet, aktualna godzina, kontrola telewizora, właczanie / odpalanie muzyki, playlisty muzyczne'
        );
    }

    async doAction(query: Query): Promise<AssistantAction> {
        const actionStr = await smartHomePromptService.recognize(query.customData);
        if (!actionStr) {
            return this.notRecognized(query);
        }

        const action: ISmartHomeIntent = JSON.parse(actionStr);
        if (!action || action.intentName === 'NotRecognized') {
            return this.notRecognized(query);
        }
        console.log('SmartHomeAction:', action);

        return SmartHomeActionRedirect(query, {
            slots: action.slots,
            intent: { intentName: action.intentName, confidenceScore: 1 },
        });
    }
}
