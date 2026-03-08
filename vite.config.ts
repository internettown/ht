import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

const BUILD_ID = process.env.VITE_BUILD_ID || Date.now().toString();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
})
