import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', 
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,jpg,jpeg,woff,woff2,ttf,eot,json}'
        ],
        cleanupOutdatedCaches: false,
      },
      manifest: {
        name: 'Moha Fashion Store',
        short_name: 'Moha Fashion',
        description: 'Wholesale and Retail for Apparel and Clothing Best Deals under one roof',
        theme_color: '#ffffff',
      }
  })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    cors: {
      // the origin you will be accessing via browser
      origin: 'http://localhost:8000',
    },
  },
})
