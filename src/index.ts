import * as core from '@actions/core';
import {
  detectEventType,
  resolvePrNumber,
  buildPrContext,
  formatPrContext,
  buildCommentContext,
  buildIssueCommentContext,
  parseSubcommand,
} from './context.js';
import { runTakt, formatRunResult } from './runner.js';
import { postIssueComment } from './comment.js';
import { ensureTaktInstalled, ensureGitHubCliAuthenticated } from './setup.js';

async function run(): Promise<void> {
  const eventType = detectEventType();

  const anthropicApiKey = core.getInput('anthropic_api_key');
  const openaiApiKey = core.getInput('openai_api_key');
  const githubToken = core.getInput('github_token', { required: true });
  const workflow = core.getInput('workflow');
  const model = core.getInput('model');
  const provider = core.getInput('provider') || 'claude';
  const inputPrNumber = core.getInput('pr_number');
  const postReview = core.getInput('post_review') === 'true';

  // Validate API keys based on provider
  if (provider === 'claude' && !anthropicApiKey) {
    core.setFailed('anthropic_api_key is required when using Claude provider');
    return;
  }
  if (provider === 'codex' && !openaiApiKey) {
    core.setFailed('openai_api_key is required when using Codex provider');
    return;
  }

  if (anthropicApiKey) core.setSecret(anthropicApiKey);
  if (openaiApiKey) core.setSecret(openaiApiKey);
  core.setSecret(githubToken);

  await ensureGitHubCliAuthenticated(githubToken);

  core.info(`Event type: ${eventType}`);
  core.info(`Workflow: ${workflow}`);
  core.info(`Model: ${model || '(default)'}`);
  core.info(`Provider: ${provider || '(default)'}`);
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

        const commandWorkflow = command.workflow ?? command.options.workflow;
        const selectedWorkflow = commandWorkflow ?? workflow;
        const selectedModel = command.options.model ?? model;
        const selectedProvider = command.options.provider ?? provider;
        const shouldCreateWorktree = command.options['create-worktree'] === 'true';

        core.info(`Running takt workflow "${selectedWorkflow}" for Issue #${issueCommentContext.issueNumber}`);

        await ensureTaktInstalled();

        const result = await runTakt({
          issueNumber: issueCommentContext.issueNumber,
          repo: `${issueCommentContext.owner}/${issueCommentContext.repo}`,
          autoPr: true,
          workflow: selectedWorkflow,
          model: selectedModel || undefined,
          provider: selectedProvider !== 'claude' ? selectedProvider : undefined,
          anthropicApiKey: anthropicApiKey || undefined,
          openaiApiKey: openaiApiKey || undefined,
          createWorktree: shouldCreateWorktree,
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
