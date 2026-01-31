import * as core from '@actions/core';
import { detectEventType, resolvePrNumber, buildPrContext, formatPrContext, buildCommentContext, buildIssueCommentContext, } from './context.js';
async function run() {
    const eventType = detectEventType();
    const anthropicApiKey = core.getInput('anthropic_api_key', { required: true });
    const githubToken = core.getInput('github_token', { required: true });
    const workflow = core.getInput('workflow');
    const inputPrNumber = core.getInput('pr_number');
    const postReview = core.getInput('post_review') === 'true';
    const model = core.getInput('model');
    core.setSecret(anthropicApiKey);
    core.setSecret(githubToken);
    core.info(`Event type: ${eventType}`);
    core.info(`Workflow: ${workflow}`);
    core.info(`Model: ${model}`);
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
                // TODO: Invoke takt WorkflowEngine with issue comment context and post result as issue comment
                core.info('Issue comment workflow execution is not yet implemented.');
                break;
            }
            core.info('Could not build context from issue_comment event. Skipping.');
            break;
        }
        default:
            core.setFailed(`Unsupported event type: ${eventType}`);
    }
}
run().catch((error) => {
    core.setFailed(error.message);
});
//# sourceMappingURL=index.js.map