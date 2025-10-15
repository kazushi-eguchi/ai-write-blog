# GitHubリポジトリ作成ガイド

このガイドでは、サーバーレスブログシステムをGitHubリポジトリにプッシュする手順を説明します。

## 手順

### 1. GitHubでリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」アイコンをクリック
3. 「New repository」を選択
4. 以下の情報を入力：
   - **Repository name**: `sv-less-blog`（または任意の名前）
   - **Description**: `AI自動生成サーバーレスブログシステム`
   - **Public**（公開）または **Private**（非公開）を選択
   - **Add a README file**: チェックを外す（既にREADMEがあるため）
   - **Add .gitignore**: 選択しない（既に設定済み）
   - **Choose a license**: 選択しない

5. 「Create repository」をクリック

### 2. リモートリポジトリを追加

GitHubでリポジトリを作成した後、以下のコマンドを実行：

```bash
git remote add origin https://github.com/あなたのユーザー名/sv-less-blog.git
```

### 3. プッシュ

```bash
git branch -M main
git push -u origin main
```

### 4. ブランチ名の変更（オプション）

現在のブランチ名が `master` の場合は、`main` に変更することを推奨：

```bash
git branch -M main
```

その後、再度プッシュ：

```bash
git push -u origin main
```

## コマンドまとめ

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/あなたのユーザー名/sv-less-blog.git

# ブランチ名をmainに変更（オプション）
git branch -M main

# プッシュ
git push -u origin main
```

## 注意事項

- リポジトリ名は一意である必要があります
- プッシュ前にGitHubでリポジトリを作成する必要があります
- 初回プッシュ時は `-u` オプションを使用してアップストリームブランチを設定します

## 次のステップ

GitHubリポジトリにプッシュした後：

1. **環境変数の設定**:
   - リポジトリの「Settings」→「Secrets and variables」→「Actions」
   - 以下のシークレットを追加：
     - `DEEPSEEK_API_KEY`
     - `RAKUTEN_APPLICATION_ID`（オプション）
     - `RAKUTEN_AFFILIATE_ID`（オプション）

2. **Vercelデプロイ**:
   - [Vercel](https://vercel.com)でプロジェクトを作成
   - GitHubリポジトリをインポート
   - 環境変数を設定

3. **自動生成の確認**:
   - GitHub Actionsが自動的に実行されることを確認
   - 毎日新しい記事が生成されることを確認