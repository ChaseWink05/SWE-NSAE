import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/SWE-NSAE/',  // Make sure this matches your repository name
});
