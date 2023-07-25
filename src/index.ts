import { cli } from 'cleye'
import aichecks from './commands/aichecks.js';
import configCommand from './commands/config.js';
import { description, version } from '../package.json';

cli({
        name: 'aichecks',
        version,
        parameters: [
            '<file path>',
        ],
        commands: [
            configCommand
        ],
        help: {
			description,
		},
    },
	(argv) => {
        const filePath = argv._.filePath;
        aichecks(filePath, 1);
	}
)