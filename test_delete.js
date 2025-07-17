const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDeleteFunctions() {
    console.log('削除機能のテストを開始します...\n');
    
    try {
        // 1. 全QA取得テスト
        console.log('1. 全QA取得テスト');
        const getAllResponse = await fetch('http://localhost:3000/api/qa');
        const allQA = await getAllResponse.json();
        console.log(`現在のQA件数: ${allQA.length}件`);
        
        if (allQA.length === 0) {
            console.log('データがないため、削除テストをスキップします');
            return;
        }
        
        // 最初のQAのIDを取得
        const firstQAId = allQA[0].id;
        console.log(`最初のQA ID: ${firstQAId}`);
        console.log(`質問: ${allQA[0].question.substring(0, 50)}...`);
        
        // 2. ファイル名での検索テスト
        console.log('\n2. ファイル名での検索テスト');
        const searchResponse = await fetch('http://localhost:3000/api/qa/search?q=example');
        const searchResults = await searchResponse.json();
        console.log(`"example"での検索結果: ${searchResults.length}件`);
        
        // 3. 個別削除テスト
        console.log('\n3. 個別削除テスト');
        const deleteResponse = await fetch(`http://localhost:3000/api/qa/${firstQAId}`, {
            method: 'DELETE'
        });
        const deleteResult = await deleteResponse.json();
        console.log('削除結果:', deleteResult);
        
        // 4. 削除後の件数確認
        console.log('\n4. 削除後の件数確認');
        const afterDeleteResponse = await fetch('http://localhost:3000/api/qa');
        const afterDeleteQA = await afterDeleteResponse.json();
        console.log(`削除後のQA件数: ${afterDeleteQA.length}件`);
        
        // 5. 全削除テスト（確認のみ、実行しない）
        console.log('\n5. 全削除API確認（実行はしません）');
        console.log('全削除API: DELETE /api/qa');
        console.log('このAPIを使用すると全てのQAが削除されます');
        
    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error.message);
    }
}

testDeleteFunctions();
