import * as path from 'path';
import * as VitestConfig from 'vitest/config';
import react from '@vitejs/plugin-react';

export default VitestConfig.defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    includeSource: ['app/**/*.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
  plugins: [react()],
});
