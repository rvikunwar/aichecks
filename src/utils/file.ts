import * as fs from 'fs';
import * as readline from 'readline';
import { KnownError } from './error.js';

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

        let lineNumber = 1;
        let content = '';

        rl.on('line', (line) => {
            content += `${lineNumber}. ${line}\n`;
            lineNumber++;
        });

        await new Promise((resolve)=>{
            rl.on('close', () => {
                resolve(null)
            })
        })

        return content;
    } catch (error) {
        throw error;
    }
}