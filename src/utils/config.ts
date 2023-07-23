import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ini from 'ini';
import type { TiktokenModel } from '@dqbd/tiktoken';
import { KnownError } from './error.js';
import { fileExists } from './file.js';


const { hasOwnProperty } = Object.prototype;
export const hasOwn = (object: unknown, key: PropertyKey) => hasOwnProperty.call(object, key);

const parseAssert = (
    name: string,
    condition: any,
    message: string,
) => {
    if (!condition) {
        throw new KnownError(`Invalid config property ${name}: ${message}`);
    }
};


const configParsers = {
    OPENAI_API_KEY(key?: string) {
        if (!key) {
            throw new KnownError('Please set your OpenAI API key via `aichecks config set OPENAI_API_KEY=<your token>`');
        }
        parseAssert('OPENAI_KEY', key.startsWith('sk-'), 'Must start with "sk-"');
        return key;
    },
    locale(locale?: string) {
        if (!locale) {
            return 'en';
        }

        parseAssert('locale', locale, 'Cannot be empty');
        parseAssert('locale', /^[a-z-]+$/i.test(locale), 'Must be a valid locale (letters and dashes/underscores). You can consult the list of codes in: https://wikipedia.org/wiki/List_of_ISO_639-1_codes');
        return locale;
    },
    generate(count?: string) {
        if (!count) {
            return 1;
        }

        parseAssert('generate', /^\d+$/.test(count), 'Must be an integer');

        const parsed = Number(count);
        parseAssert('generate', parsed > 0, 'Must be greater than 0');
        parseAssert('generate', parsed <= 5, 'Must be less or equal to 5');

        return parsed;
    },
    model(model?: string) {
        if (!model || model.length === 0) {
            return 'gpt-3.5-turbo';
        }

        return model as TiktokenModel;
    },
    timeout(timeout?: string) {
        if (!timeout) {
            return 50_000;
        }

        parseAssert('timeout', /^\d+$/.test(timeout), 'Must be an integer');

        const parsed = Number(timeout);
        parseAssert('timeout', parsed >= 500, 'Must be greater than 500ms');

        return parsed;
    },
    'max-length'(maxLength?: string) {
        if (!maxLength) {
            return 200;
        }

        parseAssert('max-length', /^\d+$/.test(maxLength), 'Must be an integer');

        const parsed = Number(maxLength);
        parseAssert('max-length', parsed >= 20, 'Must be greater than 20 characters');

        return parsed;
    },
} as const;

type ConfigKeys = keyof typeof configParsers;

type RawConfig = {
    [key in ConfigKeys]?: string;
};

export type ValidConfig = {
    [Key in ConfigKeys]: ReturnType<typeof configParsers[Key]>;
};

const configPath = path.join(os.homedir(), '.aichecks');

const readConfigFile = async (): Promise<RawConfig> => {

    if (!fileExists(configPath)) {
        return Object.create(null);
    }

    const configString = await fs.readFile(configPath, 'utf8');
    return ini.parse(configString);
};

export const getConfig = async (
    cliConfig?: RawConfig,
    suppressErrors?: boolean,
): Promise<ValidConfig> => {
    const config = await readConfigFile();
    const parsedConfig: Record<string, unknown> = {};

    for (const key of Object.keys(configParsers) as ConfigKeys[]) {
        const parser = configParsers[key];
        const value = cliConfig?.[key] ?? config[key];

        if (suppressErrors) {
            try {
                parsedConfig[key] = parser(value);
            } catch { }
        } else {
            parsedConfig[key] = parser(value);
        }
    }

    return parsedConfig as ValidConfig;
};

export const setConfigs = async (
    keyValues: [key: string, value: string][],
) => {
    const config = await readConfigFile();

    for (const [key, value] of keyValues) {
        if (!hasOwn(configParsers, key)) {
            throw new KnownError(`Invalid config property: ${key}`);
        }

        const parsed = configParsers[key as ConfigKeys](value);
        config[key as ConfigKeys] = parsed as any;
    }

    await fs.writeFile(configPath, ini.stringify(config), 'utf8');
};