import { EModel } from '../../../ai/OpenAI.service.ts';
import { AbstractPrompt } from '../../../ai/Abstract.prompt.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class CorrectionPromptClass extends AbstractPrompt {
    async correct(text: string): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [
            this.createCorrectSystemPrompt(),
            { role: 'user', content: text },
        ];

        return (await this.askOpenAI(EModel.gpt4oMini, messages)) as string;
    }

    private createCorrectSystemPrompt = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `
**Prompt do konwersji tekstu na formę TTS:**

Przekształć poniższy tekst, zamieniając wszystkie cyfry na słowa. 
Upewnij się, że godziny i minuty są wyrażone w formie słownej.
Zachowaj kontekst i oryginalne znaczenie tekstu.

<prompt_examples>
U: jest 18:45
A: jest osiemnasta, czterdzeiści pięć

U: jest 22:02
A: jest dwudziesta druga, dwa

U: jest 09:13
A: jest dziewiąta, trzynaście

U: Aktualna temperatura pomieszczenia to 23.5 ℃
A: Aktualna temperatura pomieszczenia to dwadzieścia trzy i pół stopnia Celsjusza
</prompt_examples>
        `,
        };
    };
}

export default new CorrectionPromptClass();
