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
        let insertCount = 0;
        
        data.forEach(row => {
            // 複数の列名パターンに対応
            const question = row.question || row['質問内容'] || row.質問内容;
            const answer = row.answer || row['回答内容'] || row.回答内容;
            const category = row.category || row['該当資料'] || row.該当資料 || '';
            const tags = row.tags || '';
            
            // 必須フィールドのバリデーション
            if (question && question.trim() && answer && answer.trim()) {
                stmt.run(
                    question.trim(), 
                    answer.trim(), 
                    category.trim(), 
                    tags.trim(),
                    function(err) {
                        if (err) {
                            console.error('データ挿入エラー:', err, 'データ:', row);
                        } else {
                            insertCount++;
                        }
                    }
                );
            } else {
                console.warn('スキップされたデータ（必須フィールドが空）:', row);
            }
        });
        
        stmt.finalize((err) => {
            if (err) {
                console.error('ステートメント終了エラー:', err);
                reject(err);
            } else {
                console.log(`${insertCount}件のデータが正常に挿入されました`);
                resolve();
            }
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
        const sql = "SELECT * FROM qa WHERE question LIKE ? OR answer LIKE ? OR category LIKE ? OR tags LIKE ? ORDER BY created_at DESC";
        const searchTerm = `%${query}%`;
        
        db.all(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// QA削除
function deleteQA(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM qa WHERE id = ?", [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deletedCount: this.changes });
            }
        });
    });
}

// 全QA削除
function deleteAllQA() {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM qa", function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deletedCount: this.changes });
            }
        });
    });
}

module.exports = { parseCSV, saveToDatabase, getAllQA, searchQA, deleteQA, deleteAllQA };
