import * as github from '@actions/github';
import { isTaktMention } from './takt-command.js';
/**
 * Build an issue comment context from the issue_comment event payload.
 * Returns an IssueCommentContext only when the comment is on an issue (not a PR).
 */
export function buildIssueCommentContext() {
    const payload = github.context.payload;
    const comment = payload.comment;
    const issue = payload.issue;
    // PR コメントの場合は対象外
    if (!comment || !issue || issue.pull_request) {
        return undefined;
    }
    const { owner, repo } = github.context.repo;
    const commentBody = comment.body;
    return {
        owner,
        repo,
        issueNumber: issue.number,
        commentBody,
        commentId: comment.id,
        isTaktMention: isTaktMention(commentBody),
        issueTitle: issue.title,
        issueBody: issue.body ?? '',
    };
}
/**
 * Build a task content string from an Issue context for takt execution.
 */
export function buildIssueTaskContent(ctx, instruction) {
    const lines = [];
    lines.push(`## Issue #${ctx.issueNumber}: ${ctx.issueTitle}`);
    lines.push('');
    if (ctx.issueBody) {
        lines.push(ctx.issueBody);
        lines.push('');
    }
    if (instruction) {
        lines.push(`## 追加指示`);
        lines.push('');
        lines.push(instruction);
        lines.push('');
    }
    return lines.join('\n');
}
//# sourceMappingURL=issue-context.js.map