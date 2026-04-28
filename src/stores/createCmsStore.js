/**
 * @file Pinia store factory (setup syntax).
 *
 * Substitui o globalStore singleton do projeto original. O cliente passa
 * a lista de coleções a hidratar e callbacks (Notify/Dialog) — assim o
 * módulo permanece desacoplado do Quasar.
 *
 * Decisões de design:
 *  - Setup syntax: composables (`useCrud`, `useAuth`, `useStorage`) são
 *    instanciados UMA vez quando a store é acessada (lazy), em vez de
 *    a cada action.
 *  - State e ações fechados sobre as instâncias dos composables — sem
 *    expor `_crud`/`_auth`/`_storage` na API pública.
 *  - Singletons (`config`, `footer`) viram `null` quando vazios; demais
 *    coleções são arrays.
 */

import { defineStore } from 'pinia'
import { ref, reactive, toRefs } from 'vue'
import { useCrud } from '../composables/useCrud.js'
import { useAuth } from '../composables/useAuth.js'
import { useStorage } from '../composables/useStorage.js'

/**
 * @typedef {object} CreateStoreOptions
 * @property {string}   [id='cms']
 * @property {string[]} [collections]   - default: ['config','pages','faixa','footer']
 * @property {Set<string>|string[]} [singletons] - coleções tratadas como doc único (default: ['config','footer'])
 * @property {(payload: { type: string, message: string }) => void} [handleCallback]
 * @property {() => Promise<boolean>} [confirmSignOut]
 * @property {object}   [storageOptions]
 */

const DEFAULT_COLLECTIONS = ['config', 'pages', 'faixa', 'footer']
const DEFAULT_SINGLETONS  = ['config', 'footer']

/**
 * Cria um Pinia store configurado para o CMS.
 * @param {CreateStoreOptions} [options]
 */
export function createCmsStore(options = {}) {
  const {
    id = 'cms',
    collections = DEFAULT_COLLECTIONS,
    singletons = DEFAULT_SINGLETONS,
    handleCallback,
    confirmSignOut,
    storageOptions = {}
  } = options

  const singletonSet = new Set(singletons)

  return defineStore(id, () => {
    // Composables instanciados UMA vez (lazy, na 1ª chamada à store)
    const crud = useCrud({ handleCallback })
    const auth = useAuth({ handleCallback })
    const storage = useStorage({ handleCallback, ...storageOptions })

    // ---- State
    // Cria um reactive cujas chaves são as coleções; toRefs() permite
    // acesso direto via store.faixa, store.pages, com reatividade.
    const data = reactive(
      Object.fromEntries(
        collections.map((c) => [c, singletonSet.has(c) ? null : []])
      )
    )

    const currentUser  = ref(null)
    const error        = ref(null)
    const listaGaleria = ref([])
    const firstPage    = ref(null)
    const dialogPay    = reactive({ show: false, data: null })
    const _subs        = []

    // ---- Hydration
    function hydrate() {
      for (const col of collections) {
        const unsub = crud.subscribeCollection(col, (lista) => {
          data[col] = singletonSet.has(col) ? (lista[0] || null) : lista
        })
        _subs.push(unsub)
      }
    }

    function unsubscribeAll() {
      while (_subs.length) {
        const u = _subs.pop()
        try { u() } catch { /* ignore */ }
      }
    }

    // ---- Auth
    async function signIn(payload) {
      const user = await auth.signIn(payload)
      if (user) currentUser.value = user
      return user
    }

    async function signOut() {
      const ok = await auth.signOut({ confirm: confirmSignOut })
      if (ok) currentUser.value = null
      return ok
    }

    function watchAuth() {
      return auth.watchAuth((user) => { currentUser.value = user })
    }

    // ---- CRUD passthrough
    const saveDoc    = (p) => crud.saveDoc(p)
    const updateDocs = (p) => crud.updateDocs(p)
    const deleteDocs = (p) => crud.deleteDocs(p)
    const fetchCollection     = (...a) => crud.fetchCollection(...a)
    const subscribeCollection = (...a) => crud.subscribeCollection(...a)

    // ---- Storage helpers (assinatura compatível com globalStore original)
    async function uploadPhotoURL({ file, id: customId, onProgress } = {}) {
      try {
        const result = await storage.uploadFile(file, { id: customId, onProgress })
        if (result?.url && !listaGaleria.value.includes(result.url)) {
          listaGaleria.value.push(result.url)
        }
        return result
      } catch (err) {
        error.value = err
        return null
      }
    }

    async function getImg(opts) {
      const items = await storage.listFiles(opts)
      listaGaleria.value = items.map((i) => i.url)
      return listaGaleria.value
    }

    function deletImg(idOrPath) { return storage.deleteFile(idOrPath) }

    function atualizar() {
      firstPage.value = null
      listaGaleria.value = []
      return getImg()
    }

    function setDialogPay(item) { Object.assign(dialogPay, item) }

    return {
      // Coleções expostas individualmente como refs reativos
      ...toRefs(data),
      // State adicional
      currentUser,
      error,
      listaGaleria,
      firstPage,
      dialogPay,
      // Actions
      hydrate,
      unsubscribeAll,
      signIn,
      signOut,
      watchAuth,
      saveDoc,
      updateDocs,
      deleteDocs,
      fetchCollection,
      subscribeCollection,
      uploadPhotoURL,
      getImg,
      deletImg,
      atualizar,
      setDialogPay
    }
  })
}
