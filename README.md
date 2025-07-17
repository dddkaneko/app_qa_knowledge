# QAシートCSV取込・一覧表示アプリ

QAシートをCSV形式で取り込み、一覧表示・検索ができるWebアプリケーションです。

## 機能

- CSVファイルからQAデータを取り込み
- QAデータの一覧表示
- QAデータの検索機能
- Bootstrap 5を使用した美しいUI

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript + Bootstrap 5
- **バックエンド**: Node.js + Express
- **データベース**: SQLite
- **CSVパーサー**: csv-parser

## プロジェクト構成

```
qa-app/
├── public/
│   ├── index.html      # メインHTML
│   ├── style.css       # カスタムCSS
│   └── script.js       # フロントエンドJS
├── server/
│   ├── app.js          # メインサーバー
│   ├── routes/
│   │   └── api.js      # APIルート
│   └── utils/
│       └── csvParser.js # CSV処理・DB操作
├── data/
│   └── qa.db           # SQLiteデータベース（自動作成）
├── uploads/            # CSVファイル一時保存
├── package.json        # プロジェクト設定
├── sample_qa.csv       # テスト用CSVサンプル
└── README.md           # このファイル
```

## セットアップ手順

### 1. 依存関係のインストール

Node.jsがインストールされている環境で以下を実行：

```bash
npm install
```

### 2. アプリケーションの起動

```bash
# 開発モード（nodemonを使用）
npm run dev

# または本番モード
npm start
```

### 3. ブラウザでアクセス

http://localhost:3000 にアクセスしてアプリケーションを使用できます。

## 使用方法

### 1. CSVファイルのアップロード

1. 「CSVファイルアップロード」セクションで「ファイルを選択」をクリック
2. CSVファイルを選択（sample_qa.csvを使用可能）
3. 「アップロード」ボタンをクリック

### 2. QAデータの表示

- アップロード後、自動的にQA一覧が表示されます
- 「全て表示」ボタンで全データを再表示できます

### 3. QAデータの検索

1. 「QA検索」セクションの検索ボックスにキーワードを入力
2. 「検索」ボタンをクリックまたはEnterキーを押す
3. 質問・回答の内容から部分一致で検索されます

## CSVファイル形式

CSVファイルは以下の形式で作成してください：

```csv
question,answer,category,tags
"質問内容","回答内容","カテゴリ","タグ1,タグ2"
```

### 列の説明

- **question**: 質問内容（必須）
- **answer**: 回答内容（必須）
- **category**: カテゴリ（任意）
- **tags**: タグ（カンマ区切りで複数指定可能、任意）

## API仕様

### エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| POST | /api/upload | CSVファイルアップロード |
| GET | /api/qa | QA一覧取得 |
| GET | /api/qa/search?q=キーワード | QA検索 |

### レスポンス例

#### QA一覧取得
```json
[
  {
    "id": 1,
    "question": "JavaScriptとは何ですか？",
    "answer": "JavaScriptはWebページに動的な機能を追加するプログラミング言語です",
    "category": "プログラミング",
    "tags": "JavaScript,Web",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

## 拡張機能案

- ページネーション機能
- カテゴリ別フィルタリング
- QAの編集・削除機能
- エクスポート機能
- ユーザー認証

## トラブルシューティング

### Node.jsがインストールされていない場合

1. [Node.js公式サイト](https://nodejs.org/)からダウンロード・インストール
2. コマンドプロンプトで `node --version` を実行して確認

### ポート3000が使用中の場合

server/app.js の PORT 変数を変更してください：

```javascript
const PORT = 3001; // 別のポート番号に変更
```

### データベースファイルが作成されない場合

dataディレクトリの権限を確認し、書き込み権限があることを確認してください。

## ライセンス

ISC License
