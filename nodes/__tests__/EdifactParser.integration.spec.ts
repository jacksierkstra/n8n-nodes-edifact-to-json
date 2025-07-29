// import { assert } from 'n8n-workflow';
// import { Edifact, InterchangeBuilder, Reader, ResultType } from 'ts-edifact';

import { EdifactParser } from "../EdifactToJson/parser";


describe('ts‑edifact real parsing', () => {

  it('correctly parses a basic EDIFACT message into a JSON structure', () => {
  
    // TODO find a message that conforms to the spec.
    const sampleEdifact = `UNH+ME000001+DESADV:D:01B:UN:EAN007'
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
UNT+23+ME000001'`;

    const parser = new EdifactParser(sampleEdifact);
    var result = parser.parse();

    expect(result).toEqual('');

  });

});
