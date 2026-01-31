import * as exec from '@actions/exec';
/**
 * Execute a takt workflow via CLI.
 * Uses --issue for GitHub issue context and --auto-pr for PR creation.
 * Requires takt to be installed globally (see ensureTaktInstalled).
 */
export async function runTakt(options) {
    const args = ['--issue', String(options.issueNumber), '--repo', options.repo];
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
    if (options.createWorktree) {
        args.push('--create-worktree');
    }
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
            stdout: (data) => {
                stdout += data.toString();
            },
            stderr: (data) => {
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
export function formatRunResult(result, workflow) {
    const status = result.exitCode === 0 ? '✅ 完了' : '❌ 失敗';
    const lines = [];
    lines.push(`## TAKT ${status}`);
    lines.push('');
    lines.push(`**Workflow**: \`${workflow}\``);
    lines.push('');
    if (result.stdout) {
        let output = result.stdout;
        if (output.length > MAX_COMMENT_LENGTH) {
            output = output.slice(-MAX_COMMENT_LENGTH);
            lines.push('<details><summary>出力 (truncated)</summary>');
        }
        else {
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
//# sourceMappingURL=runner.js.map