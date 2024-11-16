import { AiAPIType } from '../ai/types.ts';
import envProps from '../../property/PropertyManager.ts';
import { EModel } from '../ai/OpenAIService.ts';
import { APromptService } from './APromptService.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

class SmartHomePromptService extends APromptService {
    async recognize(input: string) {
        const messages = [this.createSystemPrompt(), this.createMessage(input)];

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
                [GetTime]
                która godzina
                
                [GetTemperature]
                jaka jest temperatura [w pokoju | w pomieszczeniu]
                
                [GetGarageState]
                czy brama garażowa jest otwarta
                czy drzwi garażu są zamknięte
                
                [ChangeIdLightOnOff]
                ioId = (TV:group-tv | przy tv:group-tv | iwi:group-tv | kuchni:group-kitchen | jadalni:group-dinner | jadalnia:group-dinner | ściana:group-wall) {ioId}
                mode = (wyłącz:off | zgaś:off | zapal:on | włącz:on) {mode}
                
                <mode> (oświetlenie | światło) [w] <ioId>
                
                
                [ChangeScene]
                scene_name = (noc:night | tiwi:tv | iwi:tv | manual:manual | czil:warm | chill:warm | chil:war | auto:auto | ałto:auto) {name}
                
                (scenę | scene | scena | szena) <scene_name>
                (ustaw | zmień ) (scenę | scene | scena | szena) [na] <scene_name>
                
                [ChangeAllLight]
                percent = (0..100) {percent}
                
                [ustaw] (oświetlenie | światło) [na] <percent> [procent] 
                [zmień] (oświetlenie | światło) [na] <percent> [procent] 
                
                [IncreaseLight]
                percent = (0..100) {percent}
                
                więcej światła (){percent:20}
                (rozjaśnij| zwiększ) (oświetlenie | światło | scenę) (){percent:30}
                
                
                [DecreaseLight]
                percent = (0..100) {percent}
                
                (mniej | miej) (światła | szatła) (){percent:20}
                (przyciemnij | zmniejsz) (oświetlenie | światło | scenę) (){percent:30}
                
                [MacroRun]
                otwórz (bramę | brame) {id:door-entry-gate-macro}
                
                [MacroRun]
                otwórz (furtkę | furtke) {id:door-gateway-hold-macro}
                
                [MacroRun]
                (Ustaw | Włącz) okap {id:cookerHood-15m-macro}
                
                [MacroRun]
                (Ustaw | Włącz) (cyrkulacje | wode) {id:hotWaterPump-5m-macro}
                
                [MoveBlind]
                rolety [w] (dół:DIM_DOWN| górę:DIM_UP){mode} (){percent:25}
                
                [MoveBlind]
                percent= (1..100) {percent}
                rolety [o] <percent> w (dół:DIM_DOWN| górę:DIM_UP){mode}
                
                [MoveBlind]
                (zasłoń:DIM_DOWN| odsłoń:DIM_UP) {mode} rolety {percent:100}
                
                [MoveBlind]
                opuść rolety {mode:DOWN}
                podnieś rolety {mode:UP}
                
                [Timer]
                minutes = (1..59) {minutes}
                [Ustaw] (stoper | timer) na <minutes> minut
                
                [MacroRun]
                macroId= (lajtowe:tv-spotify-play-lajtowe | polskie:tv-spotify-play-polskie | rap:tv-spotify-play-rap | hiphop:tv-spotify-play-rap | techno:tv-spotify-play-techno | trance:tv-spotify-play-trance | calssic trance:tv-spotify-play-classic-trance | party:tv-spotify-play-party) {id}
                (odpal | puść | włącz) [muzykę] <macroId>
                
                [MacroRun]
                losowe odtwarzanie [dla] spotify {id:tv-spotify-random}

                [MacroRun]
                (odpal | puść | włącz) [muzykę] {id:tv-spotify-play-lajtowe}
                
                [MacroRun]
                wyłącz TV {id:tv-sleep}
                
                [MacroRun]
                włącz TV {id:tv-wake-up}

                </JSGF>
                
                <prompt_examples>
                USER: scena manual
                AI:  { "intentName": "ChangeScene",  "slots": [ {"entity": "name", "value": { "value": "manual" } } ]}
                
                USER: włącz scenę auto
                AI:  { "intentName": "ChangeScene",  "slots": [ {"entity": "name", "value": { "value": "auto" } } ]}
                
                USER: ustaw scenę chill
                AI:  { "intentName": "ChangeScene",  "slots": [ {"entity": "name", "value": { "value": "warm" } } ]}
                
                USER: scena warm
                AI:  { "intentName": "ChangeScene",  "slots": [ {"entity": "name", "value": { "value": "warm" } } ]}
                
                USER: jaka jest temperatura
                AI:  { "intentName": "GetTemperature",  "slots": [ ]}
                
                USER: otwórz bramę 
                AI:  { "intentName": "MacroRun",  "slots": [ {"entity": "id", "value": { "value": "door-entry-gate-macro" } } ]}
                
                USER: rozjaśnij światło o 30 procent
                AI:  { "intentName": "IncreaseLight",  ""slots"": [ {"entity": "percent", "value": { "value": 30 } } ]}
                </prompt_examples>
                
                Upewnij się, że format JSON jest odpowiednio dostosowany, zgodnie z powyższymi zasadami i przykładami.
        `,
        };
    };
}

export default new SmartHomePromptService();
