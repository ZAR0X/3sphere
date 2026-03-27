import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


const repoName = 'CodeCrate' 
const isProduction = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: isProduction ? `/${repoName}/` : '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
