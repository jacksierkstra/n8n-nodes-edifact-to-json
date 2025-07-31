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

const downloadSpecs = async () => {

    const version: string = "d01b";

    for (const typeName of MESSAGE_TYPES) {
        try {
            const location: string = `./EdifactToJson/specs/${typeName}-${version}.json`;
            if (!fs.existsSync(location)) {
                const structParser: MessageStructureParser = new UNECEMessageStructureParser(version, typeName);
                const spec = await structParser.loadTypeSpec();
                persist(spec, location);
            } else {
                console.log(`Message specification for ${typeName} of version ${version} already exists at ${location}. Skipping download.`);
                continue;
            }
        } catch (error) {
            console.warn(`Could not load Message structure and segment/element definitions for message type ${typeName} of version ${version}. Reason: ${error.message}`);
            continue;
        }
    }
};


const convertSpecs = async () => {

    const version: string = "d01b";

    for (const typeName of MESSAGE_TYPES) {
        try {
            const jsonSpecFile: string = `./EdifactToJson/specs/${typeName}-${version}.json`;
            await convertSpec(jsonSpecFile, typeName, version);
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
            const spec = JSON.parse(fs.readFileSync(specFileLocation, "utf8"));
            // const messageStructureDefinition = spec.messageStructureDefinition;
            const messageStructDefFileName: string = spec.version + spec.release + "_" + spec.messageType + ".struct.json";
            // const segmentTable = spec.segmentTable;
            const segmentsFileName: string = spec.version + spec.release + "_" + spec.messageType + "." + Suffix.Segments + ".json";
            // const elementTable = spec.elementTable;
            const elementsFileName: string = spec.version + spec.release + "_" + spec.messageType + "." + Suffix.Elements + ".json";

            const structPath = path.join(__dirname, "EdifactToJson", 'specs', 'converted', messageStructDefFileName);
            const segmentsPath = path.join(__dirname, "EdifactToJson", 'specs', 'converted', segmentsFileName);
            const elementsPath = path.join(__dirname, "EdifactToJson", 'specs', 'converted', elementsFileName);

            console.log(`Writing message structure definition to ${structPath}`);
            console.log(`Writing segments definition to ${segmentsPath}`);
            console.log(`Writing elements definition to ${elementsPath}`);

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
downloadSpecs()
.then(() => {
    console.log("All message specifications downloaded successfully.");
});

convertSpecs()
.then(() => {
    console.log("All message specifications converted successfully.");
});