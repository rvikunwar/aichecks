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
    'Analyse the following code (containing line number with code in json format) and generate the valid and logical suggestion for improving the code quality with the given specifications below:',
    `Message language: ${locale}`,
    `Suggestion must be a maximum of ${maxLength} characters.`,
    `Exclude anything unnecessary such as translation. And ignore the line number (ex. 1., 2., 3., 4. ...), this is just for identification of code line number.`,
    `Suggestion should be for: ${JSON.stringify(suggestionOptions)} and if everything is fine then return an empty array`,
    `And don't provide suggestions for: ${JSON.stringify(ignoreSuggestionFor)}`,
    specifyResponseFormat(),
    `Example of response: ${JSON.stringify(responseExample)}`
].filter(Boolean).join('\n');

const suggestionOptions = ['Spelling and Typographical Errors', 
    'Incorrect statements', 'Security Vulnerabilities', 'Code Duplication']

const ignoreSuggestionFor = ['import statements', 'comments']

const responseExample = [
    {"line": 5, "suggestion": "Consider using 'const' instead of 'let' for 'PI' since it is a constant value."}, // const declaration for PI
    {"line": 8, "suggestion": "Remove the unused variable 'unusedVar'."},
    {"line": 10, "suggestion": "Fix the indentation in this block."}, // fix indentation
    {"line": 12, "suggestion": "Call the function 'calculateTotal()' with the appropriate arguments."}, // invalid function call
    {"line": 14, "suggestion": "Consider using template literals for string concatenation in this line."}, // use template literals
    {"line": 16, "suggestion": "Fix the typo in 'informatione' to 'information'."}, // fix typo
    {"line": 18, "suggestion": "Use a more descriptive variable name than 'data' to improve code readability."}, // improve variable naming
    {"line": 20, "suggestion": "Define the variable 'userInput' before using it."}, // undefined variable
    {"line": 22, "suggestion": "Remove the unnecessary code that is not being used."}, // unnecessary code
    {"line": 25, "suggestion": "Add a comment explaining the purpose of this code block."}, // missing comment
    {"line": 28, "suggestion": "Extract the repeated logic into a separate function to reduce code duplication."}, // refactor repeated logic
    {"line": 30, "suggestion": "Remove the unreachable code after the return statement."}, // unreachable code
    {"line": 36, "suggestion": "Avoid using 'var' for 'tempVar'. Use 'let' or 'const' instead."}, // avoid using 'var'
    {"line": 38, "suggestion": "Wrap this code block with a try-catch to handle potential errors."}, // add try-catch block
    {"line": 42, "suggestion": "Rename the function 'calculat' to 'calculate'."}, // incorrect function name
];