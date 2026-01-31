import * as exec from '@actions/exec';

export interface TaktRunOptions {
  task: string;
  workflow?: string;
  anthropicApiKey: string;
}

export interface TaktRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Execute a takt workflow via CLI.
 * Uses --task and --skip-git for non-interactive pipeline execution.
 * Requires takt to be installed globally (see ensureTaktInstalled).
 */
export async function runTakt(options: TaktRunOptions): Promise<TaktRunResult> {
  const args = ['--task', options.task, '--skip-git'];

  if (options.workflow) {
    args.push('--workflow', options.workflow);
  }

  let stdout = '';
  let stderr = '';

  const exitCode = await exec.exec('takt', args, {
    env: {
      ...process.env,
      ANTHROPIC_API_KEY: options.anthropicApiKey,
    },
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
      stderr: (data: Buffer) => {
        stderr += data.toString();
      },
    },
    ignoreReturnCode: true,
  });

  return { exitCode, stdout, stderr };
}

const MAX_COMMENT_LENGTH = 60000;

/**
 * Format takt execution result into a Markdown string suitable for an Issue comment.
 */
export function formatRunResult(result: TaktRunResult, workflow: string): string {
  const status = result.exitCode === 0 ? '✅ 完了' : '❌ 失敗';
  const lines: string[] = [];

  lines.push(`## TAKT ${status}`);
  lines.push('');
  lines.push(`**Workflow**: \`${workflow}\``);
  lines.push('');

  if (result.stdout) {
    let output = result.stdout;
    if (output.length > MAX_COMMENT_LENGTH) {
      output = output.slice(-MAX_COMMENT_LENGTH);
      lines.push('<details><summary>出力 (truncated)</summary>');
    } else {
      lines.push('<details><summary>出力</summary>');
    }
    lines.push('');
    lines.push('```');
    lines.push(output);
    lines.push('```');
    lines.push('');
    lines.push('</details>');
  }

  if (result.exitCode !== 0 && result.stderr) {
    let errorOutput = result.stderr;
    if (errorOutput.length > MAX_COMMENT_LENGTH) {
      errorOutput = errorOutput.slice(-MAX_COMMENT_LENGTH);
    }
    lines.push('');
    lines.push('<details><summary>エラー出力</summary>');
    lines.push('');
    lines.push('```');
    lines.push(errorOutput);
    lines.push('```');
    lines.push('');
    lines.push('</details>');
  }

  return lines.join('\n');
}
