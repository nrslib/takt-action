# TAKT Action

[TAKT](https://github.com/nrslib/takt) を使った AI による PR レビュー・タスク自動化 GitHub Action。

> **Note**: このプロジェクトは個人のペースで開発されています。詳細は[免責事項](#免責事項)をご覧ください。

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
| `anthropic_api_key` | はい | - | Anthropic API キー |
| `github_token` | はい | `${{ github.token }}` | GitHub API トークン |
| `workflow` | いいえ | `review` | 実行する TAKT ワークフロー |
| `pr_number` | いいえ | (自動検出) | PR 番号 |
| `post_review` | いいえ | `true` | レビュー結果を PR インラインコメントとして投稿 |
| `model` | いいえ | `sonnet` | 使用する Claude モデル |

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

## 免責事項

このプロジェクトは個人のペースで開発されています。

- **応答時間**: Issue にすぐ対応できない場合があります
- **開発スタイル**: バイブコーディング（AI アシスト開発）で開発しています - **自己責任でご利用ください**
- **プルリクエスト**:
  - 小さく集中した PR（バグ修正、タイポ、ドキュメント）は歓迎します
  - 大きな PR、特に AI 生成の一括変更はレビューが困難です

詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) をご覧ください。

## ライセンス

MIT - 詳細は [LICENSE](../LICENSE) を参照。
