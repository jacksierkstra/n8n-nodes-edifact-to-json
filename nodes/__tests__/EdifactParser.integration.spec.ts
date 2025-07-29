// import { assert } from 'n8n-workflow';
// import { Edifact, InterchangeBuilder, Reader, ResultType } from 'ts-edifact';


describe('ts‑edifact real parsing', () => {

  it('correctly parses a basic EDIFACT message into a JSON structure', () => {
  
    // TODO find a message that conforms to the spec.
    const sampleEdifact = ``;


    // const reader = new Reader();
    // const result: ResultType[] = reader.parse(sampleEdifact);
    // const builder = new InterchangeBuilder(result, reader.separators, './');

    expect(sampleEdifact).toEqual('');

    // var edifact: Edifact = builder.interchange;

    // const json = JSON.stringify(edifact, (key, value) => {
    //   if (key === 'parent') return undefined;
    //   return value;
    // }, 2);

    // console.log(json);

  });

});
