import dotenv from 'dotenv';
import type { IProperty } from './Property.interface.ts';

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
    qdrant: {
        url: process.env.QDRANT_URL || '',
        apiKey: process.env.QDRANT_API_KEY || '',
    },
    libs: {
        friecrawlApiKey: process.env.FIRECRAWL_API_KEY || '',
    },
    intent: {
        pleaseRepeat: process.env.INTENT_PLEASE_REPEAT || '',
        intentTypeApiModel: process.env.INTENT_TYPE_AI_API_TYPE || '',
        smartIntentTypeApiModel: process.env.SMART_HOME_INTENT_TYPE_AI_API_TYPE || '',
        aiAnswerTypeApiModel: process.env.AI_ASNWER_TYPE_AI_API_TYPE || '',
        endSentences: process.env.INTENT_END_SENTANCES
            ? process.env.INTENT_END_SENTANCES.split(',')
            : [],
    },
    databasePath: process.env.DATABASE_PATH || './../data',
    cache: {
        exactQueryCache: {
            active: process.env.EXACT_QUERY_CACHE_ACTIVE === 'true',
            types: process.env.EXACT_QUERY_CACHE_TYPES
                ? process.env.EXACT_QUERY_CACHE_TYPES.split(',')
                : ['SMART_HOME_ACTION_REDIRECT'],
            cacheNotRecognizeAfterCorrection:
                process.env.EXACT_QUERY_CACHE_CACHE_NOT_RECOGNIZE_AFTER_CORRECTION === 'true',
        },
        actionTypeVectorCache: {
            active: process.env.ACTION_TYPE_VECTOR_CACHE_ACTIVE === 'true',
            minScore: process.env.ACTION_TYPE_VECTOR_CACHE_MIN_SCORE
                ? Number(process.env.ACTION_TYPE_VECTOR_CACHE_MIN_SCORE)
                : 0.9,
        },
    },
};

export default envProps;
