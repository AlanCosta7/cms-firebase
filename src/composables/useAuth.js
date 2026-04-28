/**
 * @file Auth composable.
 *
 * Não acopla a Quasar Notify/Dialog; callbacks são opcionais. Mantém
 * sem estado interno reativo (use `createCmsStore` se quiser estado).
 */

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as fbSignOut
} from 'firebase/auth'

import { useFirebase } from '../firebase/init.js'

/**
 * @typedef {object} CmsUser
 * @property {string} uid
 * @property {string|null} email
 * @property {boolean} emailVerified
 * @property {string|null} displayName
 * @property {string|null} photoURL
 * @property {string|null} providerId
 * @property {string|null} phoneNumber
 */

/**
 * @typedef {object} AuthOptions
 * @property {(payload: { type: string, message: string }) => void} [handleCallback]
 * @property {Record<string, string>} [errorMessages]
 */

const DEFAULT_ERROR_MESSAGES = {
  'auth/user-not-found': 'User not found.',
  'auth/wrong-password': 'Wrong password.',
  'auth/invalid-email': 'Invalid email.',
  'auth/email-already-in-use': 'Email already in use.',
  'auth/weak-password': 'Weak password. The password must be at least 6 characters long.'
}

const noop = () => {}

/**
 * Normaliza o user do Firebase para o shape `CmsUser`.
 * @param {import('firebase/auth').User|null} userCredential
 * @returns {CmsUser|null}
 */
export function formatUser(userCredential) {
  if (!userCredential) return null
  const {
    uid, email, emailVerified, displayName, photoURL, providerData, phoneNumber
  } = userCredential
  const providerId = providerData && providerData.length > 0
    ? providerData[0].providerId
    : userCredential.providerId
  return { uid, email, emailVerified, displayName, photoURL, providerId, phoneNumber }
}

/**
 * @param {AuthOptions} [options]
 */
export function useAuth(options = {}) {
  const {
    handleCallback = noop,
    errorMessages = DEFAULT_ERROR_MESSAGES
  } = options
  const { $auth } = useFirebase()

  /**
   * @param {{email: string, password: string}} payload
   * @returns {Promise<CmsUser|false>}
   */
  async function signIn({ email, password }) {
    if ($auth.currentUser) return formatUser($auth.currentUser)
    try {
      const cred = await signInWithEmailAndPassword($auth, email, password)
      return formatUser(cred.user)
    } catch (error) {
      const code = error?.code
      const message = (code && errorMessages[code]) || 'Ops!'
      handleCallback({ type: 'negative', message })
      return false
    }
  }

  /**
   * @param {{ confirm?: () => Promise<boolean> }} [opts]
   * @returns {Promise<boolean>}
   */
  async function signOut(opts = {}) {
    const { confirm } = opts
    if (typeof confirm === 'function') {
      const proceed = await confirm()
      if (!proceed) return false
    }
    await fbSignOut($auth)
    handleCallback({ type: 'positive', message: 'You have been successfully logged out.' })
    return true
  }

  /**
   * Subscreve mudanças de auth state. Retorna unsubscribe.
   * @param {(user: CmsUser|null) => void} onChange
   * @returns {() => void}
   */
  function watchAuth(onChange) {
    return onAuthStateChanged($auth, (user) => onChange(formatUser(user)))
  }

  return {
    signIn,
    signOut,
    watchAuth,
    formatUser,
    get currentUser() { return formatUser($auth.currentUser) }
  }
}
