import type {OpenAITool} from '@ai/openai-session';
import {runAgent} from '@ai/agent';
import {ToolRegistry} from '@ai/openai-session';
import {logger} from '@helpers/logger';
import {getChangeDetails, getChangeDiff} from '@openai-tools/gerrit';
import {
  getOpenAIApiKey,
  getOpenAIBaseURL,
  getOpenAIModel,
} from '../helpers/env-helpers.js';
import {createCommitAnalyzerSubagentSystemPrompt} from '../prompts/commit-analyzer-subagent-system-prompt.js';

export interface AnalyzeGerritChangeParams {
  /** Gerrit host URL */
  host: string;
  /** Change ID to analyze */
  changeId: string;
}

export const analyzeGerritChange: OpenAITool<AnalyzeGerritChangeParams> = {
  definition: {
    type: 'function',
    function: {
      name: 'analyze_commit',
      description: `Analyze a Gerrit change in detail using a sub-agent.

Use this tool for changes that need detailed analysis:
- Breaking changes
- New features
- Security-related changes
- Large changes (5+ files or 100+ lines)
- Changes to critical files

Returns a JSON object with classification, impact assessment, and key changes.`,
      parameters: {
        type: 'object',
        properties: {
          host: {
            type: 'string',
            description: 'Gerrit host URL.',
          },
          changeId: {
            type: 'string',
            description: 'Change ID to analyze.',
          },
        },
        required: ['host', 'changeId'],
      },
    },
  },
  handler: async (args): Promise<string> => {
    const identifier = crypto.randomUUID().slice(0, 8);
    const registry = new ToolRegistry();
    registry.register(getChangeDetails);
    registry.register(getChangeDiff);

    // Build user prompt inline - specific to Gerrit
    const userPrompt = `Analyze change ${args.changeId}.

Use these parameters for tool calls:
- host: "${args.host}"
- changeId: "${args.changeId}"`;

    const result = await runAgent(
      {
        apiKey: getOpenAIApiKey(),
        baseURL: getOpenAIBaseURL(),
        model: getOpenAIModel(),
        systemPrompt: createCommitAnalyzerSubagentSystemPrompt('gerrit'),
        registry,
        onToolStart: (name, toolId, toolArgs) =>
          logger.subagentToolStart(identifier, name, toolId, toolArgs),
        onToolEnd: (name, toolId, output) =>
          logger.subagentToolEnd(identifier, name, toolId, output),
        onToolError: (name, toolId, error) =>
          logger.subagentToolError(identifier, name, toolId, error),
        onContent: (content) => logger.subagent(identifier, content),
      },
      userPrompt,
    );

    return result.content;
  },
};
