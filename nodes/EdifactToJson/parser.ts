import { Edifact, InterchangeBuilder, Reader } from "ts-edifact";

export interface ParserOpts {
    specPath: string;
}

export class EdifactParser {

    constructor(private document: string, private opts: ParserOpts) { }

    parse(): Edifact {
        try {
            const reader = new Reader(this.opts.specPath);
            const result = reader.parse(this.document);
            const builder = new InterchangeBuilder(result, reader.separators, this.opts.specPath);
            return builder.interchange;
        } catch (error) {
            if (error instanceof Error) {
                // Re-throw with additional context while preserving the original error
                throw new Error(
                    `Failed to parse EDIFACT document: ${error.message}`,
                    { cause: error },
                );
            }
            throw error;
        }
    }

}