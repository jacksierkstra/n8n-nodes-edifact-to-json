import { EdifactConversionService } from "../conversion";

describe('EdifactConversionService', () => {
  it('parses a simple EDIFACT message', () => {
    const sampleEdifact = `UNA:+.? '
UNB+UNOC:3+1234567891234:14+4321987654321:14+250725:1503+38190'
UNH+3819000001+DESADV:D:01B:UN:EAN007'
BGM+351+DES587441+9'
DTM+137:20020401:102'
UNT+7+3819000001'
UNZ+1+38190'`;

    const service = new EdifactConversionService();
    const result = service.parse(sampleEdifact);

    expect(result.sender.id).toBe('1234567891234');
    expect(result.receiver.id).toBe('4321987654321');
  });

  it('suppresses console warnings and errors from the parser', () => {
    const sampleEdifact = `UNA:+.? '
UNB+UNOC:3+1234567891234:14+4321987654321:14+250725:1503+38190'
UNH+3819000001+DESADV:D:01B:UN:EAN007'
BGM+351+DES587441+9'
DTM+137:20020401:102'
UNT+7+3819000001'
UNZ+1+38190'`;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const service = new EdifactConversionService();
    service.parse(sampleEdifact);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
