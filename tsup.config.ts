import { defineConfig } from 'tsup';
import { readFileSync, copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'oidc-client-ts'],
  onSuccess: async () => {
    // Copy theme.css from src to dist
    try {
      copyFileSync('src/theme/index.css', 'dist/theme.css');
      console.log('[tsup] theme.css copied to dist/');
    } catch (e) {
      console.warn('[tsup] theme.css missing, skipped');
    }
  },
});
