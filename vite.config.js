import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/SWE-NSAE/',  // Set this to your repository name (case-sensitive)
});
