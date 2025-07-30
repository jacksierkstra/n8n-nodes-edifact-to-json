import { EdifactParser } from './parser';

export class EdifactConversionService {
    parse(edifact: string) {
        const parser = new EdifactParser(edifact, {});
        return parser.parse();
    }
}
