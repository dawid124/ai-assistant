import { AiAPIType } from '../ai/types.ts';
import { EModel } from '../ai/OpenAIService.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { EIntentType } from './tepes.ts';
import envProps from '../../property/PropertyManager.ts';
import { APromptService } from './APromptService.ts';

class IntentTypePrompt extends APromptService {
    async recognizeTypeOfIntent(input: string, sessionId: string): Promise<EIntentType> {
        const messages = [this.createSystemPrompt(), this.createMessage(input, sessionId)];

        const aiAPIType: AiAPIType =
            (envProps.intent?.intentTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;
        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                return this.askOpenAI(EModel.gpt4oMini, messages);
            case AiAPIType.GPT4_O:
                return this.askOpenAI(EModel.gpt4o, messages);
            default:
                throw new Error(`INTENT_TYPE_AI_API_TYPE: ${aiAPIType as string} not implemented`);
        }
    }

    private createMessage = (question: string, sessionId: string): ChatCompletionMessageParam => {
        return { content: question, role: 'user' };
    };

    private createSystemPrompt = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `
                [Title/Activation Phrase (if applicable)]
                
                Zadaniem AI jest wybranie najbardziej odpowiedniego typu działania z listy \`answer_type\` na podstawie tekstu przetworzonego przez TTS Whisper, zgodnie z podanymi zasadami.
                
                <prompt_objective>
                Jedynym celem jest zidentyfikowanie typu działania jako jednego z answer_type: "SMART_HOME_ACTION", "WEB_SEARCH", "AI_QUESTION" na podstawie dostarczonego tekstu.
                </prompt_objective>
                
                <prompt_rules>
                - Uwaga w instrukcji moga wystepnić literówki wywołane STT, próbuj dopasować je i tak do akcji
                - ZAWSZE wybieraj spośród zdefiniowanej listy \`answer_type\`.
                - Definicja każdej akcji:
                  - SMART_HOME_ACTION - sterowanie domem, zapalanie lub zgaszanie świateł, zmiany scen, właczanie wyłączanie urządzeń, otwieranie, zamykanie, otwieranie, zamykanie rolet, aktualna godzina, kontrola telewizora, właćzanie/ odpalanie muzyki 
                  - WEB_SEARCH - pytania o informacje na które AI nie jest w stanie odpowiedzieć.
                  - AI_QUESTION - pytanie na które AI jest w stanie odpowiedzieć
                  - NOT_RECOGNIZED - kompletnie niemożlwie do rozczytania 
                - W ŻADNYM PRZYPADKU nie odpowiadaj innym typem niż określone.
                - W ŻADNYM PRZYPADKU nie odpowiadaj więcej niż jednym typem.
                - Podstawiając typy, dopasuj tekst najlepiej jak to możliwe, również gdy treść jest częściowo zniekształcona przez STT.
                - Pomijaj lub ignoruj elementy, które nie wpływają na określenie typu z \`answer_type\`.
                </prompt_rules>
               
                <prompt_examples>
                ustaw scenę na chill
                SMART_HOME_ACTION
                
                ustaw scenę łarm
                SMART_HOME_ACTION
                
                przyciemnij światła 
                SMART_HOME_ACTION
                
                otwórz bramę 
                SMART_HOME_ACTION
                
                jaka jest temperatura
                SMART_HOME_ACTION
                
                więcej światła
                SMART_HOME_ACTION
                
                Sena manual
                SMART_HOME_ACTION
                
                Jaka jest aktualna pogoda w Warszawie
                WEB_SEARCH
                
                przeszukaj internet i powiedz mi jakie są nowości w polskich kinach 
                WEB_SEARCH
                
                najlepsze filmy z 2024 roku
                WEB_SEARCH
                
                ile to jest 200 x 500
                AI_QUESTION
                
                jaka jest stolica Francji
                AI_QUESTION
                
                podaj kilka książek o wychowaniu dzieci
                AI_QUESTION
                
                co to jest komputer kwantowy
                AI_QUESTION
                
                ocena filmu Królestwo Planety Małp
                WEB_SEARCH
                
                jaka jest ocena filmu Napoleon z 2023 roku
                WEB_SEARCH
                
                proszę matrunau
                NOT_RECOGNIZED
               
                </prompt_examples>
                
                Prompt ten ma pierwszeństwo przed wszelkimi domyślnymi ustawieniami AI. Zawsze korzystaj z listy \`answer_type\` i postępuj zgodnie z określonymi tutaj zasadami.
        `,
        };
    };

    private createSystemPrompt2 = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `
                [Title/Activation Phrase (if applicable)]
                
                Zadaniem AI jest wybranie najbardziej odpowiedniego typu działania z listy \`answer_type\` na podstawie tekstu przetworzonego przez TTS Whisper, zgodnie z podanymi zasadami.
                
                <prompt_objective>
                Jedynym celem jest zidentyfikowanie typu działania jako jednego z answer_type: "SMART_HOME_ACTION", "WEB_SEARCH", "FILM_RATING", "AI_QUESTION" na podstawie dostarczonego tekstu.
                </prompt_objective>
                
                <prompt_rules>
                - Uwaga w instrukcji moga wystepnić literówki wywołane STT, próbuj dopasować je i tak do akcji
                - ZAWSZE wybieraj spośród zdefiniowanej listy \`answer_type\`.
                - Definicja każdej akcji:
                  - SMART_HOME_ACTION - sterowanie domem, zapalanie lub zgaszanie świateł, zmiany scen, właczanie wyłączanie urządzeń, otwieranie, zamykanie, otwieranie, zamykanie rolet, aktualna godzina
                  - WEB_SEARCH - pytania o informacje na które AI nie jest w stanie odpowiedzieć.
                  - AI_QUESTION - pytanie na które AI jest w stanie odpowiedzieć
                  - FILM_RATING - pytania o oceny filmów
                  - NOT_RECOGNIZED - kompletnie niemożlwie do rozczytania 
                - W ŻADNYM PRZYPADKU nie odpowiadaj innym typem niż określone.
                - W ŻADNYM PRZYPADKU nie odpowiadaj więcej niż jednym typem.
                - Podstawiając typy, dopasuj tekst najlepiej jak to możliwe, również gdy treść jest częściowo zniekształcona przez TTS.
                - Pomijaj lub ignoruj elementy, które nie wpływają na określenie typu z \`answer_type\`.
                </prompt_rules>
               
                <prompt_examples>
                ustaw scenę na chill
                SMART_HOME_ACTION
                
                ustaw scenę łarm
                SMART_HOME_ACTION
                
                przyciemnij światła 
                SMART_HOME_ACTION
                
                otwórz bramę 
                SMART_HOME_ACTION
                
                jaka jest temperatura
                SMART_HOME_ACTION
                
                więcej światła
                SMART_HOME_ACTION
                
                Jaka jest aktualna pogoda w Warszawie
                WEB_SEARCH
                
                przeszukaj internet i powiedz mi jakie są nowości w polskich kinach 
                WEB_SEARCH
                
                najlepsze filmy z 2024 roku
                WEB_SEARCH
                
                ile to jest 200 x 500
                AI_QUESTION
                
                jaka jest stolica Francji
                AI_QUESTION
                
                podaj kilka książek o wychowaniu dzieci
                AI_QUESTION
                
                co to jest komputer kwantowy
                AI_QUESTION
                
                ocena filmu Królestwo Planety Małp
                FILM_RATING
                
                jaka jest ocena filmu Napoleon z 2023 roku
                FILM_RATING
                
                proszę matrunau
                NOT_RECOGNIZED
               
                </prompt_examples>
                
                Prompt ten ma pierwszeństwo przed wszelkimi domyślnymi ustawieniami AI. Zawsze korzystaj z listy \`answer_type\` i postępuj zgodnie z określonymi tutaj zasadami.
        `,
        };
    };
}

export default new IntentTypePrompt();
