import { EdifactParser } from './parser';

function noop() {}

export class EdifactConversionService {
    parse(edifact: string) {
        const originalWarn = console.warn;
        const originalError = console.error;
        console.warn = noop;
        console.error = noop;

        try {
            const parser = new EdifactParser(edifact, {});
            return parser.parse();
        } finally {
            console.warn = originalWarn;
            console.error = originalError;
        }
    }
}
