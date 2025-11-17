import mqttService from '../../services/mqtt/Mqtt.service.ts';
import IntentService, { IntentServiceClass } from '../../services/intent/Intent.service.ts';
import envProps from '../../property/Property.manager.ts';
import type { Intent, IntentNotRecognized, Query, TtsSay } from './types.ts';
import { type AssistantAction, EActionType } from '../../services/intent/Intent.interface.ts';
import dialogueManagerController from './Dialogue.controller.ts';

export class IntentControllerClass {
    private intentService: IntentServiceClass;

    constructor(intentService: IntentServiceClass) {
        this.intentService = intentService;
    }

    public init() {
        mqttService.subscribe(envProps.mqtt.nluQuery, message => {
            this.intentService
                .recognize(message as Query)
                .then(this.doAction.bind(this))
                .catch(console.error);
        });
    }

    private doAction(action: AssistantAction) {
        switch (action.type) {
            case EActionType.END_SESSION_NEGATIVE:
                dialogueManagerController.publishEndSession({
                    sessionId: action.sessionId,
                    customData: action.customData,
                    text: action.output + ' :',
                });
                this.publishNluIntentNotRecognized({
                    input: action.input,
                    sessionId: action.sessionId,
                    siteId: action.siteId,
                });
                break;
            case EActionType.END_SESSION_POSITIVE:
                dialogueManagerController.publishEndSession({
                    sessionId: action.sessionId,
                    customData: action.customData,
                    text: action.output + ' :',
                });
                break;
            case EActionType.CONTINUE_SESSION:
                dialogueManagerController.publishContinueSession({
                    sessionId: action.sessionId,
                    siteId: action.siteId,
                    text: action.output + ' :',
                    customData: action.customData,
                });
                break;
        }
    }

    public publishNluIntentRecognized(msg: Intent) {
        mqttService.publish(envProps.mqtt.nluIntentParsed, msg);
    }

    public publishIntentRecognized(msg: Intent) {
        mqttService.publish(envProps.mqtt.intentParsed + msg.intent.intentName, msg);
    }

    public publishNluIntentNotRecognized(msg: IntentNotRecognized) {
        mqttService.publish(envProps.mqtt.nluIntentNotRecognized, msg);
    }

    public publishTtsSay(msg: TtsSay) {
        mqttService.publish(envProps.mqtt.ttsSay, msg);
    }
}

export default new IntentControllerClass(IntentService);
