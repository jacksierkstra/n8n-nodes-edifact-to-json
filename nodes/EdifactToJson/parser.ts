import { Edifact, InterchangeBuilder, Reader } from "ts-edifact";

export class EdifactParser {

    constructor(private document: string, opts?: {}) { }

    parse(): Edifact {
        try {
            let reader = new Reader();
            var result = reader.parse(this.document);
            var builder = new InterchangeBuilder(result, reader.separators, '');
            return builder.interchange;
        } catch (error) {
            throw new Error(`Failed to parse EDIFACT document: ${error.message}`, error);
        }
    }

    parseAsJson(): string {
        return this.toJsonWithoutCircularRefs(this.parse());
    }

    private toJsonWithoutCircularRefs = (obj: any) => JSON.stringify(obj, (key, value) => {
        // drop any "parent" property
        if (key === 'parent') return undefined;
        return value;
    }, 2);

}