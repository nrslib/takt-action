import * as core from '@actions/core';
import * as exec from '@actions/exec';

export interface TaktRunOptions {
  issueNumber: number;
  workflow?: string;
  model?: string;
  provider?: string;
  repo: string;
  autoPr: boolean;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  logOutput?: boolean;
}

export interface TaktRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Execute a takt workflow via CLI in pipeline mode.
 * Uses --pipeline for non-interactive execution, --issue for GitHub issue context,
 * and --auto-pr for PR creation.
 * Requires takt to be installed globally (see ensureTaktInstalled).
 */
export async function runTakt(options: TaktRunOptions): Promise<TaktRunResult> {
  const args = ['--pipeline', '--issue', String(options.issueNumber), '--repo', options.repo];

  if (options.autoPr) {
    args.push('--auto-pr');
  }

  if (options.workflow) {
    args.push('--workflow', options.workflow);
  }

  if (options.model) {
    args.push('--model', options.model);
  }

  if (options.provider) {
    args.push('--provider', options.provider);
  }

  // Log the command for debugging
  core.info(`Executing: takt ${args.join(' ')}`);

  let stdout = '';
  let stderr = '';

  const env = {
    ...process.env,
    ...(options.anthropicApiKey && { TAKT_ANTHROPIC_API_KEY: options.anthropicApiKey }),
    ...(options.openaiApiKey && { TAKT_OPENAI_API_KEY: options.openaiApiKey }),
  };

  const exitCode = await exec.exec('takt', args, {
    env,
    listeners: {
      stdout: (data: Buffer) => {
        const text = data.toString();
        stdout += text;
        if (options.logOutput) {
          core.info(text.trimEnd());
        }
      },
      stderr: (data: Buffer) => {
        const text = data.toString();
        stderr += text;
        if (options.logOutput) {
          core.error(text.trimEnd());
        }
      },
    },
    silent: !options.logOutput,
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
