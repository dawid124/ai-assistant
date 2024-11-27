import express, { Router } from 'express';
import { WebController } from './controler/web/Web.controller.ts';
import mqttService from './services/mqtt/Mqtt.service.ts';
import envProps from './property/Property.manager.ts';

const app = express();
const intentRouter = Router();
const port = envProps.port;

const webController = new WebController();

mqttService.connect();

// intentRouter.get('/', webController.getHome);
intentRouter.post('/', webController.testIntent);
app.use(express.json());
app.use('/intent', intentRouter);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

process.on('SIGTERM', () => {
    mqttService.disconnect();
    process.exit(0);
});
