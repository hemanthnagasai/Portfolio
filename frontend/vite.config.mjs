import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Opt-in only (ANALYZE=true npm run build) so bundle-stats.html never ships in the
    // production image served by the backend's static-file catch-all.
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    // Simple custom plugin to keep the /health and /health/simple endpoints active in dev mode
    {
      name: 'health-check-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/health') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              environment: 'development',
              uptime: process.uptime()
            }));
          } else if (req.url === '/health/simple') {
            res.setHeader('Content-Type', 'text/plain');
            res.end('OK');
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 5000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  envPrefix: 'REACT_APP_', // Keeps support for existing REACT_APP_ variables in .env without renaming
});
