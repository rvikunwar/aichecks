import * as fs from 'fs';
import * as readline from 'readline';
import { KnownError } from './error.js';

export interface batchType {
    content: contentType[]
    startLine: number
    endLine: number
}

export interface contentType {
    line: number;
    code: string;
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
        const batchContentSize = 2500;
        let lineNumber = 1;
        let characterCount = 0;
        let currentBatchContent: contentType[] = [];
        let currentBatchStartLine = 1;

        rl.on('line', (line) => {
            const lineLength = line.length + 1;
            if (lineLength > batchContentSize) {
                const chunkSize = batchContentSize;
                for (let i = 0; i < line.length; i += chunkSize) {
                    let chunk = line.slice(i, i + chunkSize);
                    if (chunk.length <= batchContentSize/6) {
                        currentBatchContent = [{ line: lineNumber, code: chunk.trim() }]
                        characterCount += lineLength;
                        lineNumber++;
                    } else {
                        currentBatchContent = [{ line: lineNumber, code: chunk.trim() }]
                        const currentBatch: batchType = {
                            content: currentBatchContent,
                            startLine: currentBatchStartLine,
                            endLine: lineNumber,
                        };
                        currentBatchContent = [];
                        batches.push(currentBatch);
                    }
                }
            } else if (characterCount + lineLength <= batchContentSize) {
                currentBatchContent.push({ line: lineNumber, code: line.trim() })
                characterCount += lineLength;
                lineNumber++;
            } else {
                const currentBatch: batchType = {
                    content: currentBatchContent,
                    startLine: currentBatchStartLine,
                    endLine: lineNumber - 1
                };
                batches.push(currentBatch);
                currentBatchContent = [{ line: lineNumber, code: line.trim() }]
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