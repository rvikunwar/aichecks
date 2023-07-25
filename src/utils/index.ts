import { batchType } from "./file.js";

export const getBatchLabel = (batch: batchType) => {
    if(batch.startLine === batch.endLine){
        return `Line ${batch.startLine}`
    } else {
        return `Line ${batch.startLine} - ${batch.endLine}`
    }
}


const responseFormat = `[{"line": <number>, "suggestion": <string>}]`

const specifyResponseFormat = () => `The output response should be in the JSON format:\n${responseFormat}`;


export const generateGTPResponse = (
    locale: string,
    maxLength: number,
) => [
    'Analyse the following code and generate the valid and logical suggestion for improving the code quality with the given specifications below:',
    `Message language: ${locale}`,
    `Suggestion must be a maximum of ${maxLength} characters.`,
    `Exclude anything unnecessary such as translation.`,
    `Suggestion should be for: ${JSON.stringify(suggestionOptions)} and if everything is fine then return an empty array`,
    `And don't provide suggestions for: ${JSON.stringify(ignoreSuggestionFor)}`,
    specifyResponseFormat(),
    `Example of response: ${JSON.stringify(responseExample)}`
].filter(Boolean).join('\n');

const suggestionOptions = ['Spelling and Typographical Errors', 
    'Incorrect statements', 'Incorrect Statements', 'Security Vulnerabilities', 'Code Duplication']

const ignoreSuggestionFor = ['import statements', 'comments']

const responseExample = [
    {"line": 8, "suggestion": "Remove the unused variable 'unusedVar'."},
    {"line": 42, "suggestion": "Rename the function 'calculat' to 'calculate'."}, // incorrect function name
    {"line": 10, "suggestion": "Fix the indentation in this block."}, // fix intendation
    {"line": 20, "suggestion": "Define the variable 'userInput' before using it."}, // undefined variable
    {"line": 16, "suggestion": "Fix the typo in 'informatione' to 'information'."}, // fix typo
    {"line": 12, "suggestion": "Call the function 'calculateTotal()' with the appropriate arguments."}, // invalid function call
    {"line": 30, "suggestion": "Remove the unreachable code after the return statement."}, // unreachable code
    {"line": 22, "suggestion": "Remove the unnecessary code that is not being used."} // unnecessary code
]