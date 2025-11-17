// import envProps from '../../property/Property.manager.ts';
// import type { IActionTypeVectorCacheProps } from '../../property/Property.interface.ts';
// import VectorService, { type VectorServiceClass } from '../ai/Vector.service.ts';
// import type { EIntentType } from '../tools/implementation/smart-home/SmartHome.Interface.ts';
// import type { IntentTypeRecognizeType } from '../intent/SessionPlan.prompt.ts';
// import type { CachedIntentType } from './Cache.interface.ts';
//
// export class ActionTypeVectorCacheClass {
//     private active: boolean;
//     private minScore: number;
//     private vectorService: VectorServiceClass;
//     private readonly COLLECTION = 'actionTypeVectorCache';
//
//     constructor(props: IActionTypeVectorCacheProps, vectorService: VectorServiceClass) {
//         this.active = props.active;
//         this.minScore = props.minScore;
//         this.vectorService = vectorService;
//
//         this.vectorService.ensureCollection(this.COLLECTION).catch(console.error);
//     }
//
//     async wrap(input: string, recognize: IntentTypeRecognizeType): Promise<EIntentType> {
//         if (!this.active) {
//             const start: number = new Date().valueOf();
//             const eIntentType = await recognize(input);
//             const end = new Date().valueOf();
//             console.log(`recognize get time: ${end - start}`);
//             return eIntentType;
//         }
//
//         let start: number = new Date().valueOf();
//         const cachedIntentType = await this.get(input);
//         let end = new Date().valueOf();
//         console.log(`ActionTypeVectorCache get time: ${end - start}`);
//
//         if (cachedIntentType) return cachedIntentType;
//
//         start = new Date().valueOf();
//         const intentType = await recognize(input);
//         end = new Date().valueOf();
//         console.log(`recognize get time: ${end - start}`);
//
//         await this.add(input, intentType);
//
//         return intentType;
//     }
//
//     private async get(key: string): Promise<EIntentType | undefined> {
//         const response = (await this.vectorService.search(this.COLLECTION, key, 1)) as {
//             embed: number[];
//             results: CachedIntentType[];
//         };
//
//         if (!response || !response.results || response.results.length === 0) return undefined;
//
//         const match: CachedIntentType = response.results[0];
//
//         if (match.score >= this.minScore) {
//             if (match.score < 0.99) {
//                 await this.add(key, match.payload.type, response.embed);
//             }
//             return match.payload.type;
//         }
//
//         return undefined;
//     }
//
//     private add(key: string, type: EIntentType, embed?: number[]) {
//         return this.vectorService.addPoint(
//             this.COLLECTION,
//             {
//                 text: key,
//                 metadata: { type },
//             },
//             embed
//         );
//     }
// }
//
// export default new ActionTypeVectorCacheClass(envProps.cache.actionTypeVectorCache, VectorService);
