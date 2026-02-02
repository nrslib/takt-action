# TAKT Action

[TAKT](https://github.com/nrslib/takt) を使った AI による PR レビュー・タスク自動化 GitHub Action。

## セットアップ

### 必須のリポジトリ設定

このアクションで PR を作成するには、以下のリポジトリ設定を有効化してください：

1. **Settings** → **Actions** → **General** に移動
2. **Workflow permissions** で以下にチェック：
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. **Save** をクリック

**直接リンク**: `https://github.com/OWNER/REPO/settings/actions`

> **注意**: この設定がない場合、アクションはワークフローを実行できますが PR を作成できません。PR 作成時に権限エラーが表示されます。

## クイックスタート

### PR オープン時の自動レビュー

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

### @takt メンションによる対話的レビュー

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

### 統合ワークフロー

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

## 入力パラメータ

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `anthropic_api_key` | 条件付き | - | Anthropic API キー（provider が claude の場合必須） |
| `openai_api_key` | 条件付き | - | OpenAI API キー（provider が codex の場合必須） |
| `github_token` | はい | `${{ github.token }}` | GitHub API トークン |
| `workflow` | いいえ | `review` | 実行する TAKT ワークフロー |
| `model` | いいえ | (デフォルト) | 使用するモデル（opus, sonnet, haiku 等） |
| `provider` | いいえ | `claude` | 使用するプロバイダー（claude または codex） |
| `pr_number` | いいえ | (自動検出) | PR 番号 |
| `post_review` | いいえ | `true` | レビュー結果を PR インラインコメントとして投稿 |
| `log_level` | いいえ | `quiet` | ログレベル: `quiet`（最小限）、`detail`（詳細）、`none`（出力なし） |
| `takt_version` | いいえ | `latest` | TAKT CLI バージョン（`latest`: npm 安定版、`git`: リポジトリ最新版） |

## 対応イベント

| イベント | トリガー | 説明 |
|---------|---------|------|
| `pull_request` | `opened`, `synchronize` | PR の自動レビュー |
| `issue_comment` | `created`（`@takt` 含む） | 対話的レビュー・コード変更 |

## ロードマップ

| # | 機能 | ステータス |
|---|------|-----------|
| [#1](https://github.com/nrslib/takt-action/issues/1) | PR diff をレビューコンテキストとして自動取得 | 🔨 実装中 |
| [#2](https://github.com/nrslib/takt-action/issues/2) | レビュー結果を PR インラインコメントとして投稿 | 🔨 実装中 |
| [#3](https://github.com/nrslib/takt-action/issues/3) | GitHub App として配布 | 📋 計画中 |
| [#4](https://github.com/nrslib/takt-action/issues/4) | PR コメントでの対話的レビュー | 🔨 実装中 |
| [#5](https://github.com/nrslib/takt-action/issues/5) | PR コメントで追加指示→コード変更自動反映 | 🔨 実装中 |

## コントリビュート

詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) を参照。

## ライセンス

MIT - 詳細は [LICENSE](../LICENSE) を参照。
