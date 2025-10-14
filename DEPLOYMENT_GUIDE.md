# Vercelデプロイガイド

このガイドでは、サーバーレスブログシステムをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- DeepSeek APIキー
- 楽天APIキー（オプション）

## デプロイ手順

### 1. GitHubリポジトリの準備

1. このプロジェクトをGitHubリポジトリにプッシュ
2. リポジトリの設定で以下のシークレットを設定：
   - `DEEPSEEK_API_KEY`: DeepSeek APIキー
   - `RAKUTEN_APPLICATION_ID`: 楽天アプリケーションID（オプション）
   - `RAKUTEN_AFFILIATE_ID`: 楽天アフィリエイトID（オプション）

### 2. Vercelでのデプロイ

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. 環境変数を設定：
   - `DEEPSEEK_API_KEY`: DeepSeek APIキー
   - `RAKUTEN_APPLICATION_ID`: 楽天アプリケーションID（オプション）
   - `RAKUTEN_AFFILIATE_ID`: 楽天アフィリエイトID（オプション）
   - `NEXT_PUBLIC_SITE_URL`: デプロイ後のURL（例: https://your-blog.vercel.app）

5. 「Deploy」をクリック

### 3. GitHub Actionsの有効化

デプロイ後、GitHub Actionsが自動的に有効化されます。以下のスケジュールで記事が自動生成されます：

- **毎日午前9時（JST）**: 新しい記事を自動生成
- **手動実行**: GitHub Actionsページから手動で実行可能

## 環境変数設定

### 必須環境変数

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### オプション環境変数

```env
RAKUTEN_APPLICATION_ID=your_rakuten_application_id
RAKUTEN_AFFILIATE_ID=your_rakuten_affiliate_id
NEXT_PUBLIC_SITE_URL=https://your-blog-domain.vercel.app
```

## 自動生成の確認

1. GitHubリポジトリの「Actions」タブを確認
2. 「Generate Daily Article」ワークフローが実行されていることを確認
3. 新しい記事が `content/` ディレクトリに追加されていることを確認

## トラブルシューティング

### 記事が生成されない場合

1. GitHub Actionsのログを確認
2. APIキーが正しく設定されているか確認
3. 環境変数の権限を確認

### Vercelデプロイエラー

1. ビルドログを確認
2. 環境変数が正しく設定されているか確認
3. Node.jsバージョンを確認（18以上推奨）

## カスタマイズ

### 記事生成スケジュールの変更

`.github/workflows/generate-article.yml` のcron設定を変更：

```yaml
schedule:
  # 毎日午前9時（JST）に実行（UTC 00:00）
  - cron: '0 0 * * *'
```

### テーマの変更

`scripts/generate-article.ts` の `generateTheme` 関数を変更して、生成する記事のテーマをカスタマイズできます。

## サポート

問題が発生した場合は、以下の情報を確認してください：

- GitHub Actionsの実行ログ
- Vercelのデプロイログ
- ブラウザのコンソールエラー
- サーバーログ