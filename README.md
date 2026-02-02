# TAKT Action

🇯🇵 [日本語ドキュメント](./docs/README.ja.md)

AI-powered PR review and task automation GitHub Action using [TAKT](https://github.com/nrslib/takt).

## Setup

### Required Repository Setting

To allow this action to create pull requests, enable the following repository setting:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, check:
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

**Direct link**: `https://github.com/OWNER/REPO/settings/actions`

> **Note**: Without this setting, the action can run workflows but cannot create pull requests. You'll see a permission error when attempting PR creation.

## Quick Start

### PR Review on Pull Request

```yaml
name: TAKT Review
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nrslib/takt-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Interactive Review via @takt Mention

```yaml
name: TAKT Interactive
on:
  issue_comment:
    types: [created]

permissions:
  contents: write        # Required for pushing code changes
  issues: write          # Required for posting comments
  pull-requests: write   # Required for PR comments

jobs:
  interactive:
    if: |
      contains(github.event.comment.body, '@takt') &&
      github.event.comment.author_association == 'OWNER'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nrslib/takt-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          model: ${{ vars.TAKT_MODEL }}
          log_level: ${{ vars.TAKT_LOG_LEVEL || 'quiet' }}
```

### Combined Workflow

```yaml
name: TAKT
on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

permissions:
  contents: write        # Required for pushing code changes
  issues: write          # Required for posting comments
  pull-requests: write   # Required for PR comments

jobs:
  takt:
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' &&
       contains(github.event.comment.body, '@takt') &&
       github.event.comment.author_association == 'OWNER')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nrslib/takt-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          model: ${{ vars.TAKT_MODEL }}
          log_level: ${{ vars.TAKT_LOG_LEVEL || 'quiet' }}

      # Optional: Slack notification
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '⚠️' }} TAKT ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*${{ job.status == 'success' && '✅' || '⚠️' }} TAKT ${{ job.status }}*\n${{ github.event.pull_request && format('<{0}|PR #{1}>', github.event.pull_request.html_url, github.event.pull_request.number) || format('<{0}|Issue #{1}>', github.event.issue.html_url, github.event.issue.number) }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
                  }
                }
              ]
            }
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `anthropic_api_key` | Conditional | - | Anthropic API key (required when provider is claude) |
| `openai_api_key` | Conditional | - | OpenAI API key (required when provider is codex) |
| `github_token` | Yes | `${{ github.token }}` | GitHub token for API access |
| `workflow` | No | `default` | TAKT workflow to execute |
| `model` | No | (default) | Model to use (opus, sonnet, haiku, etc.) |
| `provider` | No | `claude` | Provider to use (claude or codex) |
| `pr_number` | No | (auto-detect) | Pull request number |
| `post_review` | No | `true` | Post review results as PR inline comments |
| `log_level` | No | `quiet` | Log level: `quiet` (minimal), `detail` (verbose), `none` (no output) |
| `takt_version` | No | `latest` | TAKT CLI version (`latest` for npm stable, `git` for repository HEAD) |

## Supported Events

| Event | Trigger | Description |
|-------|---------|-------------|
| `pull_request` | `opened`, `synchronize` | Automatic PR review |
| `issue_comment` | `created` (with `@takt`) | Interactive review and code changes |

## Roadmap

| # | Feature | Status |
|---|---------|--------|
| [#1](https://github.com/nrslib/takt-action/issues/1) | PR diff as review context | 🔨 In progress |
| [#2](https://github.com/nrslib/takt-action/issues/2) | Review results as PR inline comments | 🔨 In progress |
| [#3](https://github.com/nrslib/takt-action/issues/3) | GitHub App distribution | 📋 Planned |
| [#4](https://github.com/nrslib/takt-action/issues/4) | Interactive review via @takt mention | 🔨 In progress |
| [#5](https://github.com/nrslib/takt-action/issues/5) | Code changes from PR comments | 🔨 In progress |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT - See [LICENSE](./LICENSE) for details.
