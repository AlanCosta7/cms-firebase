import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
      name: 'CmsFirebase',
      fileName: (format) => format === 'es' ? 'cms-firebase.js' : `cms-firebase.${format}.cjs`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Não embutir libs do consumidor — precisam vir do app que importa o módulo
      external: [
        'vue',
        'vue-router',
        'pinia',
        'quasar',
        'firebase/app',
        'firebase/firestore',
        'firebase/auth',
        'firebase/functions',
        'firebase/storage',
        'firebase/analytics'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          quasar: 'Quasar',
          'firebase/app': 'app',
          'firebase/firestore': 'firestore',
          'firebase/auth': 'auth',
          'firebase/functions': 'functions',
          'firebase/storage': 'storage',
          'firebase/analytics': 'analytics'
        },
        exports: 'named'
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
})
