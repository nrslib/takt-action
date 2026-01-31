import * as github from '@actions/github';
/**
 * Post a comment on a GitHub Issue.
 */
export async function postIssueComment(token, owner, repo, issueNumber, body) {
    const octokit = github.getOctokit(token);
    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body,
    });
}
//# sourceMappingURL=comment.js.map