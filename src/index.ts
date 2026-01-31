import * as core from '@actions/core';
import {
  detectEventType,
  resolvePrNumber,
  buildPrContext,
  formatPrContext,
  buildCommentContext,
  buildIssueCommentContext,
  buildIssueTaskContent,
  parseSubcommand,
} from './context.js';
import { runTakt, formatRunResult } from './runner.js';
import { postIssueComment } from './comment.js';

async function run(): Promise<void> {
  const eventType = detectEventType();

  const anthropicApiKey = core.getInput('anthropic_api_key', { required: true });
  const githubToken = core.getInput('github_token', { required: true });
  const workflow = core.getInput('workflow');
  const inputPrNumber = core.getInput('pr_number');
  const postReview = core.getInput('post_review') === 'true';

  core.setSecret(anthropicApiKey);
  core.setSecret(githubToken);

  core.info(`Event type: ${eventType}`);
  core.info(`Workflow: ${workflow}`);
  core.info(`Post review: ${postReview}`);

  switch (eventType) {
    case 'pull_request': {
      const prNumber = resolvePrNumber(inputPrNumber);
      if (!prNumber) {
        core.setFailed('Could not determine PR number from event or inputs.');
        return;
      }

      core.info(`Processing PR #${prNumber}`);
      const prContext = await buildPrContext(prNumber);
      const formattedContext = formatPrContext(prContext);

      core.info(`PR: ${prContext.title}`);
      core.info(`Changed files: ${prContext.changedFiles.length}`);
      core.info(`Diff length: ${prContext.diff.length} characters`);

      core.setOutput('pr_context', formattedContext);

      // TODO: Invoke takt WorkflowEngine with PR context and post review comments (#2)
      break;
    }

    case 'issue_comment': {
      // PR コメントの場合
      const commentContext = buildCommentContext();
      if (commentContext) {
        if (!commentContext.isTaktMention) {
          core.info('Comment does not mention @takt. Skipping.');
          return;
        }

        core.info(`Processing @takt mention on PR #${commentContext.prNumber}`);
        core.info(`Comment: ${commentContext.commentBody}`);

        // TODO: Invoke takt WorkflowEngine with comment context (#4, #5)
        core.info('Interactive review workflow execution is not yet implemented.');
        break;
      }

      // Issue コメントの場合
      const issueCommentContext = buildIssueCommentContext();
      if (issueCommentContext) {
        if (!issueCommentContext.isTaktMention) {
          core.info('Comment does not mention @takt. Skipping.');
          return;
        }

        core.info(`Processing @takt mention on Issue #${issueCommentContext.issueNumber}`);
        core.info(`Issue: ${issueCommentContext.issueTitle}`);
        core.info(`Comment: ${issueCommentContext.commentBody}`);

        const command = parseSubcommand(issueCommentContext.commentBody);

        if (command.command !== 'run') {
          core.info(`Unknown subcommand: "${command.command}". Only "run" is supported.`);
          break;
        }

        const selectedWorkflow = command.workflow ?? workflow;
        const taskContent = buildIssueTaskContent(issueCommentContext, command.instruction);

        core.info(`Running takt workflow "${selectedWorkflow}" for Issue #${issueCommentContext.issueNumber}`);

        const result = await runTakt({
          task: taskContent,
          workflow: selectedWorkflow,
          anthropicApiKey,
        });

        core.info(`takt exited with code ${result.exitCode}`);

        const commentBody = formatRunResult(result, selectedWorkflow);
        await postIssueComment(
          githubToken,
          issueCommentContext.owner,
          issueCommentContext.repo,
          issueCommentContext.issueNumber,
          commentBody,
        );

        if (result.exitCode !== 0) {
          core.setFailed(`takt workflow failed with exit code ${result.exitCode}`);
        }
        break;
      }

      core.info('Could not build context from issue_comment event. Skipping.');
      break;
    }

    default:
      core.setFailed(`Unsupported event type: ${eventType}`);
  }
}

run().catch((error: Error) => {
  core.setFailed(error.message);
});
