export interface IProperty {
    port: number;
    mqtt: IMqttProps;
    openapi: IOpenApiProps;
    intent: IIntentProps;
    libs: { friecrawlApiKey: string };
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

export interface IOpenApiProps {
    apiKey?: string;
}

export interface IIntentProps {
    pleaseRepeat: string;
    intentTypeApiModel: string;
    aiAnswerTypeApiModel: string;
    smartIntentTypeApiModel: string;
}
