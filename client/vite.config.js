import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@chatscope/chat-ui-kit-react': path.resolve(__dirname, 'node_modules/@chatscope/chat-ui-kit-react'),
      '@chatscope/chat-ui-kit-styles': path.resolve(__dirname, 'node_modules/@chatscope/chat-ui-kit-styles'),
      'react-table': path.resolve(__dirname, 'node_modules/react-table')
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
    }
  },
  optimizeDeps: {
    include: [
      "@chatscope/chat-ui-kit-react",
      "@chatscope/chat-ui-kit-styles",
      "react-table"
    ]
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/graphql': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
