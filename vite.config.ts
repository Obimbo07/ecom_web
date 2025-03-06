import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
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
        name: 'Your App Name',
        short_name: 'App',
        description: 'Your App Description',
        theme_color: '#ffffff',
      }
  })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
