import { AiAPIType } from '../ai/OpenAi.interface.ts';
import { EModel } from '../ai/OpenAI.service.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { type EIntentType } from './tepes.ts';
import envProps from '../../property/Property.manager.ts';
import { AbstractPromptService } from './AbstractPrompt.service.ts';
import ActionTypeVectorCache, {
    ActionTypeVectorCacheClass,
} from '../cache/ActionTypeVector.cache.ts';

export type IntentTypeRecognizeType = (input: string) => Promise<EIntentType>;

export class IntentTypePromptClass extends AbstractPromptService {
    private actionTypeVectorCache: ActionTypeVectorCacheClass;

    constructor(actionTypeVectorCache: ActionTypeVectorCacheClass) {
        super();
        this.actionTypeVectorCache = actionTypeVectorCache;
    }

    async recognizeTypeOfIntent(input: string): Promise<EIntentType> {
        return this.actionTypeVectorCache.wrap(input, (input: string) => {
            const start: number = new Date().getMilliseconds();
            const eIntentTypePromise = this._recognizeTypeOfIntent.bind(this)(input);
            console.log(
                `IntentTypeRecognizeType get time: ${new Date().getMilliseconds() - start}`
            );
            return eIntentTypePromise;
        });
    }

    private async _recognizeTypeOfIntent(input: string): Promise<EIntentType> {
        const messages = [this.createSystemPrompt(), this.createMessage(input)];

        const aiAPIType: AiAPIType =
            (envProps.intent?.intentTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;

        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                return this.askOpenAI(EModel.gpt4oMini, messages) as Promise<EIntentType>;
            case AiAPIType.GPT4_O:
                return this.askOpenAI(EModel.gpt4o, messages) as Promise<EIntentType>;
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
                Zadaniem AI jest wybranie najbardziej odpowiedniego typu działania na podstawie tekstu przetworzonego przez TTS Whisper, zgodnie z podanymi zasadami.
                
                <prompt_rules>
                - Uwaga w instrukcji moga wystepnić literówki wywołane STT, próbuj dopasować je i tak do akcji
                - ZAWSZE wybieraj spośród zdefiniowanej listy 'answer_type':
                  - SMART_HOME_ACTION - sterowanie domem, zapalanie lub zgaszanie świateł, zmiany scen, właczanie wyłączanie urządzeń, otwieranie, zamykanie, otwieranie, zamykanie rolet, aktualna godzina, kontrola telewizora, właczanie / odpalanie muzyki, playlisty muzyczne
                  - WEB_SEARCH - pytania o informacje na które AI nie jest w stanie odpowiedzieć.
                  - AI_QUESTION - pytanie na które AI jest w stanie odpowiedzieć, tłumaczenie słów lub zdań na inne języki 
                  - NOT_RECOGNIZED - kompletnie niemożlwie do rozczytania 
                - W ŻADNYM PRZYPADKU nie odpowiadaj innym typem niż określone.
                - W ŻADNYM PRZYPADKU nie odpowiadaj więcej niż jednym typem.
                - Pomijaj lub ignoruj elementy, które nie wpływają na określenie typu
                </prompt_rules>
               
                <prompt_examples>
                ustaw scenę na chill, cena  auto, ustaw scenę łarm, przyciemnij światła, otwórz bramę, jaka jest temperatura, więcej światła, Sena manual, Sena manual, włącz spotify playlista polskie, Przecież telewizor
                SMART_HOME_ACTION
                
                Jaka jest aktualna pogoda w Warszawie, przeszukaj internet i powiedz mi jakie są nowości w polskich kinach, najlepsze filmy z 2024 roku, ocena filmu Królestwo Planety Małp
                WEB_SEARCH
                
                ile to jest 200 x 500, opowiedz jakiś żart, jaka jest stolica Francji, podaj kilka książek o wychowaniu dzieci, przetłumacz na angielski, co oznacza po angielsku słowo memory
                AI_QUESTION

                sante matrunau
                NOT_RECOGNIZED
               
                errorfailed to read audio file
                NOT_RECOGNIZED
                </prompt_examples>
                
                Prompt ten ma pierwszeństwo przed wszelkimi domyślnymi ustawieniami AI. Zawsze korzystaj z listy 'answer_type' i postępuj zgodnie z określonymi tutaj zasadami.
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
                Jedynym celem jest zidentyfikowanie typu działania jako jednego z answer_type: "SMART_HOME_ACTION", "WEB_SEARCH", "AI_QUESTION" na podstawie dostarczonego tekstu.
                </prompt_objective>
                
                <prompt_rules>
                - Uwaga w instrukcji moga wystepnić literówki wywołane STT, próbuj dopasować je i tak do akcji
                - ZAWSZE wybieraj spośród zdefiniowanej listy \`answer_type\`.
                - Definicja każdej akcji:
                  - SMART_HOME_ACTION - sterowanie domem, zapalanie lub zgaszanie świateł, zmiany scen, właczanie wyłączanie urządzeń, otwieranie, zamykanie, otwieranie, zamykanie rolet, aktualna godzina, kontrola telewizora, właczanie / odpalanie muzyki 
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
}

export default new IntentTypePromptClass(ActionTypeVectorCache);
