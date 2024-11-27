import mqttService from '../../services/mqtt/Mqtt.service.ts';
import envProps from '../../property/Property.manager.ts';
import type { DialogueContinueSession, DialogueEndSession } from './types.ts';

export class DialogueController {
    public init() {}

    public publishEndSession(msg: DialogueEndSession) {
        mqttService.publish(envProps.mqtt.dialogueEndSession, msg);
    }

    public publishContinueSession(msg: DialogueContinueSession) {
        mqttService.publish(envProps.mqtt.dialogueContinueSession, msg);
    }
}

export default new DialogueController();
