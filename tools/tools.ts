// @ts-nocheck
import fs from "fs";
import path from "path";
import { Worker } from "worker_threads";

import { MESSAGE_TYPES } from "../nodes/constants"; // Assuming constants.ts exists

const version: string = "d01b";
const downloadPath: string = path.join(__dirname, "..", 'nodes', "specs", version);

const downloadSpecs = async () => {
    console.log("Starting message specification download...");
    const workerPromises: Promise<void>[] = [];
    const maxWorkers = 5; // You can adjust this based on your system's capabilities
    let activeWorkers = 0;
    const typeNamesToProcess = [...MESSAGE_TYPES]; // Create a mutable copy

    const createWorker = (typeName: string): Promise<void> => {
        return new Promise((resolve) => {
            activeWorkers++;
            const worker = new Worker(path.join(__dirname, 'workerDownload.ts'));

            worker.postMessage({ typeName, version, downloadPath });

            worker.on('message', (msg) => {
                if (msg.status === 'success') {
                    console.log(`Successfully downloaded ${msg.typeName}.`);
                } else if (msg.status === 'skipped') {
                    console.log(msg.message);
                } else if (msg.status === 'error') {
                    console.warn(msg.message);
                }
                worker.terminate();
                activeWorkers--;
                processNextDownload();
                resolve();
            });

            worker.on('error', (err) => {
                console.error(`Worker error for ${typeName}:`, err);
                worker.terminate();
                activeWorkers--;
                processNextDownload();
                resolve();
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code} for ${typeName}`);
                }
            });
        });
    };

    const processNextDownload = () => {
        if (typeNamesToProcess.length > 0 && activeWorkers < maxWorkers) {
            const nextTypeName = typeNamesToProcess.shift();
            if (nextTypeName) {
                workerPromises.push(createWorker(nextTypeName));
            }
        }
    };

    // Initialize workers up to maxWorkers
    for (let i = 0; i < Math.min(maxWorkers, typeNamesToProcess.length); i++) {
        processNextDownload();
    }

    await Promise.all(workerPromises);
    console.log("All message specifications download process initiated (some might have been skipped/errored).");
};

const convertSpecs = async () => {
    console.log("Starting message specification conversion...");
    const workerPromises: Promise<void>[] = [];
    const maxWorkers = 15; // You can adjust this
    let activeWorkers = 0;
    const typeNamesToProcess = [...MESSAGE_TYPES]; // Create a mutable copy

    const createWorker = (typeName: string): Promise<void> => {
        return new Promise((resolve) => {
            activeWorkers++;
            const worker = new Worker(path.join(__dirname, 'workerConvert.ts'));
            const specFileLocation = path.join(downloadPath, `${typeName}.json`);

            worker.postMessage({ specFileLocation, messageType: typeName, messageVersion: version, downloadPath });

            worker.on('message', (msg) => {
                if (msg.status === 'success') {
                    console.log(`Successfully converted ${msg.messageType}.`);
                } else if (msg.status === 'skipped') {
                    console.log(msg.message);
                } else if (msg.status === 'error') {
                    console.warn(msg.message);
                }
                worker.terminate();
                activeWorkers--;
                processNextConvert();
                resolve();
            });

            worker.on('error', (err) => {
                console.error(`Worker error for ${typeName}:`, err);
                worker.terminate();
                activeWorkers--;
                processNextConvert();
                resolve();
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code} for ${typeName}`);
                }
            });
        });
    };

    const processNextConvert = () => {
        if (typeNamesToProcess.length > 0 && activeWorkers < maxWorkers) {
            const nextTypeName = typeNamesToProcess.shift();
            if (nextTypeName) {
                workerPromises.push(createWorker(nextTypeName));
            }
        }
    };

    // Initialize workers up to maxWorkers
    for (let i = 0; i < Math.min(maxWorkers, typeNamesToProcess.length); i++) {
        processNextConvert();
    }

    await Promise.all(workerPromises);
    console.log("All message specifications conversion process initiated (some might have been skipped/errored).");
};


// Run with `npx ts-node tools.ts`
const main = async () => {
    // Ensure the download and converted directories exist
    const convertedPath = path.join(downloadPath, 'converted');
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }
    if (!fs.existsSync(convertedPath)) {
        fs.mkdirSync(convertedPath, { recursive: true });
    }

    await downloadSpecs();
    console.log("All message specifications download complete.");
    await convertSpecs();
    console.log("All message specifications conversion complete.");
};

main()
    .catch((error) => {
        console.error("An error occurred while running the script:", error);
        process.exit(1); // Exit with an error code
    });