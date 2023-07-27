import { describe } from "manten";

describe('aichecks', ({ runTestSuite }) => { 
    runTestSuite(import('./specs/index.js'))
})