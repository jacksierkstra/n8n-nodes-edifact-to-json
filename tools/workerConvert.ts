// @ts-nocheck
import { parentPort } from 'worker_threads';
import fs from "fs";
import path from "path";

// CHANGE THESE LINES:
import pkgMessageStructureParser from 'ts-edifact/lib/edi/messageStructureParser.js';
const { EdifactMessageSpecification } = pkgMessageStructureParser;

import pkgTableBuilder from 'ts-edifact/lib/tableBuilder.js';
const { Suffix } = pkgTableBuilder;

parentPort?.on('message', async (data: { specFileLocation: string, messageType: string, messageVersion: string, downloadPath: string }) => {
    const { specFileLocation, messageType, messageVersion, downloadPath } = data;
    try {
        const exists = fs.existsSync(specFileLocation);

        if (exists) {
            const spec: EdifactMessageSpecification = JSON.parse(fs.readFileSync(specFileLocation, "utf8"));
            const messageStructDefFileName: string = `${spec.version}${spec.release}_${spec.messageType}.struct.json`;
            const segmentsFileName: string = `${spec.version}${spec.release}_${spec.messageType}.${Suffix.Segments}.json`;
            const elementsFileName: string = `${spec.version}${spec.release}_${spec.messageType}.${Suffix.Elements}.json`;

            const convertedPath = path.join(downloadPath, 'converted');
            if (!fs.existsSync(convertedPath)) {
                fs.mkdirSync(convertedPath, { recursive: true });
            }

            const structPath = path.join(convertedPath, messageStructDefFileName);
            const segmentsPath = path.join(convertedPath, segmentsFileName);
            const elementsPath = path.join(convertedPath, elementsFileName);

            fs.writeFileSync(structPath, JSON.stringify(spec.messageStructureDefinition, null, 2));
            fs.writeFileSync(segmentsPath, JSON.stringify(spec.segmentTable.entries, null, 2));
            fs.writeFileSync(elementsPath, JSON.stringify(spec.elementTable.entries, null, 2));
            parentPort?.postMessage({ status: 'success', messageType: messageType });
        } else {
            parentPort?.postMessage({ status: 'skipped', messageType: messageType, message: `File ${specFileLocation} does not exist. Skipping conversion for message type ${messageType} of version ${messageVersion}.` });
        }
    } catch (error: any) {
        parentPort?.postMessage({ status: 'error', messageType: messageType, message: `Could not convert Message structure and segment/element definitions for message type ${messageType} of version ${messageVersion}. Reason: ${error.message}` });
    }
});