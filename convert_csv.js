const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

// コマンドライン引数から入力ファイルを取得、デフォルトは example.csv
const inputFile = process.argv[2] || 'example_csv/example.csv';
const outputFile = 'converted_qa.csv';

// ファイル名からタグを生成
const fileName = path.basename(inputFile, path.extname(inputFile));
const fileTag = `ファイル:${fileName}`;

console.log(`入力ファイル: ${inputFile}`);
console.log(`ファイルタグ: ${fileTag}`);

// 出力CSVのヘッダー定義
const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
        {id: 'question', title: 'question'},
        {id: 'answer', title: 'answer'},
        {id: 'category', title: 'category'},
        {id: 'tags', title: 'tags'}
    ]
});

const results = [];

console.log('CSVファイルの変換を開始します...');

// ファイルの存在確認
if (!fs.existsSync(inputFile)) {
    console.error(`エラー: ファイル ${inputFile} が見つかりません`);
    process.exit(1);
}

fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (data) => {
        // 空の行や不完全なデータをスキップ
        if (!data['質問内容'] || !data['回答内容'] || data['質問内容'].trim() === '' || data['回答内容'].trim() === '') {
            return;
        }

        // データを変換
        const convertedData = {
            question: data['質問内容'].trim(),
            answer: data['回答内容'].trim(),
            category: data['該当資料'] || 'その他',
            tags: `${fileTag},質問日:${data['質問日'] || ''},ステータス:${data['ステータス'] || ''}`
        };

        results.push(convertedData);
    })
    .on('end', () => {
        // 変換されたデータをCSVファイルに書き込み
        csvWriter.writeRecords(results)
            .then(() => {
                console.log(`変換完了: ${results.length}件のデータを${outputFile}に出力しました`);
                console.log(`ファイルタグ "${fileTag}" が各データに追加されました`);
                console.log('変換されたファイルをアプリケーションで取り込むことができます');
            })
            .catch((error) => {
                console.error('CSVファイルの書き込みエラー:', error);
            });
    })
    .on('error', (error) => {
        console.error('CSVファイルの読み込みエラー:', error);
    });
