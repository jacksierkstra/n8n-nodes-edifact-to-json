import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

export class InputResolver {
    constructor(private ctx: IExecuteFunctions) {}

    async getEdifactString(index: number): Promise<string> {
        const inputType = this.ctx.getNodeParameter('mainInputType', index) as string;
        if (inputType === 'string') {
            return this.ctx.getNodeParameter('edifactInput', index) as string;
        }

        const prop = this.ctx.getNodeParameter('binaryPropertyName', index) as string;
        const item = this.ctx.getInputData()[index];

        if (!item.binary?.[prop]) {
            throw new NodeOperationError(this.ctx.getNode(), `No binary data found for property "${prop}" on item ${index}.`, { itemIndex: index });
        }

        const buffer = await this.ctx.helpers.getBinaryDataBuffer(index, prop);
        return buffer.toString('utf8');
    }
}
