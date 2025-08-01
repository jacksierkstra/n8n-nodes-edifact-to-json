import { EdifactMessageSpecification, UNECEMessageStructureParser } from "ts-edifact";


export class SpecLoader {

    constructor(private type: string, private version: string) { }

    public async load(): Promise<EdifactMessageSpecification> {
        try {
            const builder = new UNECEMessageStructureParser(this.version, this.type);
            return await builder.loadTypeSpec();
        } catch (error) {
            if (error instanceof Error) {
                // Re-throw with additional context while preserving the original error
                throw new Error(
                    `Failed to load specification for type ${this.type} and version ${this.version}: ${error.message}`,
                    { cause: error },
                );
            }
            throw error;
        }
    }

}