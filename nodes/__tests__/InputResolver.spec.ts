import { InputResolver } from '../EdifactToJson/InputResolver';
import { NodeOperationError } from 'n8n-workflow';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

describe('InputResolver', () => {
  it('returns the string parameter when mainInputType is string', async () => {
    const ctx = {
      getNodeParameter: jest.fn()
        .mockImplementation((name: string) => {
          if (name === 'mainInputType') return 'string';
          if (name === 'edifactInput') return 'EDIFACT_STRING';
          return undefined;
        }),
      getInputData: jest.fn(),
      helpers: { getBinaryDataBuffer: jest.fn() },
      getNode: jest.fn(),
    } as unknown as IExecuteFunctions;

    const resolver = new InputResolver(ctx);
    await expect(resolver.getEdifactString(0)).resolves.toBe('EDIFACT_STRING');
  });

  it('reads binary data when mainInputType is binary', async () => {
    const buffer = Buffer.from('BINARY_EDIFACT');
    const item = {
      json: {},
      binary: { data: { data: '', mimeType: 'text/plain' } },
    } as INodeExecutionData;

    const ctx = {
      getNodeParameter: jest.fn()
        .mockImplementation((name: string) => {
          if (name === 'mainInputType') return 'binary';
          if (name === 'binaryPropertyName') return 'data';
          return undefined;
        }),
      getInputData: jest.fn().mockReturnValue([item]),
      helpers: { getBinaryDataBuffer: jest.fn().mockResolvedValue(buffer) },
      getNode: jest.fn(),
    } as unknown as IExecuteFunctions;

    const resolver = new InputResolver(ctx);
    await expect(resolver.getEdifactString(0)).resolves.toBe('BINARY_EDIFACT');
    expect(ctx.helpers.getBinaryDataBuffer).toHaveBeenCalledWith(0, 'data');
  });

  it('throws NodeOperationError when binary data is missing', async () => {
    const ctx = {
      getNodeParameter: jest.fn()
        .mockImplementation((name: string) => {
          if (name === 'mainInputType') return 'binary';
          if (name === 'binaryPropertyName') return 'data';
          return undefined;
        }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      helpers: { getBinaryDataBuffer: jest.fn() },
      getNode: jest.fn().mockReturnValue({}),
    } as unknown as IExecuteFunctions;

    const resolver = new InputResolver(ctx);
    await expect(resolver.getEdifactString(0)).rejects.toBeInstanceOf(NodeOperationError);
  });
});
