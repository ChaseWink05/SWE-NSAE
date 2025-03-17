import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    base: command === 'build' ? '/SWE-NSAE/' : '/',  // Use '/' for development and '/SWE-NSAE/' for production
  };
});