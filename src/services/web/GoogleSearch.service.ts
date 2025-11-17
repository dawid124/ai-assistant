import { searchWithPages } from 'google-sr';

export class GoogleSearchService {
    async test(query: string) {
        // const searchResults = await search({ query: query });
        const searchResults = await searchWithPages({ query: query, pages: [1, 2] });
        // searchResults is a array of objects (see typedoc)
        for (const result of searchResults) {
            console.log(result);
        }
        // if (searchResults[0].type === ResultTypes.OrganicResult) {
        //     // log the first result
        //     console.log(searchResults[0]);
        // }
    }
}

new GoogleSearchService().test('najnowsze wydażenia z kraju').catch(console.error);
