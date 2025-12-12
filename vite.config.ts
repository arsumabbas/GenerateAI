import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // 1. Polyfill process.env for libraries that rely on it (prevents "process is not defined")
      'process.env': {},
      
      // 2. Explicitly inject the API KEY. 
      // Vercel uses 'API_KEY', local dev often uses 'VITE_API_KEY'. We check both.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || ''),
    }
  };
});