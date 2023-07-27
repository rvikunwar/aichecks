import { testSuite } from "manten";

export default  testSuite(({ describe }) => {
    describe('CLI', ({ runTestSuite }) => {
        runTestSuite(import('./checks.js'))
    })
})