export interface IProperty {
    port: number;
    mqtt: IMqttProps;
    openapi: IOpenApiProps;
    qdrant: IQdrantProps;
    intent: IIntentProps;
    libs: { friecrawlApiKey: string };
    cache: ICacheProps;
    databasePath: string;
}

export interface IMqttProps {
    brokerUrl: string;
    nluQuery: string;
    nluIntentParsed: string;
    nluIntentNotRecognized: string;
    intentParsed: string;
    ttsSay: string;
    dialogueEndSession: string;
    dialogueContinueSession: string;
}

export interface ICacheProps {
    exactQueryCache: IExactCacheProps;
    actionTypeVectorCache: IActionTypeVectorCacheProps;
}

export interface IExactCacheProps {
    active: boolean;
    cacheNotRecognizeAfterCorrection: boolean;
    types: string[];
}

export interface IActionTypeVectorCacheProps {
    active: boolean;
    minScore: number;
}

export interface IOpenApiProps {
    apiKey?: string;
}

export interface IQdrantProps {
    apiKey: string;
    url: string;
}

export interface IIntentProps {
    pleaseRepeat: string;
    endSentences: string[];
    intentTypeApiModel: string;
    aiAnswerTypeApiModel: string;
    smartIntentTypeApiModel: string;
}
