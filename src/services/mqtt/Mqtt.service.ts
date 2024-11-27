import mqtt, { type MqttClient } from 'mqtt';
import intentHandlingController from '../../controler/mqtt/Intent.controller.ts';
import envProps from '../../property/Property.manager.ts';

export interface MqttMessage {
    [key: string]: any;
}

interface MqttCallback {
    (message: MqttMessage): void;
}

class MqttService {
    private client: MqttClient | null;
    private brokerUrl: string = '';

    constructor() {
        this.client = null;
    }

    public connect(): void {
        this.brokerUrl = envProps.mqtt.brokerUrl;
        this.client = mqtt.connect(this.brokerUrl);

        this.client.on('connect', () => {
            intentHandlingController.init();
        });

        this.client.on('error', (error: Error) => {
            console.error('Error on MQTT connection:', error);
        });
    }

    public publish(topic: string, message: MqttMessage): void {
        if (!this.client) {
            throw new Error('MQTT Client not connected');
        }
        this.client.publish(topic, JSON.stringify(message));
    }

    public subscribe(topic: string, callback: MqttCallback): void {
        if (!this.client) {
            throw new Error('MQTT Client not connected');
        }
        this.client.subscribe(topic);
        this.client.on('message', (receivedTopic: string, message: Buffer) => {
            if (receivedTopic === topic) {
                try {
                    callback(JSON.parse(message.toString()) as MqttMessage);
                } catch (error) {
                    console.error(`Error parsing msg on topic: "${receivedTopic}":`, error);
                }
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
