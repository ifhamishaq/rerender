import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'src', 'data', 'products.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Configure Multer
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
    res.send('Admin Server (API) is running.<br>Go to <a href="http://localhost:5173/admin">http://localhost:5173/admin</a> to use the panel.');
});

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the path relative to public (so frontend can access it)
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Get Products
app.get('/api/products', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// Save Products
app.post('/api/products', (req, res) => {
    const products = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(products, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true, message: 'Products saved successfully' });
    });
});

// --- Prompts ---
const PROMPTS_FILE = path.join(__dirname, 'src', 'data', 'prompts.json');

// Get Prompts
app.get('/api/prompts', (req, res) => {
    fs.readFile(PROMPTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read prompts' });
        }
        res.json(JSON.parse(data));
    });
});

// Save Prompts
app.post('/api/prompts', (req, res) => {
    const prompts = req.body;
    fs.writeFile(PROMPTS_FILE, JSON.stringify(prompts, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save prompts' });
        }
        res.json({ success: true, message: 'Prompts saved successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Admin Server running on http://localhost:${PORT}`);
});
