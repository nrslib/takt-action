export interface ReviewComment {
    path: string;
    line: number;
    body: string;
}
/**
 * Parse structured review output from a takt review agent.
 * Expected format:
 *   <!-- takt-review -->
 *   src/file.ts:42: Review comment here.
 *   <!-- /takt-review -->
 */
export declare function parseReviewOutput(output: string): ReviewComment[];
/**
 * Post review comments as PR inline comments using Octokit.
 */
export declare function postReviewComments(token: string, owner: string, repo: string, prNumber: number, commitSha: string, comments: ReviewComment[]): Promise<void>;
//# sourceMappingURL=review.d.ts.map