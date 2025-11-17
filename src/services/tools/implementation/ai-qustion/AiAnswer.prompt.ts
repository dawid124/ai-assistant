import { AiAPIType } from '../../../ai/OpenAi.interface.ts';
import envProps from '../../../../property/Property.manager.ts';
import { EModel } from '../../../ai/OpenAI.service.ts';
import { AbstractPrompt } from '../../../ai/Abstract.prompt.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { MessageHistory } from '../../../intent/Intent.interface.ts';
import { currentDateTime } from '../../../../util/utils.ts';

export class AiAnswerPromptClass extends AbstractPrompt {
    public async awswer(history?: MessageHistory[]): Promise<string | null> {
        const messages: ChatCompletionMessageParam[] = [
            this.createSystemPrompt(),
            // @ts-expect-error correct role type mapping
            ...history.map(item => ({ content: item.content, role: item.role })),
        ];

        const aiAPIType: AiAPIType = (envProps.intent?.aiAnswerTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;
        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                return this.askOpenAI(EModel.gpt4oMini, messages);
            case AiAPIType.GPT4_O:
                return this.askOpenAI(EModel.gpt4o, messages);
            default:
                throw new Error(`INTENT_TYPE_AI_API_TYPE: ${aiAPIType as string} not implemented`);
        }
    }

    public async understand(history?: MessageHistory[]): Promise<string | null> {
        const messages: ChatCompletionMessageParam[] = [
            this.createSystemPrompt(),
            // @ts-expect-error correct role type mapping
            ...history.map(item => ({ content: item.content, role: item.role })),
        ];

        const aiAPIType: AiAPIType = (envProps.intent?.aiAnswerTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;
        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                return this.askOpenAI(EModel.gpt4oMini, messages);
            case AiAPIType.GPT4_O:
                return this.askOpenAI(EModel.gpt4o, messages);
            default:
                throw new Error(`INTENT_TYPE_AI_API_TYPE: ${aiAPIType as string} not implemented`);
        }
    }

    private createSystemPrompt = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `
               [Prompt for Concise Text Responses]

                <prompt_objective>
                AI ma odpowiadać na pytania w krótkim zdaniu, w formie tekstowej.
                </prompt_objective>
                
                <prompt_rules>
                - AI nigdy nie podaje linków.
                - AI nigdy nie zwraca obrazów.
                - AI nigdy nie zwraca więcej niż 100 wyrazów.
                - AI ma priorytet w odpowiadaniu w formie krótkiej i tekstowej, z nadpisaniem wszelkich domyślnych zachowań.
                - Current location is: ${envProps.user.location}
                - Current time is: ${currentDateTime()}
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

export default new AiAnswerPromptClass();
