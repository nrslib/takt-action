# TAKT Action Examples

This directory contains example workflow configurations for TAKT Action.

## Available Examples

| File | Description | Use Case |
|------|-------------|----------|
| [`pr-review.yml`](./pr-review.yml) | Automatic PR review | Review PRs when opened or updated |
| [`issue-comment.yml`](./issue-comment.yml) | Interactive @takt mentions | Respond to @takt in PR/Issue comments |
| [`combined.yml`](./combined.yml) | Combined workflow | All features in a single workflow |
| [`owner-only.yml`](./owner-only.yml) | Owner-only execution | Cost control and security |

## Usage

1. Choose an example that fits your needs
2. Copy the file to `.github/workflows/` in your repository
3. Add `ANTHROPIC_API_KEY` to your repository secrets (Settings → Secrets and variables → Actions)
4. Commit and push

## Security Considerations

### Public Repositories

If your repository is public and accepts contributions, consider using [`owner-only.yml`](./owner-only.yml) to restrict `@takt` execution. Otherwise, anyone can trigger API calls using your Anthropic API key, resulting in unexpected costs.

**Author associations:**
- `OWNER` - Repository owner
- `MEMBER` - Organization member (if repo is in an organization)
- `COLLABORATOR` - Explicitly invited collaborator

### Private Repositories

For private repositories with trusted collaborators, [`combined.yml`](./combined.yml) or [`issue-comment.yml`](./issue-comment.yml) are safe to use without restrictions.

## Required Secrets

| Secret | Description | How to Get |
|--------|-------------|------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Get from https://console.anthropic.com/ |
| `GITHUB_TOKEN` | GitHub token for API access | Auto-provided by GitHub Actions |

## Permissions

Workflows require the following permissions:

```yaml
permissions:
  contents: read           # Read repository files
  pull-requests: write     # Post PR comments
  issues: write            # Post Issue comments (for issue_comment events)
```

## Supported Events

| Event | Trigger | Description |
|-------|---------|-------------|
| `pull_request` | `opened`, `synchronize` | Automatic PR review when opened or updated |
| `issue_comment` | `created` (with `@takt`) | Interactive review via @takt mention |

## Example: Issue Comment Interaction

1. Open an Issue or PR comment
2. Mention `@takt run <workflow>` or `@takt run <workflow> <instruction>`
3. TAKT Action executes the workflow and replies with results

**Syntax:**
```
@takt run                          # Run default workflow
@takt run review                   # Run "review" workflow
@takt run default Fix the bug      # Run "default" workflow with instruction
```

## Customization

### Custom Workflow

Specify a TAKT workflow name:

```yaml
- uses: nrslib/takt-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    github_token: ${{ secrets.GITHUB_TOKEN }}
    workflow: custom-workflow  # Your TAKT workflow name
```

### Disable Review Comments

To run TAKT without posting review comments:

```yaml
- uses: nrslib/takt-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    github_token: ${{ secrets.GITHUB_TOKEN }}
    post_review: 'false'
```

## Troubleshooting

### Workflow Not Triggered

- Check that `ANTHROPIC_API_KEY` is set in repository secrets
- Verify workflow file is in `.github/workflows/` directory
- Check workflow syntax with `yamllint` or GitHub's workflow editor

### Permission Errors

- Ensure `permissions` block includes required scopes
- For organization repos, check organization settings allow Actions

### API Rate Limits

- GitHub API has rate limits (5000 requests/hour for authenticated requests)
- Consider restricting execution to OWNER only for cost control

## More Information

- [TAKT Documentation](https://github.com/nrslib/takt)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Anthropic API Documentation](https://docs.anthropic.com/)
