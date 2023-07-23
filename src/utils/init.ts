
const responseFormat = `[{"line": <number>, "suggestion": <string>}]`

const specifyResponseFormat = () => `The output response should be in the JSON format:\n${responseFormat}`;


export const generateGTPResponse = (
    locale: string,
    maxLength: number,
) => [
    'Analyse the following JS code and generate the valid and logical suggestion for improving the code quality with the given specifications below:',
    `Message language: ${locale}`,
    `Suggestion must be a maximum of ${maxLength} characters.`,
    `Exclude anything unnecessary such as translation. Your entire response should small and upto point.`,
    `Suggestion should only be for: ${JSON.stringify(suggestionOptions)} and if everything is fine then return an empty array`,
    `And ignore: ${JSON.stringify(ignoreSuggestionFor)}`,
    specifyResponseFormat(),
    `Example of response: ${JSON.stringify(responseExample)}`
].filter(Boolean).join('\n');

const suggestionOptions = ['Spelling and Typographical Errors', 'Incorrect statements']

const ignoreSuggestionFor = ['import statements']

const responseExample = [
    {"line": 16, "suggestion": "Fix the typo in 'informatione' to 'information'."},
]