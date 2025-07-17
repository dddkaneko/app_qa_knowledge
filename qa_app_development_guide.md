# QAシートCSV取込・一覧表示アプリ 開発手順書

## 1. プロジェクト概要

### 機能要件
- CSVファイルからQAデータを取り込み
- QAデータの一覧表示
- QAデータの検索機能

### 技術スタック
- **フロントエンド**: HTML, CSS, JavaScript (Vanilla JS) + Bootstrap 5
- **バックエンド**: Node.js + Express
- **データベース**: SQLite (軽量で簡単)
- **CSVパーサー**: csv-parser
- **UIフレームワーク**: Bootstrap 5 (CDN使用)

## 2. プロジェクト構成

```
qa-app/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── app.js
│   ├── routes/
│   │   └── api.js
│   └── utils/
│       └── csvParser.js
├── data/
│   └── qa.db (SQLite)
├── uploads/ (CSVファイル一時保存)
├── package.json
└── README.md
```

## 3. データモデル

### QAテーブル
```sql
CREATE TABLE qa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### CSVフォーマット例
```csv
question,answer,category,tags
"質問1","回答1","カテゴリA","タグ1,タグ2"
"質問2","回答2","カテゴリB","タグ3"
```

## 4. API設計

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| POST | /api/upload | CSVファイルアップロード |
| GET | /api/qa | QA一覧取得 |
| GET | /api/qa/search | QA検索 |

## 5. 開発手順

### Step 1: 環境構築
```bash
# プロジェクト作成
mkdir qa-app
cd qa-app
npm init -y

# 必要なパッケージインストール
npm install express multer csv-parser sqlite3 cors
npm install --save-dev nodemon
```

### Step 2: サーバー側実装

#### app.js (メインサーバー)
```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ファイルアップロード設定
const upload = multer({ dest: 'uploads/' });

// ルート
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

#### routes/api.js (APIルート)
```javascript
const express = require('express');
const multer = require('multer');
const { parseCSV, saveToDatabase, searchQA, getAllQA } = require('../utils/csvParser');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// CSVアップロード
router.post('/upload', upload.single('csvFile'), async (req, res) => {
    try {
        const data = await parseCSV(req.file.path);
        await saveToDatabase(data);
        res.json({ success: true, count: data.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QA一覧取得
router.get('/qa', async (req, res) => {
    try {
        const data = await getAllQA();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QA検索
router.get('/qa/search', async (req, res) => {
    try {
        const { q } = req.query;
        const data = await searchQA(q);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

#### utils/csvParser.js (CSV処理とDB操作)
```javascript
const fs = require('fs');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/qa.db');

// テーブル作成
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS qa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// CSV解析
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// データベース保存
function saveToDatabase(data) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO qa (question, answer, category, tags) VALUES (?, ?, ?, ?)");
        
        data.forEach(row => {
            stmt.run(row.question, row.answer, row.category || '', row.tags || '');
        });
        
        stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// 全QA取得
