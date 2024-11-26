import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://best-onlinestore.site',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
