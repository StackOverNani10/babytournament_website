import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (aunque no se usen directamente aquí, se necesitan para el build)
  loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Hacer que las variables de entorno con prefijo VITE_ estén disponibles en el cliente
    define: {
      'process.env': {}
    },
    server: {
      port: 3000,
      open: true
    },
  };
});