function getAllQA() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM qa ORDER BY created_at DESC", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// QA検索
function searchQA(query) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM qa WHERE question LIKE ? OR answer LIKE ? ORDER BY created_at DESC";
        const searchTerm = `%${query}%`;
        
        db.all(sql, [searchTerm, searchTerm], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = { parseCSV, saveToDatabase, getAllQA, searchQA };
```

### Step 3: フロントエンド実装

#### public/index.html
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QAシート管理アプリ</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- ナビゲーションバー -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#">
                <i class="bi bi-question-circle-fill me-2"></i>
                QAシート管理アプリ
            </a>
        </div>
    </nav>

    <div class="container mt-4">
        <!-- CSVアップロード -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="bi bi-upload me-2"></i>
                    CSVファイルアップロード
                </h5>
            </div>
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <input type="file" class="form-control" id="csvFile" accept=".csv">
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary w-100" onclick="uploadCSV()">
                            <i class="bi bi-cloud-upload me-2"></i>
                            アップロード
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 検索 -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="bi bi-search me-2"></i>
                    QA検索
                </h5>
            </div>
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <input type="text" class="form-control" id="searchInput" placeholder="質問や回答を検索...">
                    </div>
                    <div class="col-md-4">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary" onclick="searchQA()">
                                <i class="bi bi-search me-1"></i>
                                検索
                            </button>
                            <button class="btn btn-outline-secondary" onclick="loadAllQA()">
                                <i class="bi bi-list me-1"></i>
                                全て表示
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- QA一覧 -->
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="bi bi-list-ul me-2"></i>
                    QA一覧
                </h5>
            </div>
            <div class="card-body">
                <div id="qaContainer">
                    <div class="text-center text-muted">
                        <i class="bi bi-inbox display-4"></i>
                        <p class="mt-2">データがありません</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

#### public/style.css
```css
/* カスタムスタイル（Bootstrapの補完） */
body {
    background-color: #f8f9fa;
}

.qa-item {
    border: 1px solid #dee2e6;
    margin-bottom: 15px;
    border-radius: 8px;
    background: white;
    transition: box-shadow 0.2s ease;
}

.qa-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.qa-question {
    font-weight: 600;
    color: #495057;
    margin-bottom: 12px;
    font-size: 1.1em;
}

.qa-answer {
    color: #6c757d;
    line-height: 1.6;
    margin-bottom: 12px;
}

.qa-meta {
    font-size: 0.875em;
    color: #6c757d;
    border-top: 1px solid #e9ecef;
    padding-top: 8px;
}

.qa-meta .badge {
    margin-right: 8px;
}

/* アニメーション */
.card {
    transition: transform 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
}

/* ローディング表示 */
.loading {
    text-align: center;
    padding: 40px;
    color: #6c757d;
}

.loading .spinner-border {
    margin-bottom: 16px;
}
```

#### public/script.js
```javascript
// CSVアップロード
async function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('ファイルを選択してください');
        return;
    }
    
    const formData = new FormData();
    formData.append('csvFile', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`${result.count}件のQAデータをアップロードしました`);
            loadAllQA();
        } else {
            alert('アップロードに失敗しました');
        }
    } catch (error) {
        alert('エラーが発生しました: ' + error.message);
    }
}

// 全QA取得
async function loadAllQA() {
    try {
        const response = await fetch('/api/qa');
        const data = await response.json();
        displayQA(data);
    } catch (error) {
        alert('データの取得に失敗しました: ' + error.message);
    }
}

// QA検索
async function searchQA() {
    const query = document.getElementById('searchInput').value;
    
    if (!query.trim()) {
        loadAllQA();
        return;
    }
    
    try {
        const response = await fetch(`/api/qa/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayQA(data);
    } catch (error) {
        alert('検索に失敗しました: ' + error.message);
    }
}

// QA表示
function displayQA(qaList) {
    const container = document.getElementById('qaContainer');
    
    if (qaList.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-inbox display-4"></i>
                <p class="mt-2">データがありません</p>
            </div>
        `;
        return;
    }
    
    const html = qaList.map(qa => `
        <div class="qa-item p-3">
            <div class="qa-question">
                <i class="bi bi-question-circle text-primary me-2"></i>
                ${qa.question}
            </div>
            <div class="qa-answer">
                <i class="bi bi-chat-left-text text-success me-2"></i>
                ${qa.answer}
            </div>
            <div class="qa-meta">
                <span class="badge bg-secondary me-2">
                    <i class="bi bi-folder me-1"></i>
                    ${qa.category || 'カテゴリなし'}
                </span>
                <span class="badge bg-info me-2">
                    <i class="bi bi-tags me-1"></i>
                    ${qa.tags || 'タグなし'}
                </span>
                <small class="text-muted">
                    <i class="bi bi-calendar3 me-1"></i>
                    ${new Date(qa.created_at).toLocaleDateString('ja-JP')}
                </small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 検索入力でEnterキー対応
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchQA();
    }
});

// ページ読み込み時に全QA表示
window.onload = function() {
    loadAllQA();
};
```

### Step 4: 起動とテスト

#### package.json設定
```json
{
  "scripts": {
    "start": "node server/app.js",
    "dev": "nodemon server/app.js"
  }
}
```

#### 起動手順
```bash
# データディレクトリ作成
mkdir data uploads

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

## 6. テスト用CSVサンプル

```csv
question,answer,category,tags
"JavaScriptとは何ですか？","JavaScriptはWebページに動的な機能を追加するプログラミング言語です","プログラミング","JavaScript,Web"
"HTMLの基本構造は？","HTML文書は<html><head><body>の基本構造を持ちます","マークアップ","HTML,基礎"
"CSSでスタイルを適用する方法は？","セレクタを使ってHTML要素にスタイルを適用します","スタイリング","CSS,デザイン"
```

## 7. 拡張機能案

- ページネーション機能
- カテゴリ別フィルタリング
- QAの編集・削除機能
- エクスポート機能
- ユーザー認証

この手順書に従って実装すれば、基本的なQAシート管理アプリが完成します。
