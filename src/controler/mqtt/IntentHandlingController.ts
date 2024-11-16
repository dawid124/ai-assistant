import mqttService from '../../services/mqtt/MqttService.ts';
import intentService from '../../services/intent/IntentService.ts';
import envProps from '../../property/PropertyManager.ts';
import type { IntentNotRecognized, IntentRecognized, TtsSay } from './types.ts';

export class IntentHandlingController {
    public init() {
        mqttService.subscribe(envProps.mqtt.nluQuery, message => {
            intentService
                .recognize(message)
                .then(() => {})
                .catch(err => {
                    console.log(err);
                });
        });
    }

    public publishNluIntentRecognized(msg: IntentRecognized) {
        mqttService.publish(envProps.mqtt.nluIntentParsed, msg);
    }

    public publishIntentRecognized(msg: IntentRecognized) {
        mqttService.publish(envProps.mqtt.intentParsed + msg.intent.intentName, msg);
    }

    public publishNluIntentNotRecognized(msg: IntentNotRecognized) {
        mqttService.publish(envProps.mqtt.nluIntentNotRecognized, msg);
    }

    public publishTtsSay(msg: TtsSay) {
        mqttService.publish(envProps.mqtt.ttsSay, msg);
    }
}

export default new IntentHandlingController();
