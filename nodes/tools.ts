// @ts-nocheck
import fs from "fs";

import { EdifactMessageSpecification, MessageStructureParser, UNECEMessageStructureParser } from "ts-edifact/lib/edi/messageStructureParser";
import { MESSAGE_TYPES } from "./constants";
import { Suffix } from "ts-edifact/lib/tableBuilder";
import path from "path";

const persist = (spec: EdifactMessageSpecification, location: string) => {
    const fs = require("fs");
    fs.writeFileSync(location, JSON.stringify(spec, null, 2));
};

const version: string = "d01b";
const downloadPath: string = path.join(__dirname, "EdifactToJson", "specs", version);

const downloadSpecs = async () => {

    for (const typeName of MESSAGE_TYPES) {
        try {
            const locationToDownload = path.join(downloadPath, `${typeName}.json`);
            const fileExists = fs.existsSync(locationToDownload);
            if (!fileExists) {
                const structParser: MessageStructureParser = new UNECEMessageStructureParser(version, typeName);
                const spec = await structParser.loadTypeSpec();
                persist(spec, locationToDownload);
            } else {
                console.log(`Message specification for ${typeName} of version ${version} already exists at ${locationToDownload}. Skipping download.`);
                continue;
            }
        } catch (error) {
            console.warn(`Could not load Message structure and segment/element definitions for message type ${typeName} of version ${version}. Reason: ${error.message}`);
            continue;
        }
    }
};


const convertSpecs = async () => {

    for (const typeName of MESSAGE_TYPES) {
        try {
            const specFile = path.join(downloadPath, `${typeName}.json`);
            await convertSpec(specFile, typeName, version);
        } catch (error) {
            console.warn(`Could not load Message structure and segment/element definitions for message type ${typeName} of version ${version}. Reason: ${error.message}`);
            continue;
        }
    }
};

const convertSpec = async (specFileLocation: string, messageType: string, messageVersion: string) => {

    try {
        const exists = fs.existsSync(specFileLocation);

        if (exists) {
            const spec: EdifactMessageSpecification = JSON.parse(fs.readFileSync(specFileLocation, "utf8"));
            const messageStructDefFileName: string = `${spec.version}${spec.release}_${spec.messageType}.struct.json`;
            const segmentsFileName: string = `${spec.version}${spec.release}_${spec.messageType}.${Suffix.Segments}.json`;
            const elementsFileName: string =  `${spec.version}${spec.release}_${spec.messageType}.${Suffix.Elements}.json`;

            const structPath = path.join(__dirname, "EdifactToJson", 'specs', version, 'converted', messageStructDefFileName);
            const segmentsPath = path.join(__dirname, "EdifactToJson", 'specs', version, 'converted', segmentsFileName);
            const elementsPath = path.join(__dirname, "EdifactToJson", 'specs', version, 'converted', elementsFileName);

            fs.writeFileSync(structPath, JSON.stringify(spec.messageStructureDefinition, null, 2));
            fs.writeFileSync(segmentsPath, JSON.stringify(spec.segmentTable.entries, null, 2));
            fs.writeFileSync(elementsPath, JSON.stringify(spec.elementTable.entries, null, 2));
        } else {
            console.warn(`File ${specFileLocation} does not exist. Skipping conversion for message type ${messageType} of version ${messageVersion}.`);
        }
    } catch (error) {

    }
};


// Run with `npx ts-node tools.ts`
const main = async () => {
    await downloadSpecs();
    console.log("All message specifications downloaded successfully.");
    await convertSpecs();
    console.log("All message specifications converted successfully.");
};

main()
    .catch((error) => {
    console.error("An error occurred while running the script:", error);
});