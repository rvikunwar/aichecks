import { cli } from 'cleye'
import aichecks from './commands/aichecks.js';
import configCommand from './commands/config.js';

cli({
        name: 'aichecks',
        parameters: [
            '<file path>',
        ],
        commands: [
            configCommand
        ],
    },
	(argv) => {
        const filePath = argv._.filePath;
        aichecks(filePath, 1);
	}
)