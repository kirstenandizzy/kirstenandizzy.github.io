import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Lightning CSS handles vendor prefixes automatically based on these targets.
// Write only unprefixed properties in SCSS — the build adds -webkit- as needed.
export default defineConfig({
  plugins: [react()],
  base: '/',
  css: {
    lightningcss: {
      targets: {
        chrome: 90 << 16,
        safari: 15 << 16,
        firefox: 90 << 16,
        edge: 90 << 16,
        ios_saf: 15 << 16,
      },
    },
  },
})
