import type { Intent, Query } from '../../../../controler/mqtt/types.ts';
import { EAssistantRole, EMessageType } from '../../../intent/Intent.interface.ts';
import SmartHomePrompt, { SmartHomePromptClass } from './SmartHome.prompt.ts';
import type { ISmartHomeIntent, VoiceResponse } from './SmartHome.Interface.ts';
import { ToolAbstract } from '../Abstract.tool.ts';
import { ETaskStatus, type Task } from '../../../intent/Context.interface.ts';
import envProps from '../../../../property/Property.manager.ts';
import CorrectionPrompt, { CorrectionPromptClass } from './Correction.prompt.ts';

class SmartHomeToolClass extends ToolAbstract {
    private readonly smartHomePrompt: SmartHomePromptClass;
    private readonly correctionPrompt: CorrectionPromptClass;

    constructor(smartHomePrompt: SmartHomePromptClass, correctionPrompt: CorrectionPromptClass) {
        super(
            'SMART_HOME_ACTION',
            'sterowanie domem, zapalanie lub zgaszanie świateł, zmiany scen, ' +
                'właczanie wyłączanie urządzeń, otwieranie, zamykanie, otwieranie, zamykanie rolet, ' +
                'aktualna godzina, kontrola telewizora, właczanie / odpalanie muzyki, playlisty muzyczne'
        );
        this.smartHomePrompt = smartHomePrompt;
        this.correctionPrompt = correctionPrompt;
    }

    async doAction(task: Task, query: Query): Promise<void> {
        let action: ISmartHomeIntent;
        if (!task.cached) {
            action = JSON.parse((await this.smartHomePrompt.recognize(task.messages)) as string);
        } else {
            const cachedAction = task.data as Intent;
            action = {
                slots: cachedAction.slots,
                intentName: cachedAction.intent.intentName,
            };
        }

        if (!action || action.intentName === 'NotRecognized') {
            this.notRecognized(task, query);
            return;
        }

        console.log('SmartHomeAction:', JSON.stringify(action));

        const intent = {
            siteId: query.siteId,
            sessionId: query.sessionId,
            slots: action.slots,
            intent: { intentName: action.intentName },
        } as Intent;

        const textToSay = (await this.postAction(intent)).text;
        if (textToSay) {
            task.say = await this.correctionPrompt.correct(textToSay);
        } else {
            task.say = 'Gotowe';
        }
        console.log('SmartHomeAction text to say:', task.say);

        task.data = intent;
        task.status = ETaskStatus.COMPLETED;
        task.messages.push({
            type: EMessageType.COMPLETED,
            role: EAssistantRole.ASSISTANT,
            content: 'akcja wykonana',
        });
    }

    private async postAction(intent: Intent): Promise<VoiceResponse> {
        return await fetch(envProps.intent.smartHomeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(intent),
        }).then<VoiceResponse>(res => res.json());
    }
}

export default new SmartHomeToolClass(SmartHomePrompt, CorrectionPrompt);
