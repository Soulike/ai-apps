import type {ChatCompletionFunctionTool} from 'openai/resources/chat/completions';
import type {ToolFunction} from '../ai/tool-registry.js';
import {execGit} from '../helpers/git-helpers.js';

export interface ListChangedFilesParams {
  branch: string;
  hours: number;
}

export const definition: ChatCompletionFunctionTool = {
  type: 'function',
  function: {
    name: 'list_changed_files',
    description:
      'List all unique files that were changed in commits within the specified time window.',
    parameters: {
      type: 'object',
      properties: {
        branch: {
          type: 'string',
          description: 'Branch name to check for changed files.',
        },
        hours: {
          type: 'number',
          description: 'Number of hours to look back.',
        },
      },
      required: ['branch', 'hours'],
    },
  },
};

export const handler: ToolFunction<ListChangedFilesParams> = async (args) => {
  const {branch, hours} = args;
  const since = `${hours} hours ago`;

  const output = await execGit([
    'log',
    branch,
    `--since="${since}"`,
    '--name-only',
    '--pretty=format:',
  ]);

  if (!output) {
    return JSON.stringify([]);
  }

  const files = [
    ...new Set(
      output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== ''),
    ),
  ];

  return JSON.stringify(files);
};
