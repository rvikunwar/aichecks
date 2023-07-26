import https from 'https';
import type { ClientRequest, IncomingMessage } from 'http';
import type { CreateChatCompletionRequest, CreateChatCompletionResponse } from 'openai';
import { type TiktokenModel } from '@dqbd/tiktoken';
import { KnownError } from './error.js';
import { generateGTPResponse } from './index.js';
import { contentType } from './file.js';

const createPost = async (
    hostname: string,
    path: string,
    headers: Record<string, string>,
    reqBody: unknown,
    timeout: number,
) => new Promise<{
    request: ClientRequest,
    response: IncomingMessage,
    data: string
}>((resolve, reject) => {

    const content = JSON.stringify(reqBody)

    const request = https.request(
        {
            port: 443,
            hostname,
            path,
            method: 'POST',
            headers: {
                ...headers,
                "Content-Type": 'application/json',
                "Content-Length": Buffer.byteLength(content)
            },
            timeout
        },

        (response) => {

            const body: Buffer[] = []
            response.on('data', chunk => body.push(chunk));
            response.on('end', () => {
                resolve({
                    request,
                    response,
                    data: Buffer.concat(body).toString(),
                })
            })
        }
    )

    request.on('error', reject)
    request.on('timeout', () => {
        request.destroy();
        reject(new KnownError(`Time out error: request took over ${timeout}ms. Try increasing the \`timeout\` config, or checking the OpenAI API status https://status.openai.com`));
    })

    request.write(content)
    request.end()
})


const createChatCompletion = async (
    apiKey: string,
    json: CreateChatCompletionRequest,
    timeout: number,
) => {
    const { response, data } = await createPost(
        'api.openai.com',
        '/v1/chat/completions',
        {
            Authorization: `Bearer ${apiKey}`,
        },
        json,
        timeout,
    );

    if (
        !response.statusCode
        || response.statusCode < 200
        || response.statusCode > 299
    ) {
        let errorMessage = `OpenAI API Error: ${response.statusCode} - ${response.statusMessage}`;

        if (data) {
            errorMessage += `\n\n${data}`;
        }

        if (response.statusCode === 500) {
            errorMessage += '\n\nCheck the API status: https://status.openai.com';
        }

        throw new Error(errorMessage);
    }

    return JSON.parse(data) as CreateChatCompletionResponse;
};


const sanitizeMessage = (message: string) => {
    const arrayOfObjects = JSON.parse(message);
    return arrayOfObjects;
}


export const generateChecksAndFeedback = async (
    apiKey: string,
    model: TiktokenModel,
    fileContent: contentType[],
    locale: string,
    completions: number,
    maxLength: number,
    timeout: number,
    proxy?: string,
): Promise<{ line: number, suggestion: string }[]> => {
    try {        
        const completion = await createChatCompletion(
            apiKey,
            {
                model,
                messages: [
                    {
                        role: 'system',
                        content: generateGTPResponse(locale, maxLength),
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(fileContent),
                    },
                ],
                temperature: 1.2,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                max_tokens: 2000,
                n: completions,
            },
            timeout,
        );

        const data = completion.choices
            .filter(choice => choice.message?.content)
            .map(choice => sanitizeMessage(choice.message && choice.message.content
                ? choice.message.content : ''))
        return data[0]
    } catch (error) {
        const errorAsAny = error as any;
        if (errorAsAny.code === 'ENOTFOUND') {
            throw new Error(`Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`);
        }
        throw errorAsAny;
    }
};