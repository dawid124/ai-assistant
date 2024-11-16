import dotenv from 'dotenv';
import type { IProperty } from './types.ts';

dotenv.config({ path: './../.env' });

const envProps: IProperty = {
    port: Number(process.env.APP_PORT) || 9090,
    mqtt: {
        brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
        nluQuery: process.env.MQTT_NLU_QUERY || 'hermes/nlu/query',
        nluIntentParsed: process.env.MQTT_NLU_INTENT_PARSED || 'hermes/nlu/intentParsed',
        nluIntentNotRecognized:
            process.env.MQTT_NLU_INTENT_NOT_RECOGNIZED || 'hermes/nlu/intentNotRecognized',
        intentParsed: process.env.MQTT_INTENT_PARSED || 'hermes/intent/',
        ttsSay: process.env.MQTT_TTS_SAY || 'hermes/tts/say',
        dialogueEndSession:
            process.env.MQTT_DIALOGUE_END_SESSION || 'hermes/dialogueManager/endSession',
        dialogueContinueSession:
            process.env.MQTT_DIALOGUE_CONTINUE_SESSION || 'hermes/dialogueManager/continueSession',
    },
    openapi: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    libs: {
        friecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    },
    intent: {
        pleaseRepeat: process.env.INTENT_PLEASE_REPEAT,
        intentTypeApiModel: process.env.INTENT_TYPE_AI_API_TYPE,
        smartIntentTypeApiModel: process.env.SMART_HOME_INTENT_TYPE_AI_API_TYPE,
        aiAnswerTypeApiModel: process.env.AI_ASNWER_TYPE_AI_API_TYPE,
    },
};

export default envProps;
