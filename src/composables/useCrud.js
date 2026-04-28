/**
 * @file CRUD genérico em cima do Firestore.
 *
 * Retornos padronizados para `Result<T>`:
 *   { ok: true,  value: T }
 *   { ok: false, error: Error }
 *
 * Notificações UX via `handleCallback` (opcional) — passe Notify do Quasar
 * se quiser feedback visual automático.
 */

import {
  doc, getDocs, deleteDoc, addDoc, updateDoc,
  collection, query, where, onSnapshot, orderBy, limit
} from 'firebase/firestore'

import { useFirebase } from '../firebase/init.js'

/**
 * @typedef {object} CrudOptions
 * @property {(payload: { type: 'positive'|'negative'|'warning'|'info', message: string }) => void} [handleCallback]
 */

/**
 * @template T
 * @typedef {{ ok: true, value: T } | { ok: false, error: Error }} Result
 */

/**
 * @typedef {object} QueryOptions
 * @property {Array<[string, FirebaseFirestore.WhereFilterOp, any]>} [where]
 * @property {{ field: string, dir?: 'asc'|'desc' }} [orderBy]
 * @property {number} [limit]
 */

const noopCallback = () => {}

function ok(value)      { return { ok: true, value } }
function fail(error)    { return { ok: false, error } }

/**
 * @param {CrudOptions} [options]
 */
export function useCrud(options = {}) {
  const { handleCallback = noopCallback } = options
  const { $firestore } = useFirebase()

  function applyConstraints(baseRef, opts = {}) {
    const constraints = []
    if (opts.where) for (const [f, op, v] of opts.where) constraints.push(where(f, op, v))
    if (opts.orderBy) constraints.push(orderBy(opts.orderBy.field, opts.orderBy.dir || 'asc'))
    if (opts.limit) constraints.push(limit(opts.limit))
    return constraints.length ? query(baseRef, ...constraints) : baseRef
  }

  /**
   * Cria documento na coleção.
   * @returns {Promise<Result<import('firebase/firestore').DocumentReference>>}
   */
  async function saveDoc({ collection: col, data }) {
    try {
      const ref = await addDoc(collection($firestore, col), data)
      handleCallback({ type: 'positive', message: 'Saved successfully' })
      return ok(ref)
    } catch (error) {
      handleCallback({ type: 'negative', message: 'Oops! Could not save' })
      return fail(error)
    }
  }

  /** @returns {Promise<Result<true>>} */
  async function updateDocs({ collection: col, id, data }) {
    try {
      await updateDoc(doc($firestore, col, id), data)
      handleCallback({ type: 'positive', message: 'Saved successfully' })
      return ok(true)
    } catch (error) {
      handleCallback({ type: 'negative', message: 'Oops! Could not save' })
      return fail(error)
    }
  }

  /** @returns {Promise<Result<true>>} */
  async function deleteDocs({ collection: col, id }) {
    try {
      await deleteDoc(doc($firestore, col, id))
      handleCallback({ type: 'positive', message: 'Deleted successfully' })
      return ok(true)
    } catch (error) {
      handleCallback({ type: 'negative', message: 'Oops! Could not delete' })
      return fail(error)
    }
  }

  /**
   * One-shot read com filtros opcionais.
   * @param {string} col
   * @param {QueryOptions} [opts]
   */
  async function fetchCollection(col, opts) {
    const q = applyConstraints(collection($firestore, col), opts)
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, data: d.data() }))
  }

  /**
   * Subscribe em tempo real. Retorna `unsubscribe`.
   * @param {string} col
   * @param {(rows: Array<{id:string,data:object}>) => void} onChange
   * @param {QueryOptions} [opts]
   */
  function subscribeCollection(col, onChange, opts) {
    const q = applyConstraints(collection($firestore, col), opts)
    return onSnapshot(q, (snap) => {
      onChange(snap.docs.map((d) => ({ id: d.id, data: d.data() })))
    })
  }

  return { saveDoc, updateDocs, deleteDocs, fetchCollection, subscribeCollection }
}
