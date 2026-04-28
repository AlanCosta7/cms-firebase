/**
 * @file Inicialização parametrizada do Firebase para projetos consumidores.
 *
 * O módulo NÃO conhece variáveis de ambiente — quem consome passa a config.
 * Mantém uma instância singleton por processo: chamadas subsequentes com a
 * mesma config retornam a mesma instância. Configs diferentes geram aviso
 * explícito (em vez de mascarar o problema retornando a primeira).
 */

import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported as analyticsSupported, logEvent } from 'firebase/analytics'

/**
 * @typedef {object} FirebaseAppConfig
 * @property {string} apiKey
 * @property {string} authDomain
 * @property {string} projectId
 * @property {string} storageBucket  - aceita "gs://bucket" ou só "bucket"
 * @property {string} [messagingSenderId]
 * @property {string} appId
 * @property {string} [measurementId]
 */

/**
 * @typedef {object} InitOptions
 * @property {string}  [authLanguage='pt-BR']
 * @property {boolean} [enableAnalytics=true]
 */

/**
 * @typedef {object} FirebaseServices
 * @property {import('firebase/app').FirebaseApp} app
 * @property {import('firebase/firestore').Firestore} $firestore
 * @property {import('firebase/auth').Auth} $auth
 * @property {import('firebase/functions').Functions} $functions
 * @property {import('firebase/storage').FirebaseStorage} $storage
 * @property {import('firebase/analytics').Analytics | null} analytics
 * @property {typeof logEvent} logEvent
 */

let _services = null
let _configKey = null

function configFingerprint(c) {
  return `${c.projectId}:${c.appId}`
}

/**
 * @param {FirebaseAppConfig} firebaseConfig
 * @param {InitOptions} [options]
 * @returns {FirebaseServices}
 */
export function initFirebase(firebaseConfig, options = {}) {
  const fingerprint = configFingerprint(firebaseConfig)

  if (_services) {
    if (_configKey && _configKey !== fingerprint) {
      console.warn(
        '[@frella/cms-firebase] initFirebase chamado com config diferente; ' +
        'ignorando. Use apenas uma config por processo.'
      )
    }
    return _services
  }

  const { authLanguage = 'pt-BR', enableAnalytics = true } = options

  const normalizedConfig = {
    ...firebaseConfig,
    storageBucket: firebaseConfig.storageBucket?.startsWith('gs://')
      ? firebaseConfig.storageBucket
      : `gs://${firebaseConfig.storageBucket}`
  }

  const app = getApps().length ? getApps()[0] : initializeApp(normalizedConfig)
  const $firestore = getFirestore(app)
  const $auth = getAuth(app)
  const $functions = getFunctions(app)
  const $storage = getStorage(app)
  $auth.languageCode = authLanguage

  let analytics = null
  if (enableAnalytics && typeof window !== 'undefined') {
    analyticsSupported()
      .then((ok) => { if (ok) analytics = getAnalytics(app) })
      .catch(() => { /* analytics opcional, falha silenciosa por design */ })
  }

  _services = { app, $firestore, $auth, $functions, $storage, analytics, logEvent }
  _configKey = fingerprint
  return _services
}

/**
 * Acessa os serviços já inicializados. Lança se chamado antes de initFirebase.
 * @returns {FirebaseServices}
 */
export function useFirebase() {
  if (!_services) {
    throw new Error(
      '[@frella/cms-firebase] Firebase não inicializado. ' +
      'Chame initFirebase(config) ou app.use(createCmsFirebase({ firebaseConfig })) ' +
      'antes de usar composables/store.'
    )
  }
  return _services
}

/**
 * Reset interno — não exportado no index público; use só em testes.
 * @internal
 */
export function __resetFirebase() {
  _services = null
  _configKey = null
}
