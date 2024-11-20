import type { NluQueryMsg, Query } from '../../controler/mqtt/types.ts';
import intentTypePromptService from '../prompt/IntentTypePromptService.ts';
import { EIntentType, type ISmartHomeIntent } from '../prompt/tepes.ts';
import smartHomePromptService from '../prompt/SmartHomePromptService.ts';
import intentHandlingController from '../../controler/mqtt/IntentHandlingController.ts';
import aiAnswerPromptService from '../prompt/AiAnswerPromptService.ts';
import dialogueManagerController from '../../controler/mqtt/DialogueManagerController.ts';
import envProps from '../../property/PropertyManager.ts';
import webSearchPromptService from '../prompt/WebSearchPromptService.ts';

class IntentService {
    public async recognize(msg: NluQueryMsg) {
        if (
            msg.input.indexOf('koniec') > -1 ||
            msg.input.indexOf('przerwij') > -1 ||
            msg.input.indexOf('stop') > -1
        ) {
            intentHandlingController.publishNluIntentNotRecognized(msg);
            return;
        }

        try {
            console.log(`Message received: ${msg.input}`);

            const intentType = await intentTypePromptService.recognizeTypeOfIntent(
                msg.input,
                msg.sessionId
            );

            console.log(`Chosen intent type: ${intentType as string}`);

            await this.nextAction(intentType, msg);
        } catch (er) {
            console.log(er);
            // intentHandlingController.publishNluIntentNotRecognized(msg);
            this.notRecognized(msg);
        }
    }

    private async nextAction(intentType: EIntentType, msg: NluQueryMsg): Promise<void> {
        const query = {
            input: msg.input,
            sessionId: msg.sessionId,
            id: msg.id,
            siteId: msg.siteId,
            customData: msg.customData,
        };

        switch (intentType) {
            case EIntentType.SMART_HOME_ACTION:
                await this.smartHomeAction(query);
                break;
            case EIntentType.AI_QUESTION:
                await this.aiQuestion(query);
                break;
            case EIntentType.WEB_SEARCH:
                await this.webSearch(query);
                break;
            case EIntentType.NOT_RECOGNIZED:
                this.notRecognized(query);
                break;
            default:
                throw new Error(`intentType: ${intentType as string} not implemented`);
        }
    }

    private async smartHomeAction(query: Query): Promise<void> {
        // const actionStr = await smartHomePromptService.recognize(query.input);
        const actionStr = await smartHomePromptService.recognize(query.input);
        // console.log(`SmartHomeActionStr: ${actionStr as string}`);
        const action: ISmartHomeIntent = JSON.parse(actionStr);

        console.log('SmartHomeAction:', action);

        if (!action || action.intentName === 'NotRecognized') {
            // intentHandlingController.publishNluIntentNotRecognized(query);
            dialogueManagerController.publishContinueSession({
                siteId: query.siteId,
                sessionId: query.sessionId,
                text: envProps.intent.pleaseRepeat,
            });
        }

        const response = {
            ...query,
            slots: action.slots,
            intent: { intentName: action.intentName, confidenceScore: 1 },
        };

        intentHandlingController.publishNluIntentRecognized(response);
        intentHandlingController.publishIntentRecognized(response);
    }

    private async aiQuestion(query: Query): Promise<void> {
        const answer = await aiAnswerPromptService.awswer(query.input);
        console.log(`Ai answer: ${answer}`);

        const response = {
            ...query,
            slots: [{ entity: 'text', value: { value: answer } }],
            intent: { intentName: 'AiAnswer', confidenceScore: 1 },
        };

        intentHandlingController.publishNluIntentRecognized(response);
        intentHandlingController.publishIntentRecognized(response);
        dialogueManagerController.publishEndSession({
            siteId: query.siteId,
            sessionId: query.sessionId,
            text: answer,
        });
    }

    private async webSearch(query: Query) {
        const answer = await webSearchPromptService.search(query.input);

        console.log(`Web search answer: ${answer}`);

        const response = {
            ...query,
            slots: [{ entity: 'text', value: { value: answer } }],
            intent: { intentName: 'AiWebSearchAnswer', confidenceScore: 1 },
        };

        intentHandlingController.publishNluIntentRecognized(response);
        intentHandlingController.publishIntentRecognized(response);
        dialogueManagerController.publishEndSession({
            siteId: query.siteId,
            sessionId: query.sessionId,
            text: answer,
        });
    }

    private notRecognized(query: Query) {
        // if (!afterAiCorrection) {
        //     const newInput = await aiCorrectionService.correct(query.input);
        //     await this.recognize({ ...query, input: newInput }, true);
        // } else
        if (query.customData === 'NOT_RECOGNIZED') {
            intentHandlingController.publishNluIntentNotRecognized(query);
            dialogueManagerController.publishEndSession({
                siteId: query.siteId,
                sessionId: query.sessionId,
            });
        } else {
            dialogueManagerController.publishContinueSession({
                siteId: query.siteId,
                sessionId: query.sessionId,
                text: envProps.intent.pleaseRepeat,
                customData: 'NOT_RECOGNIZED',
            });
        }
    }
}

export default new IntentService();
