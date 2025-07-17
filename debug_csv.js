const fs = require('fs');
const csv = require('csv-parser');

function debugCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        console.log(`CSVファイルを解析中: ${filePath}`);
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
                if (results.length <= 3) {
                    console.log(`\n--- レコード ${results.length} ---`);
                    console.log('生データ:', data);
                    console.log('キー一覧:', Object.keys(data));
                    
                    // 各種パターンでの値取得テスト
                    const question = data.question || data['質問内容'] || data.質問内容;
                    const answer = data.answer || data['回答内容'] || data.回答内容;
                    const category = data.category || data['該当資料'] || data.該当資料 || '';
                    
                    console.log('question:', question);
                    console.log('answer:', answer);
                    console.log('category:', category);
                    console.log('バリデーション結果:', !!(question && question.trim() && answer && answer.trim()));
                }
            })
            .on('end', () => {
                console.log(`\n解析完了: ${results.length}件のレコード`);
                resolve(results);
            })
            .on('error', reject);
    });
}

debugCSV('example_csv/example.csv');
