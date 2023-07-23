import {
    black, dim, green, red, bgCyan, cyan,
} from 'kolorist';
import {
    intro, outro, spinner, select, confirm, isCancel,
} from '@clack/prompts';
import { getConfig } from '../utils/config.js';
import { KnownError, handleCliError } from '../utils/error.js';
import { generateChecksAndFeedback } from '../utils/openai.js';
import { getFileContent } from '../utils/file.js';


export default async (
    filePath: string,
    generate: number | undefined,
) => (async () => {
    intro(bgCyan(black(' aichecks ')));
    const detectingFile = spinner();
    detectingFile.start('Detecting file');
    await new Promise((resolve) => setTimeout(() => resolve(null), 1000))
    const fileContent = await getFileContent(filePath)

    detectingFile.stop('File analysis completed!')

    const { env } = process;
    const config = await getConfig({
        OPENAI_API_KEY: env.OPENAI_KEY || env.OPENAI_API_KEY,
        generate: generate?.toString(),
    });

    const s = spinner();
    const intend = "     ";
    s.start('The AI is analyzing your changes');
    interface messageInterface {
        line: number, suggestion: string
    }
    let messages: messageInterface[];
    try {
        messages = await generateChecksAndFeedback(
            config.OPENAI_API_KEY,
            config.model,
            fileContent,
            config.locale,
            config.generate,
            config['max-length'],
            config.timeout,
        );
    } finally {
        s.stop('Code analyzed and suggestions are');
    }

    if (messages.length === 0) {
        outro(`${green('✔')} Your code is fine, you can go ahead!`);
        return;
    }
    await new Promise((resolve) => setTimeout(() => resolve(null), 1000))
    messages.forEach((suggestionObj) => {
        console.log(`${red(intend + '#'+suggestionObj.line)} ${cyan(suggestionObj.suggestion)}`)
    })    

    outro(`${green('✔')} Apply changes and ignore not related suggestion!`);
})().catch((error) => {
    console.log("errorrrr", error)
    outro(`${red('✖')} ${error.message}`);
    handleCliError(error);
    process.exit(1);
});