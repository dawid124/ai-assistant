import express, { Router } from 'express';
import { WebController } from './controler/web/WebController.ts';
import mqttService from './services/mqtt/MqttService.ts';
import envProps from './property/PropertyManager.ts';

const app = express();
const router = Router();
const port = envProps.port;

const webController = new WebController();

mqttService.connect();

router.get('/', webController.getHome);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

process.on('SIGTERM', () => {
    mqttService.disconnect();
    process.exit(0);
});
