import type { Query } from '../../controler/mqtt/types.ts';
import { type AssistantAction, EMessageType } from '../intent/Intent.interface.ts';
import { ContinueSession, EndSessionNegative } from '../intent/Action.interface.ts';
import envProps from '../../property/Property.manager.ts';
import { ToolsServiceClass } from './ToolsService.ts';

export const notRecognized = (query: Query): AssistantAction => {
    const prevNotRecognize = query.customData?.find(
        item => item.type === EMessageType.INTENT_NOT_RECOGNIZED
    );

    const userMessage = query.customData?.find(msg => msg.content === query.input);
    if (userMessage?.type) userMessage.type = EMessageType.INTENT_NOT_RECOGNIZED;

    if (prevNotRecognize) {
        return EndSessionNegative(query);
    } else {
        return ContinueSession(query, envProps.intent.pleaseRepeat);
    }
};

export abstract class ToolAbstract {
    abstract doAction(query: Query): Promise<AssistantAction>;

    constructor(toolsService: ToolsServiceClass, name: string, description: string) {
        toolsService.addTool(name, description, this);
    }

    notRecognized(query: Query): AssistantAction {
        return notRecognized(query);
    }
}
