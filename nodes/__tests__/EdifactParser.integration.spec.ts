
import { EdifactParser } from "../EdifactToJson/parser";


describe('Edifact parsing', () => {

  it('correctly parses a basic DESADV EDIFACT message into an Object structure', () => {
  
    // TODO find a message that conforms to the spec.
    const sampleEdifact = `UNA:+.? '
UNB+UNOC:3+1234567891234:14+4321987654321:14+250725:1503+38190'
UNH+3819000001+DESADV:D:01B:UN:EAN007'
BGM+351+DES587441+9'
DTM+137:20020401:102'
DTM+11:20020403:102'
DTM+358:20020403:102'
RFF+ON:12332'
NAD+SU+5411234512309::9'
NAD+BY+5412345000013::9'
NAD+DP+5412345123453::9'
CPS+1'
PAC+2++201::9'
CPS+2+1'
PAC+1++201::9'
MEA+PD+AAB+KGM:263.2'
MEA+PD+WD+MMT:800'
MEA+PD+LN+MMT:1200'
LIN+1++5410738000152:SRV'
QTY+12:20'
UNT+21+3819000001'
UNZ+1+38190'`;

    const parser = new EdifactParser(sampleEdifact);
    var result = parser.parse();

    expect(result.sender.id).toEqual('1234567891234');
    expect(result.receiver.id).toEqual('4321987654321');
    expect(result.date).toEqual('250725');

  });

});
