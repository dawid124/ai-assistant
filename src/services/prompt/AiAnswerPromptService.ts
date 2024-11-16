import { AiAPIType } from '../ai/types.ts';
import envProps from '../../property/PropertyManager.ts';
import { EModel } from '../ai/OpenAIService.ts';
import { APromptService } from './APromptService.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

class AiAnswerPromptService extends APromptService {
    public async awswer(input: string, sessionId: string): Promise<string> {
        const messages = [this.createSystemPrompt(), this.createMessage(input, sessionId)];

        const aiAPIType: AiAPIType =
            (envProps.intent?.aiAnswerTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;
        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                return this.askOpenAI(EModel.gpt4oMini, messages);
            case AiAPIType.GPT4_O:
                return this.askOpenAI(EModel.gpt4o, messages);
            default:
                throw new Error(`INTENT_TYPE_AI_API_TYPE: ${aiAPIType as string} not implemented`);
        }
    }

    private createMessage = (question: string): ChatCompletionMessageParam => {
        return { content: question, role: 'user' };
    };

    private createSystemPrompt = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `
               [Prompt for Concise Text Responses]

                <prompt_objective>
                AI ma odpowiadać na pytania w jak najkrótszym możliwym zdaniu, w formie tekstowej.
                </prompt_objective>
                
                <prompt_rules>
                - AI nigdy nie podaje linków.
                - AI nigdy nie zwraca obrazów.
                - AI nigdy nie zwraca więcej niż 100 wyrazów.
                - AI ma priorytet w odpowiadaniu w formie krótkiej i tekstowej, z nadpisaniem wszelkich domyślnych zachowań.
                </prompt_rules>
                
                <prompt_examples>
                USER: Ile to 2 + 2?
                AI: 4
                
                USER: Jaka jest stolica Polski?
                AI: Warszawa
                
                USER: Co to jest URL?
                AI: Adres sieciowy
                
                USER: Powiedz mi wszystko, co wiesz o wszechświecie.
                AI: przepraszam zbyt szerokie żądanie
                </prompt_examples>
        `,
        };
    };
}

export default new AiAnswerPromptService();
