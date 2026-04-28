/**
 * Entry point do módulo.
 *
 * O consumidor instala como plugin Vue:
 *
 *   import { createCmsFirebase } from '@frella/cms-firebase'
 *
 *   const cms = createCmsFirebase({
 *     firebaseConfig: { apiKey: '...', projectId: '...', ... },
 *     authLanguage: 'pt-BR',
 *   })
 *
 *   app.use(cms)
 *
 * Em fases futuras o plugin também registrará rotas admin e
 * componentes de layout. Nesta fatia inicial ele apenas inicializa
 * Firebase e disponibiliza os composables via import direto.
 */

import { initFirebase, useFirebase } from './firebase/init.js'
import { useCrud } from './composables/useCrud.js'
import { useAuth, formatUser } from './composables/useAuth.js'
import { useStorage } from './composables/useStorage.js'
import { useCms, CMS_STORE_KEY } from './composables/useCms.js'
import { createCmsStore } from './stores/createCmsStore.js'
import { cmsAdminRoutes } from './routes.js'
import AdminLayout from './layouts/AdminLayout.vue'

export function createCmsFirebase(options = {}) {
  const { firebaseConfig, authLanguage, enableAnalytics, useStore } = options

  if (!firebaseConfig) {
    throw new Error('[@frella/cms-firebase] firebaseConfig é obrigatório em createCmsFirebase()')
  }

  return {
    install(app) {
      const services = initFirebase(firebaseConfig, { authLanguage, enableAnalytics })
      const exposed = { ...services, useCrud, useAuth, useStorage }

      // Disponibiliza injeção via inject('cms') em qualquer componente.
      app.provide('cms', exposed)
      app.config.globalProperties.$cms = exposed

      // Permite que páginas internas do módulo acessem a store do consumidor
      if (useStore) {
        app.provide(CMS_STORE_KEY, useStore)
      }
    }
  }
}

// Re-exports para uso direto sem o plugin
export {
  initFirebase,
  useFirebase,
  useCrud,
  useAuth,
  useStorage,
  useCms,
  formatUser,
  createCmsStore,
  cmsAdminRoutes,
  AdminLayout,
  CMS_STORE_KEY
}
