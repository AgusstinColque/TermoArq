import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    // Base conservadora; confirmar webOS y probar en la StanbyME real.
    target: 'chrome79',
  },
})

