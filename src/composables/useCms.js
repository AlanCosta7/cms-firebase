/**
 * Helper de acesso à store CMS de dentro de componentes do módulo.
 *
 * O módulo não pode importar diretamente a store do consumidor (não conhece
 * o id nem a configuração). O fluxo é:
 *
 *   1. Consumidor cria sua store:
 *        export const useCmsStore = createCmsStore({ id: 'cms', collections: [...] })
 *
 *   2. Registra no plugin:
 *        app.use(createCmsFirebase({ firebaseConfig, useStore: useCmsStore }))
 *
 *   3. Páginas/components dentro do módulo chamam:
 *        const cms = useCms()   // devolve a store já instanciada
 *
 * Falha cedo com erro descritivo se o provide não foi feito — assim o
 * desenvolvedor sabe exatamente o que falta configurar.
 */

import { inject } from 'vue'

export const CMS_STORE_KEY = Symbol('cmsStore')

export function useCms() {
  const useStore = inject(CMS_STORE_KEY)
  if (!useStore) {
    throw new Error(
      '[@frella/cms-firebase] Store não registrado. ' +
      'Passe `useStore: useCmsStore` em createCmsFirebase() ' +
      'ou faça app.provide(CMS_STORE_KEY, useCmsStore).'
    )
  }
  return useStore()
}
