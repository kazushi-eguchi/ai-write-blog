# GitHub Actions 設定ガイド

## 現在のエラー
```
remote: Permission to kazushi-eguchi/ai-write-blog.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/kazushi-eguchi/ai-write-blog/': The requested URL returned error: 403
```

## 解決方法

### 1. 個人アクセストークンの作成

1. **GitHubにログイン**
2. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** → **Generate new token (classic)**
4. **トークン名**: `AI-Blog-Actions`
5. **有効期限**: 無期限（推奨）または適切な期間
6. **スコープ**: `repo`（すべてのリポジトリ権限）と `workflow` を選択
7. **Generate token** をクリック
8. **トークンをコピー**（一度しか表示されません）

### 2. GitHubリポジトリでシークレットを設定

1. **GitHubリポジトリにアクセス**:
   - `https://github.com/kazushi-eguchi/ai-write-blog`

2. **Settingsタブをクリック**

3. **左メニューから「Secrets and variables」→「Actions」を選択**

4. **「New repository secret」をクリック**

### 3. 必須シークレットの追加

以下のシークレットを追加してください：

#### 必須シークレット
| シークレット名 | 値 | 説明 |
|---------------|-----|------|
| `PERSONAL_ACCESS_TOKEN` | `ghp_...`（作成したトークン） | GitHub個人アクセストークン |
| `DEEPSEEK_API_KEY` | `sk-4adcd55848d84d1ab4733a8bd97eade1` | DeepSeek APIキー |

#### オプションシークレット
| シークレット名 | 値 | 説明 |
|---------------|-----|------|
| `RAKUTEN_APPLICATION_ID` | `1096528941688097201` | 楽天アプリケーションID |
| `RAKUTEN_AFFILIATE_ID` | `1f454fb8.34705d0b.1f454fb9.255992fd` | 楽天アフィリエイトID |

### 3. シークレット設定手順

1. **「New repository secret」をクリック**
2. **Name**: `DEEPSEEK_API_KEY`
3. **Secret**: `sk-4adcd55848d84d1ab4733a8bd97eade1`
4. **「Add secret」をクリック**

同様にオプションのシークレットも追加可能です。

### 4. 動作確認

1. **GitHub Actionsタブをクリック**
2. **「Generate Daily Article」ワークフローを選択**
3. **「Run workflow」ボタンをクリック**
4. **実行結果を確認**

### 5. スケジュール設定

現在のスケジュール：
- **午前9時（JST）**: UTC 00:00
- **午後9時（JST）**: UTC 12:00

### 6. トラブルシューティング

- **シークレット名が正しいか確認**: `DEEPSEEK_API_KEY`（大文字小文字を正確に）
- **シークレット値が正しいか確認**: APIキーが有効か確認
- **ワークフローが最新か確認**: 最新のコードがプッシュされているか確認

## 環境変数の参照方法

GitHub Actionsワークフロー（`.github/workflows/generate-article.yml`）では以下のように環境変数を参照しています：

```yaml
- name: Generate article
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
    RAKUTEN_APPLICATION_ID: ${{ secrets.RAKUTEN_APPLICATION_ID }}
    RAKUTEN_AFFILIATE_ID: ${{ secrets.RAKUTEN_AFFILIATE_ID }}
  run: |
    npx tsx scripts/generate-article.ts
```

シークレットを設定すると、GitHub Actionsが正常に動作します。