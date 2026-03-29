import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 👈 여기가 'api-react'가 아니라 'plugin-react'여야 합니다!
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FreshGuard AI',
        short_name: 'FreshGuard',
        description: 'AI 기반 신선도 관리 앱',
        theme_color: '#2e7d32',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/415/415733.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})