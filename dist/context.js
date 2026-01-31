import * as github from '@actions/github';
import * as exec from '@actions/exec';
/**
 * Detect the event type from the GitHub Actions context.
 */
export function detectEventType() {
    const eventName = github.context.eventName;
    if (eventName === 'pull_request' || eventName === 'pull_request_target') {
        return 'pull_request';
    }
    if (eventName === 'issue_comment') {
        return 'issue_comment';
    }
    return 'unknown';
}
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
    await exec.exec('gh', ['pr', 'view', String(prNumber), '--json', 'title,body'], {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
        },
    });
    const parsed = JSON.parse(output);
    return { title: parsed.title, body: parsed.body };
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
const TAKT_MENTION_PATTERN = /@takt\b/i;
/**
 * Check if a comment body contains a @takt mention.
 */
export function isTaktMention(commentBody) {
    return TAKT_MENTION_PATTERN.test(commentBody);
}
/**
 * Extract the instruction text from a @takt mention comment.
 * Removes the @takt prefix and returns the remaining text trimmed.
 */
export function extractInstruction(commentBody) {
    return commentBody.replace(TAKT_MENTION_PATTERN, '').trim();
}
/**
 * Build a comment context from the issue_comment event payload.
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
//# sourceMappingURL=context.js.map