const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCSVUpload() {
    try {
        console.log('CSVアップロードテストを開始します...');
        
        // FormDataを作成
        const form = new FormData();
        form.append('csvFile', fs.createReadStream('example_csv/example.csv'));
        
        // アップロードリクエストを送信
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: form
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ CSVアップロード成功!');
            console.log(`📊 処理されたレコード数: ${result.count}`);
        } else {
            console.log('❌ CSVアップロード失敗:');
            console.log(result.error);
        }
        
        // アップロード後のデータを確認
        console.log('\n📋 アップロード後のQAデータを確認中...');
        const qaResponse = await fetch('http://localhost:3000/api/qa');
        const qaData = await qaResponse.json();
        
        console.log(`📝 現在のQAデータ件数: ${qaData.length}`);
        console.log('\n最初の3件のデータ:');
        qaData.slice(0, 3).forEach((qa, index) => {
            console.log(`${index + 1}. Q: ${qa.question}`);
            console.log(`   A: ${qa.answer}`);
            console.log(`   カテゴリ: ${qa.category}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ テスト中にエラーが発生しました:', error.message);
    }
}

testCSVUpload();
