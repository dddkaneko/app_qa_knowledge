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
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    
    if (qaList.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-inbox display-4"></i>
                <p class="mt-2">データがありません</p>
            </div>
        `;
        deleteAllBtn.style.display = 'none';
        return;
    }
    
    // データがある場合は全削除ボタンを表示
    deleteAllBtn.style.display = 'block';
    
    const html = qaList.map(qa => `
        <div class="qa-item p-3" id="qa-${qa.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
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
                <div class="ms-3">
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteQA(${qa.id})" title="削除">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
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

// 個別QA削除
async function deleteQA(id) {
    if (!confirm('このQAを削除しますか？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/qa/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // DOM要素を削除
            const qaElement = document.getElementById(`qa-${id}`);
            if (qaElement) {
                qaElement.remove();
            }
            
            // 残りのQAがない場合は表示を更新
            const container = document.getElementById('qaContainer');
            if (container.children.length === 0) {
                loadAllQA(); // 再読み込みして「データがありません」表示
            }
            
            alert('QAが削除されました');
        } else {
            alert('削除に失敗しました: ' + (result.error || '不明なエラー'));
        }
    } catch (error) {
        alert('削除中にエラーが発生しました: ' + error.message);
    }
}

// 全QA削除
async function deleteAllQA() {
    if (!confirm('すべてのQAを削除しますか？この操作は取り消せません。')) {
        return;
    }
    
    try {
        const response = await fetch('/api/qa', {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`${result.deletedCount}件のQAが削除されました`);
            loadAllQA(); // 表示を更新
        } else {
            alert('削除に失敗しました: ' + (result.error || '不明なエラー'));
        }
    } catch (error) {
        alert('削除中にエラーが発生しました: ' + error.message);
    }
}

// ページ読み込み時に全QA表示
window.onload = function() {
    loadAllQA();
};
