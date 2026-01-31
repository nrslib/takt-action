export type EventType = 'pull_request' | 'issue_comment' | 'unknown';
export interface PrContext {
    owner: string;
    repo: string;
    prNumber: number;
    headSha: string;
    title: string;
    body: string;
    diff: string;
    changedFiles: string[];
}
export interface CommentContext {
    owner: string;
    repo: string;
    prNumber: number;
    commentBody: string;
    commentId: number;
    isTaktMention: boolean;
}
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
 * Detect the event type from the GitHub Actions context.
 */
export declare function detectEventType(): EventType;
/**
 * Resolve the PR number from inputs or the GitHub event payload.
 */
export declare function resolvePrNumber(inputPrNumber?: string): number | undefined;
/**
 * Fetch the PR diff using the GitHub CLI.
 */
export declare function fetchPrDiff(prNumber: number): Promise<string>;
/**
 * Fetch the list of changed files in a PR using the GitHub CLI.
 */
export declare function fetchChangedFiles(prNumber: number): Promise<string[]>;
/**
 * Fetch PR metadata (title, body) using the GitHub CLI.
 */
export declare function fetchPrMetadata(prNumber: number): Promise<{
    title: string;
    body: string;
    headSha: string;
}>;
/**
 * Build a full PR context for the review agent.
 */
export declare function buildPrContext(prNumber: number): Promise<PrContext>;
/**
 * Format a PrContext into a structured Markdown string for the review agent.
 */
export declare function formatPrContext(ctx: PrContext): string;
/**
 * Check if a comment body contains a @takt mention.
 */
export declare function isTaktMention(commentBody: string): boolean;
/**
 * Extract the instruction text from a @takt mention comment.
 * Removes the @takt prefix and returns the remaining text trimmed.
 */
export declare function extractInstruction(commentBody: string): string;
/**
 * Build a comment context from the issue_comment event payload.
 * Returns a CommentContext only when the comment is on a pull request.
 */
export declare function buildCommentContext(): CommentContext | undefined;
/**
 * Build an issue comment context from the issue_comment event payload.
 * Returns an IssueCommentContext only when the comment is on an issue (not a PR).
 */
export declare function buildIssueCommentContext(): IssueCommentContext | undefined;
//# sourceMappingURL=context.d.ts.map