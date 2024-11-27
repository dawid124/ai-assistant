import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import envProps from '../../property/Property.manager.ts';
import OpenAIService, { OpenAIServiceClass } from './OpenAI.service.ts';

export type QdrantPoint = {
    id?: string;
    text: string;
    metadata?: Record<string, any>;
};

export type QdrantSearchResult = {
    embed: number[];
    results: object[];
};

export class VectorServiceClass {
    private client: QdrantClient;
    private openAIService: OpenAIServiceClass;

    constructor(openAIService: OpenAIServiceClass, url: string, apiKey: string) {
        this.openAIService = openAIService;
        this.client = new QdrantClient({
            url,
            apiKey,
        });
    }

    async ensureCollection(name: string) {
        const collections = await this.client.getCollections();
        if (!collections.collections.some(c => c.name === name)) {
            await this.client.createCollection(name, {
                vectors: { size: 3072, distance: 'Cosine' },
            });
        }
    }

    async addPoints(collectionName: string, points: Array<QdrantPoint>) {
        const pointsToUpsert = await Promise.all(
            points.map(async point => {
                const embedding = await this.openAIService.createEmbedding(point.text);

                return {
                    id: point.id || uuidv4(),
                    vector: embedding,
                    payload: {
                        text: point.text,
                        ...point.metadata,
                    },
                };
            })
        );

        await this.client.upsert(collectionName, {
            wait: true,
            points: pointsToUpsert,
        });
    }

    async addPoint(collectionName: string, point: QdrantPoint, embed?: number[]) {
        const embedding = embed || (await this.openAIService.createEmbedding(point.text));

        return await this.client.upsert(collectionName, {
            wait: true,
            points: [
                {
                    id: point.id || uuidv4(),
                    vector: embedding,
                    payload: {
                        text: point.text,
                        ...point.metadata,
                    },
                },
            ],
        });
    }

    async search(
        collectionName: string,
        text: string,
        limit: number = 5,
        filter: Record<string, any> = {}
    ): Promise<QdrantSearchResult> {
        const queryEmbedding = await this.openAIService.createEmbedding(text);
        return {
            embed: queryEmbedding,
            results: await this.client.search(collectionName, {
                vector: queryEmbedding,
                limit,
                with_payload: true,
                filter,
            }),
        };
    }
}

export default new VectorServiceClass(OpenAIService, envProps.qdrant.url, envProps.qdrant.apiKey);
