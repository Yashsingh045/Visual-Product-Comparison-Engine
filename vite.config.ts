import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'better-sqlite3',
                'hnswlib-node',
                'sharp',
                '@tensorflow/tfjs-node',
                'mock-aws-s3',
                'aws-sdk',
                'nock',
                /^node:/
              ]
            }
          }
        }
      }
    ])
  ],
  base: "./",
})
