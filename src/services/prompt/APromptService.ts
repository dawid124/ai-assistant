import openAIService, { EModel, type openAiResponseType } from '../ai/OpenAIService.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import OpenAI from 'openai';

export abstract class APromptService {
    protected async askOpenAI(
        model: EModel,
        messages: ChatCompletionMessageParam[],
        responseType: openAiResponseType = { type: 'text' }
    ): Promise<object> {
        const response: OpenAI.Chat.Completions.ChatCompletion = await openAIService.completion(
            messages,
            model,
            false,
            responseType
        );

        if (!response || !response.choices || !response.choices.length === 0) {
            throw new Error(`Answer from AI is empty model: ${model}`);
        }

        return response.choices[0]?.message?.content;
    }
}
