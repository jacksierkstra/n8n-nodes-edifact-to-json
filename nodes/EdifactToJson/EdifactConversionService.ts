import path from 'path';
import { EdifactParser } from './parser';

function noop() {}

export class EdifactConversionService {
    parse(edifact: string) {
        const originalWarn = console.warn;
        const originalError = console.error;
        console.warn = noop;
        console.error = noop;

        try {
            // We need a trailing slash. The underlying library, `ts-edifact`, constructs a path using 
            // string concatenation. Without the trailing slash it looks for specs in the wrong place.
            const specPath = path.join(path.resolve(__dirname), 'specs', 'd01b', 'converted', path.sep);
            const parser = new EdifactParser(edifact, { specPath: specPath });
            return parser.parse();
        } finally {
            console.warn = originalWarn;
            console.error = originalError;
        }
    }
}
