const fs = require('fs');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/qa.db');
const csvFile = 'converted_qa.csv';

console.log('CSVファイルを直接データベースに取り込みます...');

// ファイルの存在確認
if (!fs.existsSync(csvFile)) {
    console.error(`エラー: ファイル ${csvFile} が見つかりません`);
    process.exit(1);
}

const results = [];

fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (data) => {
        if (data.question && data.question.trim() && data.answer && data.answer.trim()) {
            results.push(data);
        }
    })
    .on('end', () => {
        console.log(`${results.length}件のデータを処理します`);
        
        if (results.length === 0) {
            console.log('有効なデータがありません');
            db.close();
            return;
        }
        
        db.serialize(() => {
            const stmt = db.prepare("INSERT INTO qa (question, answer, category, tags) VALUES (?, ?, ?, ?)");
            let insertCount = 0;
            
            results.forEach((row, index) => {
                stmt.run(
                    row.question.trim(),
                    row.answer.trim(),
                    (row.category || '').trim(),
                    (row.tags || '').trim(),
                    function(err) {
                        if (err) {
                            console.error(`データ${index + 1}の挿入エラー:`, err);
                        } else {
                            insertCount++;
                            console.log(`データ${index + 1}を挿入しました (ID: ${this.lastID})`);
                        }
                    }
                );
            });
            
            stmt.finalize((err) => {
                if (err) {
                    console.error('ステートメント終了エラー:', err);
                } else {
                    console.log(`\n完了: ${insertCount}件のデータが正常に挿入されました`);
                }
                db.close();
            });
        });
    })
    .on('error', (error) => {
        console.error('CSVファイルの読み込みエラー:', error);
        db.close();
    });
