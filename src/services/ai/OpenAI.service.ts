import OpenAI from 'openai';
import type { CreateEmbeddingResponse } from 'openai/resources/embeddings';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type {
    ResponseFormatJSONObject,
    ResponseFormatJSONSchema,
    ResponseFormatText,
} from 'openai/resources/shared';
import envProps from '../../property/Property.manager.ts';

export enum EModel {
    gpt4 = 'gpt-4',
    gpt4o = 'gpt-4o',
    gpt4oMini = 'gpt-4o-mini',
    gpt35turbo = 'gpt-3.5-turbo',
}

export type openAiResponseType =
    | ResponseFormatText
    | ResponseFormatJSONObject
    | ResponseFormatJSONSchema;

export class OpenAIServiceClass {
    private readonly openai: OpenAI;
    private apiKey: string;

    constructor() {
        this.apiKey = envProps.openapi.apiKey || '';
        this.openai = new OpenAI();
    }

    async completion(
        messages: ChatCompletionMessageParam[],
        model: string = 'gpt-4',
        stream: boolean = false,
        responseType: openAiResponseType = { type: 'text' }
    ): Promise<
        | OpenAI.Chat.Completions.ChatCompletion
        | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
    > {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages,
                model,
                stream,
                response_format: responseType,
            });

            if (stream) {
                return chatCompletion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
            } else {
                return chatCompletion as OpenAI.Chat.Completions.ChatCompletion;
            }
        } catch (error) {
            console.error('Error in OpenAI completion:', error);
            throw error;
        }
    }

    async createEmbedding(text: string): Promise<number[]> {
        try {
            const response: CreateEmbeddingResponse = await this.openai.embeddings.create({
                model: 'text-embedding-3-large',
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('Error creating embedding:', error);
            throw error;
        }
    }
}

export default new OpenAIServiceClass();
