import { AiAPIType } from '../ai/OpenAi.interface.ts';
import { EModel } from '../ai/OpenAI.service.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import envProps from '../../property/Property.manager.ts';
import { AbstractPrompt } from '../ai/Abstract.prompt.ts';
import toolsService from '../tools/ToolsService.ts';
import { ETaskStatus, type SessionContext } from './Context.interface.ts';
import MemoryService from '../data/Memory.service.ts';
import { EAssistantRole, EMessageType } from './Intent.interface.ts';

export class SessionPlanPromptClass extends AbstractPrompt {
    constructor() {
        super();
    }

    async createPlan(input: string, siteId: string): Promise<SessionContext> {
        const messages = [this.createSystemPrompt(), ...this.createPrevContext(siteId), this.createMessage(input)];

        const aiAPIType: AiAPIType = (envProps.intent?.intentTypeApiModel as AiAPIType) || AiAPIType.GPT4_O_MINI;

        let plan: SessionContext;
        switch (aiAPIType) {
            case AiAPIType.GPT4_O_MINI:
                plan = JSON.parse(
                    (await this.askOpenAI(EModel.gpt4oMini, messages, {
                        type: 'json_object',
                    })) as string
                );
                break;
            case AiAPIType.GPT4_O:
                plan = JSON.parse(
                    (await this.askOpenAI(EModel.gpt4o, messages, {
                        type: 'json_object',
                    })) as string
                );
                break;
            default:
                throw new Error(`INTENT_TYPE_AI_API_TYPE: ${aiAPIType as string} not implemented`);
        }

        plan.current = 0;
        for (const task of plan.tasks) {
            task.status = ETaskStatus.CREATED;
            task.siteId = siteId;
            task.createdDate = new Date();
            task.messages = [
                {
                    type: EMessageType.USER_REQUESTED,
                    content: task.query,
                    role: EAssistantRole.USER,
                },
            ];
        }

        return plan;
    }

    private createPrevContext(siteId: string) {
        let messages: ChatCompletionMessageParam[] = [];
        for (const task of MemoryService.getLast3Min(siteId)) {
            messages = [...task.messages.map(item => ({ content: item.content, role: item.role })), ...messages];
        }
        return messages;
    }

    private createMessage = (question: string): ChatCompletionMessageParam => {
        return { content: question, role: 'user' };
    };

