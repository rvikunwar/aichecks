import * as fs from 'fs';
import * as readline from 'readline';
import { KnownError } from './error.js';

export interface batchType {
    content: string
    startLine: number
    endLine: number
}

export const fileExists = (filePath: string) => {
    return fs.existsSync(filePath)
}

export const getFileContent = async (filePath: string) => {
    try {
        if (!fileExists(filePath)) {
            throw new KnownError('File not found or invalid file path.');
        }
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({ input: fileStream })

        const batches: batchType[] = [];
        const batchContentSize = 5000;
        let lineNumber = 1;
        let characterCount = 0;
        let currentBatchContent = '';
        let currentBatchStartLine = 1;

        rl.on('line', (line) => {
            const lineLength = line.length + 1;
            if (lineLength > batchContentSize) {
                const chunkSize = batchContentSize;
                for (let i = 0; i < line.length; i += chunkSize) {
                    const chunk = line.slice(i, i + chunkSize);
                    if (chunk.length <= batchContentSize/6) {
                        currentBatchContent = `${lineNumber}. ${chunk}\n`;
                        characterCount += lineLength;
                        lineNumber++;
                    } else {
                        currentBatchContent = `${lineNumber}. ${chunk}\n`;
                        const currentBatch: batchType = {
                            content: currentBatchContent,
                            startLine: currentBatchStartLine,
                            endLine: lineNumber,
                        };
                        currentBatchContent = "";
                        batches.push(currentBatch);
                    }
                }
            } else if (characterCount + lineLength <= batchContentSize) {
                currentBatchContent += `${lineNumber}. ${line}\n`;
                characterCount += lineLength;
                lineNumber++;
            } else {
                const currentBatch: batchType = {
                    content: currentBatchContent,
                    startLine: currentBatchStartLine,
                    endLine: lineNumber - 1
                };
                batches.push(currentBatch);
                currentBatchContent = `${lineNumber}. ${line}\n`;
                characterCount = lineLength;
                currentBatchStartLine = lineNumber;
                lineNumber++;
            }
        });

        await new Promise((resolve) => {
            rl.on('close', () => {
                const lastBatch: batchType = {
                    content: currentBatchContent,
                    startLine: currentBatchStartLine,
                    endLine: lineNumber - 1, 
                };
                batches.push(lastBatch);
                resolve(null)
            })
        })

        return batches;
    } catch (error) {
        throw error;
    }
}

export const analyzeFileContent = async (fileContent: string) => {

}