import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;


console.log('--- BACKEND_START_SEQUENCE ---');
console.log('Node Version:', process.version);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            hasNotionKey: !!process.env.VITE_NOTION_API_KEY,
            hasDbId: !!process.env.VITE_NOTION_DATABASE_ID
        }
    });
});

// Request Logger
app.use((req, res, next) => {
    console.log(`[Request] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Notion Proxy - handle all /notion/api/* paths
app.use('/notion/api', async (req, res) => {
    // Remove /api/notion prefix to get the actual Notion API path
    let notionPath = req.path.substring(1); // Remove leading /
    const apiKey = process.env.VITE_NOTION_API_KEY || process.env.NOTION_API_KEY;
    const serverDbId = process.env.VITE_NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID;

    // Fix 1: Handle Client sending "undefined" in URL (Query Database)
    if (notionPath.includes('databases/undefined') || notionPath.includes('databases/null')) {
        if (serverDbId) {
            console.log('[Proxy] Fixing undefined database ID in URL with server env var');
            notionPath = notionPath.replace(/databases\/(undefined|null)/, `databases/${serverDbId}`);
        } else {
            console.error('[Proxy Error] Client sent undefined ID and Server has no DATABASE_ID configured');
        }
    }

    // Fix 2: Inject Database ID into Body if missing (Create Page)
    if (req.method === 'POST' && (notionPath === 'pages' || notionPath === 'pages/')) {
        if (req.body && req.body.parent && !req.body.parent.database_id) {
            if (serverDbId) {
                console.log('[Proxy] Injecting database ID from server env var');
                req.body.parent.database_id = serverDbId;
            } else {
                console.error('[Proxy Error] Request missing database_id and Server has none configured');
            }
        }
    }

    const notionUrl = `https://api.notion.com/v1/${notionPath}`;

    console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${notionUrl}`);

    if (!apiKey) {
        console.error('[Error] Notion API Key is missing!');
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const response = await axios({
            method: req.method.toLowerCase(),
            url: notionUrl,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            data: req.body,
        });

        console.log(`[Proxy] Success: ${response.status}`);
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Internal Server Error' };
        console.error(`[Proxy Error] ${status}:`, JSON.stringify(data, null, 2));

        // Enhance error message for common Notion issues
        if (status === 404) {
            console.error('👉 提示: 請檢查 1. Database ID 是否正確 2. 是否已將 Integration 邀請至該 Page/Database');
        }
        if (status === 401) {
            console.error('👉 提示: 請檢查 Notion API Key 是否正確');
        }

        res.status(status).json(data);
    }
});

// Static files - MUST be after API routes
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - MUST be last (Express 4 supports this)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Manifestation Diary Server running on port ${PORT}`);
    console.log(`📝 Notion API Key: ${process.env.VITE_NOTION_API_KEY ? 'Configured' : 'MISSING'}`);
    console.log(`🗄️  Database ID: ${process.env.VITE_NOTION_DATABASE_ID ? 'Configured' : 'MISSING'}`);
});
