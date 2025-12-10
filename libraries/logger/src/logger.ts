import {ColorLogger} from './color-logger.js';

function isNonProduction(): boolean {
  return process.env['NODE_ENV'] !== 'production';
}

export const logger = {
  error: (message: string, error?: unknown): void => {
    ColorLogger.red.error(`❌ [ERROR] ${message}${error ? `: ${error}` : ''}`);
  },

  info: (message: string): void => {
    ColorLogger.blue.log(`ℹ️  [INFO] ${message}`);
  },

  debug: (label: string, data: unknown): void => {
    if (isNonProduction()) {
      ColorLogger.gray.log(
        `🔍 [DEBUG] ${label}: ${JSON.stringify(data, null, 2)}`,
      );
    }
  },

  toolStart: (name: string, id: string, input: string): void => {
    ColorLogger.yellow.log(`🔧 [TOOL] --- ${name} (${id}) ---`);
    ColorLogger.yellow.log(`🔧 [TOOL] Input: ${input}`);
  },

  toolEnd: (name: string, id: string, output: string): void => {
    if (isNonProduction()) {
      ColorLogger.yellow.log(`🔧 [TOOL] Output: ${output}`);
    }
    ColorLogger.yellow.log(`🔧 [TOOL] --- End ${name} (${id}) ---`);
  },

  toolError: (name: string, id: string, error: string): void => {
    ColorLogger.red.error(`🔧 [TOOL] Error: ${error}`);
    ColorLogger.yellow.log(`🔧 [TOOL] --- End ${name} (${id}) ---`);
  },

  assistant: (content: string): void => {
    ColorLogger.green.log(`🤖 [ASSISTANT] ${content}`);
  },

  subagent: (content: string): void => {
    ColorLogger.cyan.log(`🤖 [SUBAGENT] ${content}`);
  },

  subagentToolStart: (name: string, id: string, input: string): void => {
    ColorLogger.cyan.log(`🔧 [SUBAGENT-TOOL] --- ${name} (${id}) ---`);
    ColorLogger.cyan.log(`🔧 [SUBAGENT-TOOL] Input: ${input}`);
  },

  subagentToolEnd: (name: string, id: string, output: string): void => {
    if (isNonProduction()) {
      ColorLogger.cyan.log(`🔧 [SUBAGENT-TOOL] Output: ${output}`);
    }
    ColorLogger.cyan.log(`🔧 [SUBAGENT-TOOL] --- End ${name} (${id}) ---`);
  },

  subagentToolError: (name: string, id: string, error: string): void => {
    ColorLogger.red.error(`🔧 [SUBAGENT-TOOL] Error: ${error}`);
    ColorLogger.cyan.log(`🔧 [SUBAGENT-TOOL] --- End ${name} (${id}) ---`);
  },
};

export type Logger = typeof logger;
