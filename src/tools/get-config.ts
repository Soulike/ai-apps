import type {ChatCompletionFunctionTool} from 'openai/resources/chat/completions';
import type {ToolFunction} from '../ai/tool-registry.js';
import {
  getRepoPath,
  getBranch,
  getCheckIntervalHours,
  getReportDir,
} from '../helpers/env-helpers.js';

export interface Config {
  repoPath: string;
  branch: string;
  checkIntervalHours: number;
  reportDir: string;
}

export const definition: ChatCompletionFunctionTool = {
  type: 'function',
  function: {
    name: 'get_config',
    description:
      'Get the current RepoSentinel configuration including repo path, branch, check interval, and report directory.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

export const handler: ToolFunction<Record<string, never>> = async () => {
  const config: Config = {
    repoPath: getRepoPath(),
    branch: getBranch(),
    checkIntervalHours: getCheckIntervalHours(),
    reportDir: getReportDir(),
  };

  return JSON.stringify(config);
};
