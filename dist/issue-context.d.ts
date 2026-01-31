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
export declare function buildIssueCommentContext(): IssueCommentContext | undefined;
/**
 * Build a task content string from an Issue context for takt execution.
 */
export declare function buildIssueTaskContent(ctx: IssueCommentContext, instruction: string): string;
