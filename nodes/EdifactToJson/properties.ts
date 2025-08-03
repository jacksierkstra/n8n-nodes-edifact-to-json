import { INodeProperties } from "n8n-workflow";

export const edifactToJsonProperties: INodeProperties[] = [
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