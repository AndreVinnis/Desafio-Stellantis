import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dentro do Docker (Windows), o bind mount não propaga eventos de arquivo,
// então o hot reload precisa de polling. Localmente fica desligado.
const usePolling = process.env.VITE_USE_POLLING === 'true'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escuta em 0.0.0.0 para ser acessível fora do container
    port: 5173,
    strictPort: true,
    watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
  },
})
