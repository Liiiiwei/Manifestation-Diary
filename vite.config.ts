import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        server: {
            proxy: {
                '/api/notion': {
                    target: 'https://api.notion.com/v1',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/notion/, ''),
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            proxyReq.setHeader('Authorization', `Bearer ${env.VITE_NOTION_API_KEY}`);
                            proxyReq.setHeader('Notion-Version', '2022-06-28');
                            proxyReq.setHeader('Content-Type', 'application/json');
                        });
                    },
                },
            },
        },
    };
});
