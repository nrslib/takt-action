import * as github from '@actions/github';
import * as exec from '@actions/exec';
import { isTaktMention } from './takt-command.js';
/**
 * Resolve the PR number from inputs or the GitHub event payload.
 */
export function resolvePrNumber(inputPrNumber) {
    if (inputPrNumber) {
        const parsed = parseInt(inputPrNumber, 10);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    const payload = github.context.payload;
    if (payload.pull_request?.number) {
        return payload.pull_request.number;
    }
    if (payload.issue?.pull_request && payload.issue?.number) {
        return payload.issue.number;
    }
    return undefined;
}
/**
 * Fetch the PR diff using the GitHub CLI.
 */
export async function fetchPrDiff(prNumber) {
    let output = '';
    await exec.exec('gh', ['pr', 'diff', String(prNumber)], {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
        },
    });
    return output;
}
/**
 * Fetch the list of changed files in a PR using the GitHub CLI.
 */
export async function fetchChangedFiles(prNumber) {
    let output = '';
    await exec.exec('gh', ['pr', 'diff', String(prNumber), '--name-only'], {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
        },
    });
    return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}
/**
 * Fetch PR metadata (title, body) using the GitHub CLI.
 */
export async function fetchPrMetadata(prNumber) {
    let output = '';
    await exec.exec('gh', ['pr', 'view', String(prNumber), '--json', 'title,body,headRefOid'], {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
        },
    });
    const parsed = JSON.parse(output);
    return { title: parsed.title, body: parsed.body, headSha: parsed.headRefOid };
}
/**
 * Build a full PR context for the review agent.
 */
export async function buildPrContext(prNumber) {
    const { owner, repo } = github.context.repo;
    const [metadata, diff, changedFiles] = await Promise.all([
        fetchPrMetadata(prNumber),
        fetchPrDiff(prNumber),
        fetchChangedFiles(prNumber),
    ]);
    return {
        owner,
        repo,
        prNumber,
        headSha: metadata.headSha,
        title: metadata.title,
        body: metadata.body,
        diff,
        changedFiles,
    };
}
/**
 * Format a PrContext into a structured Markdown string for the review agent.
 */
export function formatPrContext(ctx) {
    const lines = [];
    lines.push(`## PR #${ctx.prNumber}: ${ctx.title}`);
    lines.push('');
    if (ctx.body) {
        lines.push(ctx.body);
        lines.push('');
    }
    lines.push('### 変更ファイル');
    for (const file of ctx.changedFiles) {
        lines.push(`- ${file}`);
    }
    lines.push('');
    lines.push('### Diff');
    lines.push(ctx.diff);
    return lines.join('\n');
}
/**
 * Build a comment context from the issue_comment event payload.
 * Returns a CommentContext only when the comment is on a pull request.
 */
export function buildCommentContext() {
    const payload = github.context.payload;
    const comment = payload.comment;
    const issue = payload.issue;
    if (!comment || !issue?.pull_request) {
        return undefined;
    }
    const { owner, repo } = github.context.repo;
    const commentBody = comment.body;
    return {
        owner,
        repo,
        prNumber: issue.number,
        commentBody,
        commentId: comment.id,
        isTaktMention: isTaktMention(commentBody),
    };
}
//# sourceMappingURL=pr-context.js.map