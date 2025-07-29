import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeConnectionType,
} from 'n8n-workflow';
import { Reader } from 'ts-edifact';
import { EdifactToJson } from '../EdifactToJson/EdifactToJson.node';

jest.mock('ts-edifact');

const mockParse = jest.fn();
(Reader as jest.Mock).mockImplementation(() => ({
  parse: mockParse,
}));

describe('EdifactToJson node', () => {
  let node: EdifactToJson;
  let mockContext: Partial<IExecuteFunctions> & { helpers?: any };

  beforeEach(() => {
    node = new EdifactToJson();
    mockParse.mockClear();

    // Stub getInputData to return one item with a proper IBinaryKeyData shape
    mockContext = {
      getInputData: (_?: number, __?: NodeConnectionType) =>
        [
          {
            json: {},
            binary: {
              data: {
                data: Buffer.from("UNA:+.?\'"),
                mimeType: 'text/plain',
              },
            },
          },
        ] as unknown as INodeExecutionData[],
      getNodeParameter: jest.fn(),
      // Stub getNode so NodeOperationError can be constructed
      getNode: () => ({} as any),
      // Stub prepareOutputData so the node can return a value
      prepareOutputData: (data: INodeExecutionData[]) => Promise.resolve([data]),
      helpers: {} as any,
    };
  });

  it('parses string input when mainInputType is string', async () => {
    (mockContext.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('string')      // mainInputType
      .mockReturnValueOnce(true)          // hasUnaSegment
      .mockReturnValueOnce('unused')      // customDelimiterCharacters
      .mockReturnValueOnce('SAMPLE_EDI'); // edifactInput

    const result = await node.execute.call(
      mockContext as IExecuteFunctions
    );
    expect(mockParse).toHaveBeenCalledWith('SAMPLE_EDI');
    expect((result[0][0].json as any)).toHaveProperty('edifactJson');
  });

  it('parses binary input when mainInputType is binary', async () => {
    (mockContext.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('binary')    // mainInputType
      .mockReturnValueOnce(true)        // hasUnaSegment
      .mockReturnValueOnce('unused')    // customDelimiterCharacters
      .mockReturnValueOnce('data');     // binaryPropertyName

    mockContext.helpers = {
      getBinaryDataBuffer: jest
        .fn()
        .mockResolvedValue(Buffer.from('BINARY_EDI')),
    };

    await node.execute.call(mockContext as IExecuteFunctions);
    expect(mockParse).toHaveBeenCalledWith('BINARY_EDI');
  });

  it('throws when custom delimiters length is wrong', async () => {
    (mockContext.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('string')
      .mockReturnValueOnce(false)   // hasUnaSegment
      .mockReturnValueOnce('SHORT') // customDelimiterCharacters
      .mockReturnValueOnce('EDI');

    await expect(
      node.execute.call(mockContext as IExecuteFunctions)
    ).rejects.toThrow(
      'Custom Delimiter Characters must be exactly 6 characters long'
    );
  });

  it('throws when no binary data found', async () => {
    (mockContext.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('binary')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce('unused')
      .mockReturnValueOnce('missingProp');

    // override getInputData to simulate missing binary
    mockContext.getInputData = (_?: number, __?: NodeConnectionType) =>
      [{ json: {}, binary: {} }] as unknown as INodeExecutionData[];

    await expect(
      node.execute.call(mockContext as IExecuteFunctions)
    ).rejects.toThrow(
      /No binary data found for property "missingProp"/
    );
  });
});
