# 顯化日記 Manifestation Diary

一個結合日式極簡美學與顯化法則的線上日記應用，透過每日儀式幫助您連結宇宙能量。

## ✨ 功能特色

- **夜間顯化書寫**：3次重複書寫強化顯化能量
- **快樂小事記錄**：記錄工作以外的三件愉快事
- **感謝封存**：將感恩能量密封保存
- **空間清理**：每日隨機任務清理物理與數位空間
- **連續追蹤**：自動計算連續顯化天數
- **日曆檢視**：週/月視圖查看顯化軌跡
- **Notion 同步**：所有資料自動同步至 Notion 資料庫

## 🚀 部署到 Zeabur

### 環境變數設定

在 Zeabur 的 Variables 頁面中設定：

```
VITE_NOTION_API_KEY=your_notion_integration_key
VITE_NOTION_DATABASE_ID=your_database_id
```

### 部署步驟

1. 連結 GitHub 儲存庫到 Zeabur
2. 設定環境變數
3. Zeabur 會自動執行：
   - Build: `npm run build`
   - Start: `npm start`

## 🛠️ 本地開發

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 填入你的 Notion API Key 和 Database ID

# 啟動開發伺服器
npm run dev
```

## 📦 技術架構

- **前端**: Vite + TypeScript + Vanilla JS
- **動畫**: Anime.js v4
- **後端**: Express.js (Notion API Proxy)
- **資料庫**: Notion Database
- **部署**: Zeabur

## 🎨 設計理念

採用日式極簡美學（Wabi-sabi），透過：
- 柔和的呼吸光暈
- 水波紋般的液態背景
- 絲滑的成功回饋動畫

創造一個寧靜、專注的顯化空間。

## 📝 Notion 資料庫結構

需要建立包含以下屬性的 Notion Database：

- `Affirmation` (Title)
- `Category` (Select): 夜間寫作、快樂小事、空間清理、已接收感謝
- `Happy Things` (Rich Text)
- `Date` (Date)

## 🔒 安全性

- API Key 僅存在於伺服器端環境變數
- 透過後端代理避免前端直接呼叫 Notion API
- 所有敏感資訊已加入 .gitignore
