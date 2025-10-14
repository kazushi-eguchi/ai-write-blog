# AI自動生成ブログシステム

DeepSeek AIを使用した完全自動化のサーバーレスブログシステムです。毎日自動でAIが記事を生成し、関連するアフィリエイト商品を組み込んで公開します。

## 🚀 特徴

- **AI自動記事生成**: DeepSeek APIを使用して毎日新しい記事を自動生成
- **重複防止**: 既存記事との重複を自動チェック
- **アフィリエイト統合**: 楽天APIで関連商品を自動挿入
- **完全自動化**: GitHub Actionsによる定期実行
- **サーバーレス**: Next.js + Vercelでホスティング
- **タグ・カテゴリ分類**: 自動でタグ付けとカテゴリ分類
- **自動デプロイ**: Vercelへの自動デプロイ

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel
- **自動化**: GitHub Actions
- **AI API**: DeepSeek
- **アフィリエイト**: 楽天API

## 📦 セットアップ

### 1. リポジトリのクローン

```bash
git clone <your-repo-url>
cd sv_less_blog
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成し、必要なAPIキーを設定します：

```bash
cp .env.example .env.local
```

必要な環境変数：

```env
# DeepSeek API設定（必須）
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 楽天API設定（オプション）
RAKUTEN_APPLICATION_ID=your_rakuten_application_id
RAKUTEN_AFFILIATE_ID=your_rakuten_affiliate_id

# サイト設定
NEXT_PUBLIC_SITE_URL=https://your-blog-domain.vercel.app
```

### 3. APIキーの取得

#### DeepSeek API
1. [DeepSeek Platform](https://platform.deepseek.com/)にアクセス
2. アカウントを作成/ログイン
3. APIキーを生成
4. `.env.local`に設定

#### 楽天API（オプション）
1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. アプリケーション登録
3. アプリケーションIDを取得
4. 楽天アフィリエイトに登録してアフィリエイトIDを取得


### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認します。

## 🔧 使用方法

### 手動での記事生成

```bash
npx tsx scripts/generate-article.ts
```

### 自動記事生成の設定

1. GitHubリポジトリのSettings > Secrets and variables > Actions に環境変数を設定
2. 以下のシークレットを追加：
   - `DEEPSEEK_API_KEY`
   - `RAKUTEN_APPLICATION_ID`（オプション）
   - `RAKUTEN_AFFILIATE_ID`（オプション）

3. 毎日自動で記事が生成され、GitHubリポジトリにコミットされます

### Vercelへのデプロイ

詳細なデプロイ手順は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照してください。

1. [Vercel](https://vercel.com/)にログイン
2. 新しいプロジェクトを作成
3. GitHubリポジトリを選択
4. 環境変数を設定
5. デプロイ

デプロイ後、以下の機能が自動的に有効になります：
- **自動デプロイ**: mainブランチへのプッシュで自動デプロイ
- **自動記事生成**: 毎日午前9時（JST）に新しい記事を生成
- **手動実行**: GitHub Actionsから手動で記事生成を実行可能

## 📁 プロジェクト構造

```
sv_less_blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # ホームページ
│   │   ├── posts/[slug]/    # 個別記事ページ
│   │   ├── tags/            # タグ関連ページ
│   │   └── categories/      # カテゴリ関連ページ
│   ├── components/          # Reactコンポーネント
│   └── lib/                 # ユーティリティ関数
│       ├── markdown.ts      # マークダウン処理
│       ├── deepseek.ts      # DeepSeek APIクライアント
│       ├── rakuten.ts       # 楽天APIクライアント
│       └── duplicate-checker.ts # 重複チェック
├── content/                 # マークダウン記事
├── scripts/                 # 自動生成スクリプト
│   └── generate-article.ts  # 記事生成メインスクリプト
├── .github/workflows/       # GitHub Actions
└── vercel.json              # Vercel設定
```

## ⚙️ カスタマイズ

### 記事テーマの変更

`src/lib/deepseek.ts`の`generateThemeIdeas`メソッドを編集して、生成するテーマを変更できます。

### アフィリエイト商品の設定

`src/lib/rakuten.ts`の商品検索ロジックをカスタマイズできます。

### デザインの変更

`src/components/`内のコンポーネントを編集して、デザインを変更できます。

## 📄 ライセンス

MIT License

## 🤝 貢献

プルリクエストやイシューは歓迎します！

## 📞 サポート

問題が発生した場合は、GitHubイシューを作成してください。