    private createSystemPrompt = (): ChatCompletionMessageParam => {
        return {
            role: 'system',
            content: `
The task of the AI is to choose the most appropriate type of action based on the text processed by TTS Whisper, in accordance with the provided rules.

<prompt_rules>
- GENERATE a JSON object with the structure: {"_thinking": string, "tasks": [{"tool": string, "query": string, "text": string}]}
- ALWAYS focus on the latest user message while considering the conversation context, especially if the latest message requires interpretation of previous ones.
- ALWAYS if you use prevous context add json field: "usedPrevContext": true 
- AVOID duplicating actions unnecessarily; ensure that actions already covered in previous messages are not repeated.
- FORMULATE queries as self-commands (e.g., "extract ... from ..." or "translate ... to ..." or "upload ... to ..." or "answer ... based on ..." or "search for ...", etc.)
- ENSURE the "_thinking" field explains the analysis and reasoning process
- INCLUDE ALL mentioned details in the queries
- USE ONLY the tools provided in the <tools> section
- UNDER NO CIRCUMSTANCES respond with a type other than the specified one.
- ALLWAYS return min one task!!!
- OMIT or ignore elements that do not impact the determination of the type
- Note that there may be typos in the instruction caused by STT; try to adjust them accordingly to the actions
</prompt_rules>

<prompt_examples>
U: jaka jest temperatura
A: {"_thinking": "sterowanie domem", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "jaka jest temperatura"}]}

U: więcej światła
A: {"_thinking": "Użytkownik prosi o zwiększenie ilości światła, co wskazuje na sterowanie oświetleniem w domu.", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "więcej światła"}]}

U: Zmień scenę na manual i przyszłoń rolety o 50%
A: {"_thinking": "Użytkownik prosi o zmianę sceny na manual, co jest działaniem związanym z systemem sterowania domem.", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "Zmień scenę na manual"}, {"tool": "SMART_HOME_ACTION", "query": "przysłoń rolety o 50%"}]}

U: przy ziemni trochę światło
A: {"_thinking": "chodziło za pewne o przyciemnienie światła, co sugeruje kontekst sterowania domem.", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "przyciemnij trochę światło"}]}

U: cena manual
A: {"_thinking": "Choć zapytanie o 'cenę manual' jest zbyt ogólne, zawiera słowo 'manual', co sugeruje kontekst sterowania domem.", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "Zmień scenę na manual"}]}

U: włącz spotify playlista polskie
A: {"_thinking": "Użytkownik prosi o uruchomienie playlisty w Spotify, co jest związane ze sterowaniem muzyką.", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "włącz Spotify, playlista polskie"}]}

U: Przycisz telewizor
A: {"_thinking": "Użytkownik chce zmniejszyć głośność telewizora, co wskazuje na akcję związaną ze sterowaniem telewizorem.", "tasks": [{"tool": "SMART_HOME_ACTION", "query": "Przycisz telewizor"}]}



U: Jaka jest aktualna pogoda w Warszawie
A: {"_thinking": "Użytkownik pyta o aktualną pogodę w Warszawie, co wymaga przeszukania internetu.", "tasks": [{"tool": "WEB_SEARCH", "query": "aktualna pogoda w Warszawie"}]}

U: przeszukaj internet i powiedz mi jakie są nowości w polskich kinach
A: {"_thinking": "Użytkownik prosi o przeszukanie internetu w celu uzyskania informacji o nowościach w polskich kinach.", "tasks": [{"tool": "WEB_SEARCH", "query": "nowości w polskich kinach"}]}

U: opowiedz jakiś żart
A: {"_thinking": "Użytkownik prosi o opowiedzenie żartu, co mogę zrobić bez korzystania z internetu.", "tasks": [{"tool": "AI_QUESTION", "query": "opowiedz jakiś żart"}]}

U: znajdź nowości w polskich kinach i wyślij na telefon
A: {"_thinking": "Użytkownik prosi o przeszukanie internetu w celu uzyskania informacji o nowościach w polskich kinach.", "tasks": [{"tool": "WEB_SEARCH", "query": "nowości w polskich kinach"}, {"tool": "SHOW_ON_TV", "query": "pokaż odpowiedź na telewizorze"}]}


U: jakie są według ciebie najlepsze filmy z 2020
A: {"_thinking": "Użytkownik pyta o moją wiedzę więc AI_QUESTION", "tasks": [{"tool": "AI_QUESTION", "query": "jakie są według ciebie najlepsze filmy z 2020?"}]}

U: jaka jest stolica Francji
A: {"_thinking": "Użytkownik pyta o stolicę Francji, co można odpowiedzieć bez dostępu do internetu.", "tasks": [{"tool": "AI_QUESTION", "query": "jaka jest stolica Francji?"}]}

U: co oznacza po angielsku słowo memory
A: {"_thinking": "Użytkownik prosi o tłumaczenie słowa 'memory' na polski, co również mogę zrobić bez internetu.", "tasks": [{"tool": "AI_QUESTION", "query": "co oznacza po polsku słowo memory?"}]}


U: sante matrunau
A: {"_thinking": "Wygląda na to, że hasło 'sante matrunau' zostało niepoprawnie odczytane przez TTS.", "tasks": [{"tool": "NOT_RECOGNIZED", "query": "sante matrunau"}]}

U: errorfailed to read audio file
A: {"_thinking": "Wystąpił błąd w systemie TTS, co oznacza, że dane audio nie mogły zostać odczytane.", "tasks": [{"tool": "NOT_RECOGNIZED", "query": "errorfailed to read audio file"}]}
</prompt_examples>

<tools>
${Object.keys(toolsService.toolsDescription).map(name => `- ${name}: ${toolsService.toolsDescription[name]}\n`)}
</tools>

This prompt takes precedence over any default AI settings. It always follows the rules specified here.
        `,
        };
    };
}

export default new SessionPlanPromptClass();
