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
 * Build a comment context from the issue_comment event payload.
 * Returns a CommentContext only when the comment is on a pull request.
 */
export declare function buildCommentContext(): CommentContext | undefined;
