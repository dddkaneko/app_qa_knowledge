const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// CSVファイルをアップロードする関数
async function uploadCSV() {
    const csvFilePath = path.join(__dirname, 'converted_qa.csv');
    
    try {
        // ファイルが存在するかチェック
        if (!fs.existsSync(csvFilePath)) {
            console.error('CSVファイルが見つかりません:', csvFilePath);
            return;
        }

        // FormDataを作成
        const form = new FormData();
        form.append('csvFile', fs.createReadStream(csvFilePath));

        console.log('CSVファイルをアップロード中...');
        
        // APIエンドポイントにPOSTリクエストを送信
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: form
        });

        const result = await response.text();
        
        if (response.ok) {
            console.log('アップロード成功:', result);
        } else {
            console.error('アップロードエラー:', response.status, result);
        }
        
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
    }
}

// スクリプトを実行
uploadCSV();
