import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    env: {
      NEXT_PUBLIC_SHOPIFY_DOMAIN: 'test.myshopify.com',
      SHOPIFY_ADMIN_ACCESS_TOKEN: 'shpat_test',
      SHOPIFY_PRODUCT_MAP: JSON.stringify({
        test: {
          productId: 'gid://shopify/Product/1',
          variantId: 'gid://shopify/ProductVariant/1',
        },
      }),
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.claude/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
