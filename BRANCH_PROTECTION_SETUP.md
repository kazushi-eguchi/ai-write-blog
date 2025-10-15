# GitHub ブランチ保護ルール設定ガイド

## ブランチ保護ルールの変更手順

GitHub Actionsからmainブランチへの直接プッシュを許可するには、以下の手順でブランチ保護ルールを設定してください：

### 1. リポジトリ設定にアクセス
1. GitHubリポジトリのページを開く
2. 「Settings」タブをクリック
3. 左メニューから「Branches」を選択

### 2. ブランチ保護ルールの編集
1. 「Branch protection rules」セクションでmainブランチのルールをクリック
2. 以下の設定を変更：

#### ✅ 有効にする設定
- **Require a pull request before merging**: チェックを外す
- **または**「Allow specified actors to bypass required pull requests」を有効にして「GitHub Actions」を追加

#### ✅ 推奨設定
- **Require status checks to pass before merging**: 有効
- **Require branches to be up to date before merging**: 有効
- **Include administrators**: チェックを外す（管理者もルールに従う）

### 3. ワークフローパーミッションの確認
リポジトリ設定の「Actions」→「General」で以下を確認：
- **Workflow permissions**: 「Read and write permissions」を選択
- **Allow GitHub Actions to create and approve pull requests**: 有効

### 4. 代替案：個人アクセストークンの使用
ブランチ保護ルールを変更できない場合は、個人アクセストークンを使用：

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 新しいトークンを作成：
   - **Note**: `GitHub Actions Auto-Push`
   - **Expiration**: 推奨：1年
   - **Scopes**: `repo`（フルリポジトリアクセス）
3. リポジトリのシークレットに追加：
   - **Name**: `PERSONAL_ACCESS_TOKEN`
   - **Value**: 生成したトークン

### 5. ワークフローの更新（トークン使用時）
```yaml
- name: Push changes
  run: |
    git push https://${{ secrets.PERSONAL_ACCESS_TOKEN }}@github.com/kazushi-eguchi/ai-write-blog.git main
```

## 推奨設定

### 安全性を保ちつつ自動化を許可する設定
```
✅ Require a pull request before merging
✅ Allow specified actors to bypass required pull requests
  → Add: GitHub Actions
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
❌ Include administrators
```

この設定により：
- 通常の開発者はプルリクエストが必要
- GitHub Actionsは直接プッシュ可能
- ステータスチェックで品質を確保
- 管理者もルールに従う

## トラブルシューティング

### エラー：`protected branch hook declined`
- ブランチ保護ルールでGitHub Actionsが許可されていない
- ワークフローパーミッションが「Read and write」になっていない

### エラー：`non-fast-forward`
- リベースが正しく実行されていない
- 競合が解決されていない

## 最終確認
設定後、GitHub Actionsを手動実行して動作確認：
1. Actionsタブ → 「Generate Daily Article」ワークフロー
2. 「Run workflow」ボタンをクリック
3. 正常に完了することを確認