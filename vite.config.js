import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint'

export default ({ mode }) => defineConfig({
    plugins: [react(), eslint()],
    base: './',
    server: {
        port: 3001,
    },
    define: {
        'process.env.NODE_ENV': `"${mode}"`,
    },
});
