import {execFile} from 'child_process';
import {promisify} from 'util';
import {getRepoPath} from './env-helpers.js';

const execFileAsync = promisify(execFile);

export async function execGit(args: string[]): Promise<string> {
  const repoPath = getRepoPath();

  const {stdout} = await execFileAsync('git', ['-C', repoPath, ...args], {
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large diffs
  });

  return stdout.trim();
}
