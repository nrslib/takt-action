# TAKT Action

🇯🇵 [日本語ドキュメント](./docs/README.ja.md)

AI-powered PR review and task automation GitHub Action using [TAKT](https://github.com/nrslib/takt).

> **Note**: This project is developed at my own pace. See [Disclaimer](#disclaimer) for details.

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
  contents: read
  pull-requests: write

jobs:
  interactive:
    if: contains(github.event.comment.body, '@takt')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nrslib/takt-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
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
  contents: read
  pull-requests: write

jobs:
  takt:
    if: >
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@takt'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nrslib/takt-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `anthropic_api_key` | Yes | - | Anthropic API key for Claude |
| `github_token` | Yes | `${{ github.token }}` | GitHub token for API access |
| `workflow` | No | `review` | TAKT workflow to execute |
| `pr_number` | No | (auto-detect) | Pull request number |
| `post_review` | No | `true` | Post review results as PR inline comments |
| `model` | No | `sonnet` | Claude model to use |

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

## Disclaimer

This project is a personal project developed at my own pace.

- **Response times**: I may not be able to respond to issues immediately
- **Development style**: This project is primarily developed using "vibe coding" (AI-assisted development) - **use at your own risk**
- **Pull requests**:
  - Small, focused PRs (bug fixes, typos, docs) are welcome
  - Large PRs, especially AI-generated bulk changes, are difficult to review

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License

MIT - See [LICENSE](./LICENSE) for details.
