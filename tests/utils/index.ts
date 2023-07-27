import path from 'path'
import { execa, execaNode, type Options } from 'execa';
import fs from 'fs/promises'
import {
	createFixture,
	type FileTree,
	type FsFixture,
} from 'fs-fixture';

const buildPath = path.resolve('./dist/index.js');


const createAiSuggestions = (fixture: FsFixture) => {
	const homeEnv = {
		HOME: fixture.path,
		USERPROFILE: fixture.path,
	};

	return (
		args?: string[],
		options?: Options,
	) => execaNode(buildPath, args, {
		cwd: fixture.path,
		...options,
		extendEnv: false,
		env: {
			...homeEnv,
			...options?.env,
		},
		nodeOptions: [],
	});
};

export const fixtures = async (
	source?: string | FileTree,
) => {
	const fixture = await createFixture(source);
	const aichecks = createAiSuggestions(fixture);

	return {
		fixture,
		aichecks,
	};
};

export const files = Object.freeze({
	'.aichecks': `OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`,
})

export const assertOpenAiToken = () => {
	if (!process.env.OPENAI_API_KEY) {
        throw new Error('⚠️  process.env.OPENAI_API_KEY is necessary to run these tests. Skipping...');
	}
};
