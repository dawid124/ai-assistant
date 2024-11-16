import * as mqtt from 'mqtt';
import intentHandlingController from '../../controler/mqtt/IntentHandlingController.ts';
import envProps from '../../property/PropertyManager.ts';

interface MqttMessage {
    [key: string]: any;
}

interface MqttCallback {
    (message: MqttMessage): void;
}

class MqttService {
    private client: mqtt.Client | null;
    private brokerUrl: string;

    constructor() {
        this.client = null;
    }

    public connect(): void {
        this.brokerUrl = envProps.mqtt.brokerUrl;
        this.client = mqtt.connect(this.brokerUrl);

        this.client.on('connect', () => {
            intentHandlingController.init();
            console.log('Połączono z brokerem MQTT');
        });

        this.client.on('error', (error: Error) => {
            console.error('Błąd połączenia MQTT:', error);
        });
    }

    public publish(topic: string, message: MqttMessage): void {
        if (!this.client) {
            throw new Error('Klient MQTT nie jest połączony');
        }
        this.client.publish(topic, JSON.stringify(message));
    }

    public subscribe(topic: string, callback: MqttCallback): void {
        if (!this.client) {
            throw new Error('Klient MQTT nie jest połączony');
        }
        this.client.subscribe(topic);
        this.client.on('message', (receivedTopic: string, message: Buffer) => {
            if (receivedTopic === topic) {
                callback(JSON.parse(message.toString()));
            }
        });
    }

    public disconnect(): void {
        if (this.client) {
            this.client.end();
        }
    }
}

export default new MqttService();
