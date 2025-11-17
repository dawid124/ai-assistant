import OpenAIService, { EModel, type openAiResponseType } from './OpenAI.service.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import OpenAI from 'openai';

export abstract class AbstractPrompt {
    protected async askOpenAI(
        model: EModel,
        messages: ChatCompletionMessageParam[],
        responseType: openAiResponseType = { type: 'text' }
    ): Promise<string | null> {
        const response: OpenAI.Chat.Completions.ChatCompletion = (await OpenAIService.completion(
            messages,
            model,
            false,
            responseType
        )) as OpenAI.Chat.Completions.ChatCompletion;

        if (!response || !response.choices) {
            throw new Error(`Answer from AI is empty model: ${model}`);
        }

        return response.choices[0]?.message?.content;
    }
}
