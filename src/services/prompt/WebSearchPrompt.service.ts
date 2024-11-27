import webSearch from './WebSearch.service.ts';
import OpenAIService from '../ai/OpenAI.service.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { answerPrompt } from './prompts.ts';
import OpenAI, { ChatCompletion } from 'openai';

interface SearchResult {
    url: string;
    title: string;
    description: string;
    content?: string;
}

class WebSearchPromptService {
    public async search(text: string) {
        const { queries } = await webSearch.generateQueries(text);
        let mergedResults: SearchResult[] = [];

        if (queries.length > 0) {
            const searchResults = await webSearch.searchWeb(queries);
            const filteredResults = await webSearch.scoreResults(searchResults, text);
            const urlsToLoad = await webSearch.selectResourcesToLoad(text, filteredResults);
            const scrapedContent = await webSearch.scrapeUrls(urlsToLoad);
            mergedResults = filteredResults.map(result => {
                const scrapedItem = scrapedContent.find(item => item.url === result.url);
                return scrapedItem ? { ...result, content: scrapedItem.content } : result;
            });
        }

        const promptWithResults = answerPrompt(mergedResults);
        const allMessages: ChatCompletionMessageParam[] = [
            { role: 'system', content: promptWithResults },
            { role: 'user', content: text } as ChatCompletionMessageParam[],
        ];
        const completion: OpenAI.Chat.Completions.ChatCompletion = await OpenAIService.completion(
            allMessages,
            'gpt-4o',
            false
        );

        return completion.choices[0].message.content;
    }
}

export default new WebSearchPromptService();
