const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ファイルアップロード設定
const upload = multer({ dest: 'uploads/' });

// ルート
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
