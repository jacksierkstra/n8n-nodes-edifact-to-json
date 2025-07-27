import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError
} from 'n8n-workflow';

// Import Reader, Separators, and EdifactSeparatorsBuilder
import { EdifactSeparatorsBuilder, Reader, Separators } from 'ts-edifact';

/**
 * Defines the properties for the EdifactToJson node.
 */
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
	},
	{
		displayName: 'Has UNA Segment?',
		name: 'hasUnaSegment',
		type: 'boolean',
		default: true,
		description: 'Whether set to true if the EDIFACT input string includes a UNA segment. If false, you must provide custom delimiter characters.',
	},
	{
		displayName: 'Custom Delimiter Characters',
		name: 'customDelimiterCharacters',
		type: 'string',
		default: ":+.? '", // Default EDIFACT delimiters
		placeholder: ":+.? '",
		description: 'Specify the 6 EDIFACT delimiter characters (component, data element, decimal, release, blank space, segment terminator). Only used if "Has UNA Segment?" is false.',
		displayOptions: {
			show: {
				hasUnaSegment: [false], // Only show if hasUnaSegment is false
			},
		},
		// No 'validation' property here, as per previous correction.
	},
];

/**
 * EdifactToJson Node: Converts an EDIFACT string to a JSON object.
 */
export class EdifactToJson implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EDIFACT to JSON',
		icon: { light: 'file:EdifactoToJson.light.svg', dark: 'file:EdifactoToJson.dark.svg' },
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

		for (let i = 0; i < items.length; i++) {
			const mainInputType = this.getNodeParameter('mainInputType', i) as string;
			const hasUnaSegment = this.getNodeParameter('hasUnaSegment', i) as boolean;
			const customDelimiterCharacters = this.getNodeParameter('customDelimiterCharacters', i) as string;

			let edifactString: string;

			// Determine input type and get the EDIFACT string
			if (mainInputType === 'string') {
				edifactString = this.getNodeParameter('edifactInput', i) as string;
			} else { // mainInputType === 'binary'
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

				// Ensure binary data exists for the current item
				if (!items[i].binary || !items[i].binary![binaryPropertyName]) {
					throw new NodeOperationError(this.getNode(), `No binary data found for property "${binaryPropertyName}" on item ${i}.`, {
						itemIndex: i,
					});
				}

				// Get the binary data buffer and convert to string
				// Assuming UTF-8 encoding for EDIFACT binary input, adjust if needed (e.g., 'latin1')
				const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
				edifactString = dataBuffer.toString('utf8');
			}

			try {
				let reader = new Reader(); // Instantiate Reader without messageSpecDir in constructor

				// If UNA segment is not present, build custom Separators instance and assign to reader.separators
				if (!hasUnaSegment) {
					if (!customDelimiterCharacters || customDelimiterCharacters.length !== 6) {
						throw new NodeOperationError(this.getNode(), 'Custom Delimiter Characters must be exactly 6 characters long when "Has UNA Segment?" is false.');
					}

					// Use EdifactSeparatorsBuilder to create a Separators instance
					const customSeparators: Separators = new EdifactSeparatorsBuilder()
						.componentSeparator(customDelimiterCharacters[0])
						.elementSeparator(customDelimiterCharacters[1])
						.decimalSeparator(customDelimiterCharacters[2])
						.releaseIndicator(customDelimiterCharacters[3])
						.blankSpace(customDelimiterCharacters[4]) // Assuming blank space is the 5th character
						.segmentTerminator(customDelimiterCharacters[5])
						.build();

					reader.separators = customSeparators; // Assign the Separators instance to the reader
				}
				// If hasUnaSegment is true, the Reader will automatically detect them from the UNA segment

				// Parse the EDIFACT string
				const result = reader.parse(edifactString);

				// Push the parsed JSON result to the output
				returnData.push({ json: { edifactJson: result } });
			} catch (error) {
				// Catch any errors during parsing and throw an n8n NodeOperationError
				if (error instanceof Error) {
					throw new NodeOperationError(this.getNode(), error, {
						message: `Failed to convert EDIFACT to JSON: ${error.message}`,
						itemIndex: i, // Add itemIndex for better debugging in n8n
					});
				} else {
					throw new NodeOperationError(this.getNode(), `An unknown error occurred during EDIFACT to JSON conversion: ${error}`, {
						message: 'An unknown error occurred during EDIFACT to JSON conversion.',
						itemIndex: i, // Add itemIndex
					});
				}
			}
		}

		// Prepare and return the output data
		return this.prepareOutputData(returnData);
	}
}
