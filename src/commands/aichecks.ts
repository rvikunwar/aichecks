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
import { getBatchLabel } from '../utils/index.js';

interface messageInterface {
    line: number, suggestion: string
}

export default async (
    filePath: string,
    generate: number | undefined,
) => (async () => {
    intro(bgCyan(black(' aichecks ')));

    const { env } = process;
    const config = await getConfig({
        OPENAI_API_KEY: env.OPENAI_KEY || env.OPENAI_API_KEY,
        generate: generate?.toString(),
    });

    const detectingFile = spinner();
    detectingFile.start('Detecting file');
    await new Promise((resolve) => setTimeout(() => resolve(null), 1000));
    const batches = await getFileContent(filePath);
    detectingFile.stop('File analysis completed!');

    let messages: messageInterface[];
    const indent = "     ";

    const fetchAIResponse = async (fileContent: string) => {
        const s = spinner();
        s.start('The AI is analyzing your code');

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
            return messages;
        } finally {
            s.stop('Code analyzed and suggestions are');
        }
    }

    if (batches.length === 1) {
        messages = await fetchAIResponse(batches[0].content)
        if (messages.length === 0) {
            outro(`${green('✔')} Your code is fine, you can go ahead!`);
            process.exit(1);
        }
        await new Promise((resolve) => setTimeout(() => resolve(null), 1000))
        messages.forEach((suggestionObj) => {
            console.log(`${red(indent + '#' + suggestionObj.line)} ${cyan(suggestionObj.suggestion)}`)
        })
    } else {
        async function listBatches(text?: string){
            const selected: any = await select({
                message: `${text?text:'Pick a batch to check'}: ${dim('(Ctrl+c to exit)')}`,
                options: batches.map(value => ({ label: getBatchLabel(value), value })),
            });
    
            if (isCancel(selected)) {
                outro('AI review cancelled!');
                process.exit(1);
            }
            if (selected && selected.content) {
                messages = await fetchAIResponse(selected.content)
                if (messages.length === 0) {
                    outro(`${green('✔')} Your code is fine, you can go ahead!`);
                } else {
                    await new Promise((resolve) => setTimeout(() => resolve(null), 1000))
                    messages.forEach((suggestionObj) => {
                        console.log(`${red(indent + '#' + suggestionObj.line)} ${cyan(suggestionObj.suggestion)}`)
                    })
                }
                await listBatches('Or continue, pick another batch to check')
            }
        }
        await listBatches()
    }

    outro(`${green('✔')} Apply provided changes and ignore unrelated suggestion!`);
})().catch((error) => {
    console.log("error", error)
    outro(`${red('✖')} ${error.message}`);
    handleCliError(error);
    process.exit(1);
});