const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/qa.db');

console.log('データベースをクリアしています...');

db.serialize(() => {
    db.run("DELETE FROM qa", function(err) {
        if (err) {
            console.error('データベースクリアエラー:', err);
        } else {
            console.log(`${this.changes}件のデータを削除しました`);
        }
        
        db.close((err) => {
            if (err) {
                console.error('データベース接続終了エラー:', err);
            } else {
                console.log('データベースクリア完了');
            }
        });
    });
});
