import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // 业务接口
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 若依自带
      '/captchaImage': { target: 'http://localhost:8080', changeOrigin: true },
      '/login':        { target: 'http://localhost:8080', changeOrigin: true },
      '/logout':       { target: 'http://localhost:8080', changeOrigin: true },
      '/getInfo':      { target: 'http://localhost:8080', changeOrigin: true },
      '/getRouters':   { target: 'http://localhost:8080', changeOrigin: true },
      '/register':     { target: 'http://localhost:8080', changeOrigin: true,
    },

      // 文件上传
      '/common':  { target: 'http://localhost:8080', changeOrigin: true },
      // 图片访问（上传成功后的文件地址）
      '/profile': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});