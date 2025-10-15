# GitHubリポジトリ作成手順

`ai-write-blog` リポジトリが存在しないため、GitHubで手動で作成する必要があります。

## 作成手順

### 1. GitHubにアクセス
- [GitHub](https://github.com) にログイン

### 2. 新しいリポジトリを作成
1. 右上の「+」アイコンをクリック
2. 「New repository」を選択

### 3. リポジトリ情報を入力
- **Owner**: `sandw1ch`
- **Repository name**: `ai-write-blog`
- **Description**: `AI自動生成サーバーレスブログシステム`
- **Public** または **Private** を選択
- **Initialize this repository with:**
  - [ ] Add a README file: **チェックを外す**（既にREADMEがあるため）
  - [ ] Add .gitignore: **選択しない**（既に設定済み）
  - [ ] Choose a license: **選択しない**

### 4. リポジトリを作成
- 「Create repository」をクリック

## プッシュコマンド

リポジトリ作成後、以下のコマンドを実行：

```bash
# リモートリポジトリが既に設定されていることを確認
git remote -v

# プッシュ
git push -u origin main
```

## リモートリポジトリの設定確認

現在の設定：
```bash
origin  https://github.com/sandw1ch/ai-write-blog.git (fetch)
origin  https://github.com/sandw1ch/ai-write-blog.git (push)
```

## 注意事項

- リポジトリ名は正確に `ai-write-blog` であることを確認
- リポジトリが作成されるまでプッシュは失敗します
- 初回プッシュ時は `-u` オプションを使用

## 次のステップ

1. GitHubで `ai-write-blog` リポジトリを作成
2. 上記のプッシュコマンドを実行
3. プッシュが成功したことを確認
4. Vercelでデプロイ設定