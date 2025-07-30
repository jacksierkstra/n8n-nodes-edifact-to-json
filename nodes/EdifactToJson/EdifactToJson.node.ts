import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError
} from 'n8n-workflow';

import { InputResolver } from './InputResolver';
import { EdifactConversionService } from './EdifactConversionService';

const edifactToJsonProperties: INodeProperties[] = [
	{
		displayName: 'Input Type',
		name: 'mainInputType',
		type: 'options',
		options: [
			{
				name: 'String',
				value: 'string',
			},
			{
				name: 'Binary',
				value: 'binary',
			},
		],
		default: 'string',
		description: 'Choose whether the EDIFACT input is provided as a string or binary data',
	},
	{
		displayName: 'EDIFACT Input',
		name: 'edifactInput',
		type: 'string',
		default: '',
		typeOptions: {
			rows: 5, // Make the input field larger for multi-line EDIFACT
		},
		placeholder: 'UNA:+.?\'\nUNB+UNOA:1+SENDER+RECEIVER+210101:1200+000000001\'...',
		description: 'Provide a string containing the EDIFACT data to be converted to JSON',
		required: true,
		displayOptions: {
			show: {
				mainInputType: ['string'],
			},
		},
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property to read the EDIFACT data from',
		displayOptions: {
			show: {
				mainInputType: ['binary'],
			},
		},
	}

];

/**
 * EdifactToJson Node: Converts an EDIFACT string to a JSON object.
 */
export class EdifactToJson implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EDIFACT to JSON',
		icon: { light: 'file:EdifactToJson.light.svg', dark: 'file:EdifactToJson.dark.svg' },
		name: 'edifactToJson', // Changed name for clarity
		group: ['transform'],
		version: 1,
		description: 'Converts an EDIFACT string to a JSON object using the ts-edifact library.',
		defaults: {
			name: 'EDIFACT to JSON',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: edifactToJsonProperties, // Use the defined properties
	};

	/**
	 * Executes the node logic.
	 * @param this IExecuteFunctions context provided by n8n.
	 * @returns A promise that resolves to an array of INodeExecutionData arrays.
	 */
        async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
                const items = this.getInputData();
                const returnData: INodeExecutionData[] = [];
                const resolver = new InputResolver(this);
                const converter = new EdifactConversionService();

                for (let i = 0; i < items.length; i++) {
                        const edifactString = await resolver.getEdifactString(i);

                        try {
                                const result = converter.parse(edifactString);
                                returnData.push({ json: { edifactJson: result } });
                        } catch (error) {
                                if (error instanceof Error) {
                                        throw new NodeOperationError(this.getNode(), error, {
                                                message: `Failed to convert EDIFACT to JSON: ${error.message}`,
                                                itemIndex: i,
                                        });
                                }

                                throw new NodeOperationError(
                                        this.getNode(),
                                        `An unknown error occurred during EDIFACT to JSON conversion: ${error}`,
                                        { itemIndex: i },
                                );
                        }
                }

                return this.prepareOutputData(returnData);
        }
}
