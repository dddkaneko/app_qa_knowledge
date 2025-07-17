const express = require('express');
const multer = require('multer');
const { parseCSV, saveToDatabase, searchQA, getAllQA, deleteQA, deleteAllQA } = require('../utils/csvParser');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// CSVアップロード
router.post('/upload', upload.single('csvFile'), async (req, res) => {
    try {
        const data = await parseCSV(req.file.path);
        await saveToDatabase(data);
        res.json({ success: true, count: data.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QA一覧取得
router.get('/qa', async (req, res) => {
    try {
        const data = await getAllQA();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QA検索
router.get('/qa/search', async (req, res) => {
    try {
        const { q } = req.query;
        const data = await searchQA(q);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QA削除（個別）
router.delete('/qa/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteQA(id);
        if (result.deletedCount > 0) {
            res.json({ success: true, message: 'QAが削除されました' });
        } else {
            res.status(404).json({ error: 'QAが見つかりません' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// QA全削除
router.delete('/qa', async (req, res) => {
    try {
        const result = await deleteAllQA();
        res.json({ success: true, deletedCount: result.deletedCount, message: `${result.deletedCount}件のQAが削除されました` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
