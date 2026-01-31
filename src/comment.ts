import * as github from '@actions/github';

/**
 * Post a comment on a GitHub Issue.
 */
export async function postIssueComment(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
): Promise<void> {
  const octokit = github.getOctokit(token);

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}
