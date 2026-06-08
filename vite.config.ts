import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/Focus-Time/'  // ← nombre exacto de tu repositorio
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});


