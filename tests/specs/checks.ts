import { testSuite, expect } from "manten";
import { assertOpenAiToken, files, fixtures } from "../utils/index.js";
import { getFileContent } from "../../src/utils/file.js";
import path from "path";

export default testSuite(({ describe }) => {

    assertOpenAiToken();

    describe('checks', async ({ test, describe }) => {
        test('fetch file content', async() => {
            const { fixture } = await fixtures(files);
            const contentFilePath = path.resolve('./tests/utils/testContent.py')
            const fileContent = await getFileContent(contentFilePath)
            expect(typeof fileContent).toBe('object');
            await fixture.rm()
        })

        test('should sent error if the file is not found', async () => {
            const { fixture } = await fixtures(files);
            const nonExistentFilePath = 'non_existent_file.txt';
            await expect(getFileContent(nonExistentFilePath)).rejects.toThrow('File not found or invalid file path.');
            await fixture.rm()
        })

        test('gets AI suggestions', async ()=>{
            const { fixture, aichecks } = await fixtures(files);
            const contentFilePath = path.resolve('./tests/utils/testContent.py')
            const { stdout, exitCode } = await aichecks([contentFilePath])
            expect(exitCode).toBe(0);
			await fixture.rm();

        })
    })
})
