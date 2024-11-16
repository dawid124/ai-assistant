import { APromptService } from './APromptService.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { EModel } from '../ai/OpenAIService.ts';

class AiCorrectionService extends APromptService {
    public async correct(input: string): Promise<string> {
        const messages = [this.createSystemPrompt(), this.createMessage(input)];
        return this.askOpenAI(EModel.gpt4o, messages);
    }

    private createMessage = (input: string): ChatCompletionMessageParam => {
        return { content: input, role: 'user' };
    };

    private createSystemPrompt = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `Cześć! Jestem modelem do poprawiania tekstu i pomagam w wychwytywaniu oraz korygowaniu 
            błędów w transkrypcji mowy. Otrzymałem tekst, który może zawierać przekształcone słowa, 
            literówki i inne błędy typowe dla automatycznego rozpoznawania mowy. Proszę, popraw tekst, 
            upewniając się, że jest on zgodny z zasadami języka polskiego oraz kontekstem wypowiedzi. 
            Szczególną uwagę zwróć na błędnie rozpoznane wyrazy, gramatykę i interpunkcję, 
            aby tekst wyglądał jak napisany przez człowieka.
            odpowiadzasz tylko poprawym tekstem, dostanym w inpucie, niczym innym 
        `,
        };
    };
}

export default new AiCorrectionService();
