# API設定ガイド

## 楽天APIの設定方法

### 1. 楽天アフィリエイトIDの取得
1. [楽天アフィリエイト](https://affiliate.rakuten.co.jp/)にアクセス
2. アカウントを作成またはログイン
3. アフィリエイトIDを取得

### 2. 楽天APIアプリケーションIDの取得
1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. 開発者登録を行う
3. アプリケーション登録で新しいアプリケーションを作成
4. アプリケーションIDを取得

### 3. 環境変数の設定
```env
RAKUTEN_APPLICATION_ID=あなたのアプリケーションID
RAKUTEN_AFFILIATE_ID=あなたのアフィリエイトID
```

## Amazon Product Advertising APIの設定方法

### 1. Amazonアソシエイトアカウントの作成
1. [Amazonアソシエイト](https://affiliate.amazon.co.jp/)に登録
2. アカウント承認を待つ
3. アソシエイトタグを取得

### 2. AWSアカウントの作成とPA-APIの有効化
1. [AWSマネジメントコンソール](https://aws.amazon.com/)にアクセス
2. アカウントを作成
3. Product Advertising APIを有効化
4. IAMユーザーを作成し、アクセスキーとシークレットキーを取得

### 3. 環境変数の設定
```env
AMAZON_ACCESS_KEY_ID=あなたのAWSアクセスキー
AMAZON_SECRET_ACCESS_KEY=あなたのAWSシークレットキー
AMAZON_ASSOCIATE_TAG=あなたのアソシエイトタグ
```

## テスト用の設定

開発環境では、以下のダミー値を使用して動作確認できます：

```env
# 楽天API（テスト用）
RAKUTEN_APPLICATION_ID=test_app_id_12345
RAKUTEN_AFFILIATE_ID=test_affiliate_12345

# Amazon PA-API（テスト用）
AMAZON_ACCESS_KEY_ID=AKIATESTKEY12345
AMAZON_SECRET_ACCESS_KEY=testsecretkey12345678901234567890
AMAZON_ASSOCIATE_TAG=test-associate-22
```

## 注意事項

- 本番環境では必ず有効なAPIキーを使用してください
- APIキーはGitHubなどの公開リポジトリにコミットしないでください
- Vercelなどのホスティングサービスでは環境変数として設定してください
- APIの利用制限と利用規約を確認してください