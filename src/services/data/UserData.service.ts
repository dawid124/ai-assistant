import envProps from '../../property/Property.manager.ts';
import { readFile, writeFile } from 'fs/promises';
import path from 'node:path';

export class UserDataServiceClass {
    private _databasePath: string;
    private _sentences: string = '';
    private _smartHomeExamples: string = '';

    constructor(databasePath: string) {
        this._databasePath = databasePath;
        this.loadSentences().catch(err =>
            console.error('Error loading sentences. Sentences will be empty', err)
        );
        this.loadSmartHomeExamples().catch(err =>
            console.error(
                'Error loading smartHomeExamples. SmartHomeExamples for prompt will be empty',
                err
            )
        );
    }

    get smartHomeExamples(): string {
        return this._smartHomeExamples;
    }

    get sentences(): string {
        return this._sentences;
    }

    private async loadSentences(): Promise<void> {
        const filePath = path.join(this._databasePath, 'sentences');
        try {
            this._sentences = await readFile(filePath, 'utf-8');
        } catch (error) {
            this._sentences = '';
            await writeFile(filePath, '');
        }
    }

    private async loadSmartHomeExamples(): Promise<void> {
        const filePath = path.join(this._databasePath, 'smart-home-examples');
        try {
            this._smartHomeExamples = await readFile(filePath, 'utf-8');
        } catch (error) {
            this._smartHomeExamples = '';
            await writeFile(filePath, '');
        }
    }
}

export default new UserDataServiceClass(envProps.databasePath);
