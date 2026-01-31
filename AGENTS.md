# Repository Guidelines

## プロジェクト構成とモジュール整理
- GitHub Action のエントリポイントは `src/index.ts`、バンドル済みは `dist/index.js`。
- GitHub コンテキスト処理は `src/context.ts`、レビュー投稿は `src/review.ts`。
- テストは `src/__tests__/` に配置する。
- `dist/` は ncc でバンドルした成果物。Action 配布用にコミットする。
- Action 定義は `action.yml`。

## ビルド・テスト・開発コマンド
```
npm run build       # TypeScript をコンパイルして dist/ を生成
npm run package     # ncc でバンドル（Action 配布用）
npm run test        # Vitest の全テスト実行
npm run test:watch  # Vitest のウォッチモード
npm run lint        # ESLint で静的解析
npm run all         # lint → build → test → package を順に実行
```
単体実行例: `npx vitest run src/__tests__/context.test.ts`

## コーディング規約と命名
- TypeScript の strict 設定を前提にする。
- ESM 形式のため、import の拡張子は `.js` を使う。
- 既存ファイルは ESLint ルールに従い、読みやすさ優先で簡潔に書く。
- 変更対象の命名や構成は既存パターンに合わせる。

## テスト指針
- テストフレームワークは Vitest。
- 追加・修正は関連テストの追加を推奨する。
- テストファイルは `src/__tests__/` に置き、内容が分かる名前を付ける。

## コミットとプルリク
- 変更内容が分かる簡潔な件名を推奨。
- PR は小さく集中した変更を基本とし、必要ならテストとドキュメントを更新。
- 事前に Issue を立てて相談する方針。

## セキュリティと設定の注意
- `ANTHROPIC_API_KEY` は GitHub Secrets に保存し、平文で扱わない。
- `github_token` のパーミッションは最小限にする。
- 脆弱性は公開 Issue ではなく、メンテナへ非公開で報告する。

## 配布の注意
- `dist/` は `.gitignore` に含めない（Action 配布に必要）。
- リリース前は必ず `npm run package` で `dist/` を再生成すること。
- CI で `dist/` の差分チェックを実施している。
