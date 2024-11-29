import { AiAPIType } from '../../ai/OpenAi.interface.ts';
import envProps from '../../../property/Property.manager.ts';
import { EModel } from '../../ai/OpenAI.service.ts';
import { AbstractPromptService } from './AbstractPrompt.service.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { EAssistantRole, type MessageHistory } from '../../intent/Intent.interface.ts';
import UserDataService, { UserDataServiceClass } from '../../data/UserData.service.ts';

class SmartHomePromptService extends AbstractPromptService {
    private _userDataService: UserDataServiceClass;

    constructor(userDataService: UserDataServiceClass) {
        super();
        this._userDataService = userDataService;
    }

    async recognize(history?: MessageHistory[]) {
        const messages: ChatCompletionMessageParam[] = [
            this.createSystemPrompt(),
            // @ts-expect-error correct role type mapping
            ...(history
                ?.filter(item => EAssistantRole.SYSTEM !== item.role)
                .map(item => ({ content: item.content, role: item.role })) || {}),
        ];

        const aiAPIType: AiAPIType =
            (envProps.intent.intentTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;
        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                return this.askOpenAI(EModel.gpt4oMini, messages, { type: 'json_object' });
            case AiAPIType.GPT4_O:
                return this.askOpenAI(EModel.gpt4o, messages, { type: 'json_object' });
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
[Convert TTS Whisper Text to Smart Home JSON Commands]

<prompt_objective>
Konwersja tekstu pobranego z TTS Whisper na akcje smart home w formacie JSON, zgodnie z ustaloną składnią.
</prompt_objective>

<prompt_rules>
- Odpowiadaj wyłącznie w formacie JSON: { "intentName": "<wybrana akcja>", "slots": [ {"entity": "<nazwa_wartości>", "value": { "value": <wartości> } }, ... ]}
- Rozpoznaj i popraw literówki w tekście przed dokonaniem konwersji.
- Poprawnie mapuj tekst na zapisy JSGF. Składnia JSGF jest obowiązkowa dla dopasowań.
- Podczas rozpoznawania, jeśli tekst nie pasuje do żadnej z kategorii, zwróć: { "intentName": "NotRecognized",  "slots": [] }
- Jeśli wykryta jest niepełna lub niejednoznaczna komenda, podaj jak najbardziej zbliżoną, zgodną z JSGF akcję.
- Ignoruj wszelkie inne formaty odpowiedzi, które nie są JSON.
</prompt_rules>

<JSGF>
${this._userDataService.sentences}
</JSGF>

<prompt_examples>
${this._userDataService.smartHomeExamples}
</prompt_examples>

Upewnij się, że format JSON jest odpowiednio dostosowany, zgodnie z powyższymi zasadami i przykładami.
        `,
        };
    };
}

export default new SmartHomePromptService(UserDataService);
