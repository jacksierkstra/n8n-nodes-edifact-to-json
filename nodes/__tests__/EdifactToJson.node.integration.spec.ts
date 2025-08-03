
import { EdifactConversionService } from "../EdifactToJson/conversion";


describe('Edifact parsing', () => {

  it('correctly parses a basic DESADV EDIFACT message into an Object structure', () => {

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

    const service = new EdifactConversionService();
    const result = service.parse(sampleEdifact);

    expect(result.sender.id).toEqual('1234567891234');
    expect(result.receiver.id).toEqual('4321987654321');
    expect(result.date).toEqual('250725');

  });

  it('correctly parses a basic INSDES EDIFACT message into a JSON structure', () => {
    
    const sampleEdifact = `UNA:+.? '
UNB+UNOA:1+SENDERID+RECEIVERID+250731:2035+000000000001'
UNH+1+INSDES:D:01B:UN:1.1'
BGM+351+INSDES1234+9'
DTM+137:20250731:102'
RFF+ON:123456'
NAD+BY+5412345000013::9'
NAD+DP+5412345000020::9'
LIN+1++123456789:IN'
QTY+12:100'
UNS+S'
UNT+10+1'
UNZ+1+000000000001'`;

    const service = new EdifactConversionService();
    const result = service.parse(sampleEdifact);

    expect(result.sender.id).toEqual('SENDERID');
    expect(result.receiver.id).toEqual('RECEIVERID');
    expect(result.date).toEqual('250731');

  });

});
