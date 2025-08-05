// @ts-nocheck
import { parentPort } from 'worker_threads';
import fs from "fs";
import path from "path";

// CHANGE THESE LINES:
import pkgMessageStructureParser from 'ts-edifact/lib/edi/messageStructureParser.js';
const { EdifactMessageSpecification, MessageStructureParser, UNECEMessageStructureParser } = pkgMessageStructureParser;

const persist = (spec: EdifactMessageSpecification, location: string) => {
    fs.writeFileSync(location, JSON.stringify(spec, null, 2));
};

parentPort?.on('message', async (data: { typeName: string, version: string, downloadPath: string }) => {
    const { typeName, version, downloadPath } = data;
    try {
        const locationToDownload = path.join(downloadPath, `${typeName}.json`);
        const fileExists = fs.existsSync(locationToDownload);
        if (!fileExists) {
            const structParser: MessageStructureParser = new UNECEMessageStructureParser(version, typeName);
            const spec = await structParser.loadTypeSpec();
            persist(spec, locationToDownload);
            parentPort?.postMessage({ status: 'success', typeName: typeName });
        } else {
            parentPort?.postMessage({ status: 'skipped', typeName: typeName, message: `Message specification for ${typeName} of version ${version} already exists. Skipping download.` });
        }
    } catch (error: any) {
        parentPort?.postMessage({ status: 'error', typeName: typeName, message: `Could not load Message structure and segment/element definitions for message type ${typeName} of version ${version}. Reason: ${error.message}` });
    }
});