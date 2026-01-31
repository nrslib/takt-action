import * as github from '@actions/github';
import { isTaktMention } from './takt-command.js';

export interface IssueCommentContext {
  owner: string;
  repo: string;
  issueNumber: number;
  commentBody: string;
  commentId: number;
  isTaktMention: boolean;
  issueTitle: string;
  issueBody: string;
}

/**
 * Build an issue comment context from the issue_comment event payload.
 * Returns an IssueCommentContext only when the comment is on an issue (not a PR).
 */
export function buildIssueCommentContext(): IssueCommentContext | undefined {
  const payload = github.context.payload;
  const comment = payload.comment;
  const issue = payload.issue;

  // PR コメントの場合は対象外
  if (!comment || !issue || issue.pull_request) {
    return undefined;
  }

  const { owner, repo } = github.context.repo;
  const commentBody = comment.body as string;

  return {
    owner,
    repo,
    issueNumber: issue.number as number,
    commentBody,
    commentId: comment.id as number,
    isTaktMention: isTaktMention(commentBody),
    issueTitle: issue.title as string,
    issueBody: (issue.body as string | null) ?? '',
  };
}

/**
 * Build a task content string from an Issue context for takt execution.
 */
export function buildIssueTaskContent(ctx: IssueCommentContext, instruction: string): string {
  const lines: string[] = [];

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
