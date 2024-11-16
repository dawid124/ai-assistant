import mqttService from '../../services/mqtt/MqttService.ts';
import envProps from '../../property/PropertyManager.ts';
import type { DialogueContinueSession, DialogueEndSession } from './types.ts';

export class DialogueManagerController {
    public init() {}

    public publishEndSession(msg: DialogueEndSession) {
        mqttService.publish(envProps.mqtt.dialogueEndSession, msg);
    }

    public publishContinueSession(msg: DialogueContinueSession) {
        mqttService.publish(envProps.mqtt.dialogueContinueSession, msg);
    }
}

export default new DialogueManagerController();
