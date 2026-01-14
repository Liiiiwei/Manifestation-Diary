/**
 * Notion API 整合服務
 * 
 * 注意：由於 Notion API 不支援瀏覽器直接發送請求 (CORS 限制)，
 * 在正式環境中，這些請求通常需要透過後端或 Serverless Function (如 Vercel Functions) 轉發。
 * 
 * 此處實作了標準的轉發邏輯。
 */

export interface DiaryEntry {
    category: '夜間寫作' | '快樂小事' | '空間清理' | '已接收感謝' | '多巴安戒斷';
    affirmation?: string;
    happyThings?: string[];
    reflections?: string;
    clearingTask?: string;
}

const NOTION_PROXY_URL = '/api/notion/pages';

export const syncToNotion = async (entry: DiaryEntry): Promise<{ success: boolean; error?: string }> => {
    console.log('正在同步至 Notion...', entry);

    try {
        const response = await fetch(NOTION_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: {
                    database_id: import.meta.env.VITE_NOTION_DATABASE_ID
                },
                properties: {
                    'Affirmation': {
                        title: [
                            {
                                text: {
                                    content: entry.affirmation || entry.category
                                }
                            }
                        ]
                    },
                    'Category': {
                        select: {
                            name: entry.category
                        }
                    },
                    'Happy Things': {
                        rich_text: [
                            {
                                text: {
                                    content: entry.happyThings?.filter(t => t.trim()).join('\n') || ''
                                }
                            }
                        ]
                    },
                    'Date': {
                        date: {
                            start: new Date().toISOString().split('T')[0]
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            let errorMsg = `HTTP ${response.status}`;
            const errorText = await response.text();

            try {
                const errorData = JSON.parse(errorText);
                errorMsg = errorData.error || errorData.message || JSON.stringify(errorData);
            } catch (e) {
                // Not JSON, use the raw text if available
                if (errorText) errorMsg = errorText;
            }

            // Check specifically for the integration permission error
            if (response.status === 404) {
                errorMsg = "找不到資料庫。請確認：1. Database ID 正確 2. 已在 Notion 頁面右上角 '...' > 'Connections' 加入您的機器人 integration。";
            }
            console.error('Notion 同步失敗:', errorMsg);
            return { success: false, error: errorMsg };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Notion 同步出錯:', error);
        return { success: false, error: error.message || '網路錯誤' };
    }
};
export const fetchRecordedDates = async (): Promise<string[]> => {
    const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
    const url = `/api/notion/databases/${databaseId}/query`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page_size: 100 // 獲取最近 100 筆
            })
        });

        if (!response.ok) {
            console.error('獲取日期失敗:', await response.text());
            return [];
        }

        const data = await response.json();
        const dates = data.results
            .map((page: any) => page.properties.Date?.date?.start)
            .filter((date: string | undefined) => !!date);

        return Array.from(new Set(dates)) as string[];
    } catch (error) {
        console.error('獲取日期出錯:', error);
        return [];
    }
};
