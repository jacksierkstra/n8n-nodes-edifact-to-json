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
            const specPath = path.join(path.resolve(__dirname), 'specs', 'd01b', 'converted');
            const parser = new EdifactParser(edifact, { specPath: specPath });
            return parser.parse();
        } finally {
            console.warn = originalWarn;
            console.error = originalError;
        }
    }
}
