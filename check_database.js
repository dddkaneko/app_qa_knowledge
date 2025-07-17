const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/qa.db');

console.log('データベースの内容を確認しています...');

db.serialize(() => {
    // テーブルの存在確認
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='qa'", (err, row) => {
        if (err) {
            console.error('テーブル確認エラー:', err);
            return;
        }
        
        if (row) {
            console.log('qaテーブルが存在します');
            
            // データ件数確認
            db.get("SELECT COUNT(*) as count FROM qa", (err, row) => {
                if (err) {
                    console.error('件数取得エラー:', err);
                    return;
                }
                
                console.log(`データ件数: ${row.count}件`);
                
                if (row.count > 0) {
                    // 最初の5件を表示
                    db.all("SELECT * FROM qa LIMIT 5", (err, rows) => {
                        if (err) {
                            console.error('データ取得エラー:', err);
                            return;
                        }
                        
                        console.log('\n最初の5件のデータ:');
                        rows.forEach((row, index) => {
                            console.log(`\n${index + 1}. ID: ${row.id}`);
                            console.log(`   質問: ${row.question.substring(0, 50)}...`);
                            console.log(`   回答: ${row.answer.substring(0, 50)}...`);
                            console.log(`   カテゴリ: ${row.category}`);
                            console.log(`   タグ: ${row.tags}`);
                            console.log(`   作成日: ${row.created_at}`);
                        });
                        
                        db.close();
                    });
                } else {
                    console.log('データがありません');
                    db.close();
                }
            });
        } else {
            console.log('qaテーブルが存在しません');
            db.close();
        }
    });
});
