/**
 * @file Storage composable.
 *
 * Não chama Quasar Loading diretamente — expõe `onProgress(percent)` e
 * resolve promises com URLs em vez de mutar state interno.
 */

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  list,
  listAll
} from 'firebase/storage'

import { useFirebase } from '../firebase/init.js'

/**
 * @typedef {object} StorageOptions
 * @property {(payload: { type: string, message: string }) => void} [handleCallback]
 * @property {string} [pathPrefix]       - usado em uploads e list (default: '')
 * @property {string} [deletePathPrefix] - usado em delete por id (default: 'galeria/')
 */

/**
 * @typedef {object} UploadResult
 * @property {string} id
 * @property {string} url
 * @property {string} fullPath
 */

const noop = () => {}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * @param {StorageOptions} [options]
 */
export function useStorage(options = {}) {
  const {
    handleCallback = noop,
    pathPrefix = '',
    deletePathPrefix = 'galeria/'
  } = options
  const { $storage } = useFirebase()

  /**
   * @param {File|Blob} file
   * @param {{ id?: string, onProgress?: (percent: number, snap: any) => void }} [opts]
   * @returns {Promise<UploadResult>}
   */
  function uploadFile(file, opts = {}) {
    if (!file) return Promise.reject(new Error('uploadFile: arquivo ausente'))
    const id = opts.id || generateId()
    const onProgress = opts.onProgress || noop
    const fullPath = `${pathPrefix}${id}`
    const ref = storageRef($storage, fullPath)

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(ref, file)
      task.on('state_changed',
        (snap) => onProgress((snap.bytesTransferred / snap.totalBytes) * 100, snap),
        (error) => {
          handleCallback({ type: 'negative', message: 'Upload failed' })
          reject(error)
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref)
            handleCallback({ type: 'positive', message: 'Image uploaded successfully' })
            resolve({ id, url, fullPath })
          } catch (error) { reject(error) }
        }
      )
    })
  }

  async function listFiles({ path = pathPrefix, maxResults = 200 } = {}) {
    const ref = storageRef($storage, path)
    const page = await list(ref, { maxResults })
    const results = await Promise.all(
      page.items.map(async (item) => {
        try {
          const url = await getDownloadURL(storageRef($storage, item.fullPath))
          return { fullPath: item.fullPath, name: item.name, url }
        } catch {
          return null
        }
      })
    )
    return results.filter(Boolean)
  }

  async function listAllFiles({ path = pathPrefix } = {}) {
    return await listAll(storageRef($storage, path))
  }

  /**
   * @param {string} idOrPath
   * @param {{ fullPath?: boolean }} [opts]
   */
  async function deleteFile(idOrPath, { fullPath = false } = {}) {
    const path = fullPath ? idOrPath : `${deletePathPrefix}${idOrPath}`
    try {
      await deleteObject(storageRef($storage, path))
      handleCallback({ type: 'positive', message: 'Image deleted' })
      return { ok: true }
    } catch (error) {
      handleCallback({ type: 'negative', message: 'Oops! Could not delete an image' })
      return { ok: false, error }
    }
  }

  return { uploadFile, listFiles, listAllFiles, deleteFile }
}
