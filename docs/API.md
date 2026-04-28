# API Reference — `@frella/cms-firebase`

Referência rápida de tudo o que o módulo exporta. Para um guia de uso narrativo, veja [`USAGE.md`](./USAGE.md).

## Exports do `index.js`

| Export | Tipo | Descrição |
|---|---|---|
| `createCmsFirebase` | factory | Plugin Vue. Inicializa Firebase + provê store. |
| `createCmsStore` | factory | Cria a Pinia store do CMS. |
| `cmsAdminRoutes` | factory | Retorna o objeto de rota para o router. |
| `AdminLayout` | component | Layout do painel (drawer + header). |
| `useCms` | composable | Acessa a store dentro de páginas/components do módulo. |
| `useCrud` | composable | CRUD genérico no Firestore. |
| `useAuth` | composable | Login/logout/watch. |
| `useStorage` | composable | Upload/list/delete em Firebase Storage. |
| `useFirebase` | composable | Acessa serviços Firebase já inicializados. |
| `initFirebase` | função | Init manual do Firebase (sem o plugin). |
| `formatUser` | função | Normaliza objeto user do Firebase. |
| `CMS_STORE_KEY` | symbol | Chave de injeção da store. |

---

## `createCmsFirebase(options)`

Plugin Vue. Use com `app.use()`.

```ts
type Options = {
  firebaseConfig: FirebaseAppConfig          // obrigatório
  authLanguage?: string                       // default: 'pt-BR'
  enableAnalytics?: boolean                   // default: true
  useStore?: () => Store                      // necessário p/ páginas admin do módulo
}

type FirebaseAppConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string                       // aceita 'gs://x' ou só 'x'
  messagingSenderId?: string
  appId: string
  measurementId?: string
}
```

**Side effects:**
- `app.provide('cms', { ...services, useCrud, useAuth, useStorage })`
- `app.config.globalProperties.$cms = ...`
- Se `useStore` passado: `app.provide(CMS_STORE_KEY, useStore)`

---

## `createCmsStore(options)`

Factory de store Pinia (setup syntax). Retorna `useCmsStore`.

```ts
type Options = {
  id?: string                              // default: 'cms'
  collections?: string[]                    // default: ['config','pages','faixa','footer']
  singletons?: string[] | Set<string>       // default: ['config','footer']
  handleCallback?: (p: { type, message }) => void
  confirmSignOut?: () => Promise<boolean>
  storageOptions?: {
    pathPrefix?: string                     // default: ''
    deletePathPrefix?: string                // default: 'galeria/'
  }
}
```

### State da store

| Chave | Tipo | Hidrata via |
|---|---|---|
| `<collection>` (cada uma de `collections`) | `null` ou `Array<{id,data}>` | `hydrate()` |
| `currentUser` | `CmsUser \| null` | `watchAuth()` |
| `error` | `Error \| null` | exceções internas |
| `listaGaleria` | `string[]` | `getImg()`/`uploadPhotoURL()` |
| `firstPage` | `ListResult \| null` | `getImg()` |
| `dialogPay` | `{ show, data }` | `setDialogPay()` |

### Actions da store

| Action | Argumento | Retorno |
|---|---|---|
| `hydrate()` | — | `void` (popula todas as coleções via onSnapshot) |
| `unsubscribeAll()` | — | `void` |
| `signIn({ email, password })` | credenciais | `Promise<CmsUser \| false>` |
| `signOut()` | — | `Promise<boolean>` |
| `watchAuth()` | — | `() => void` (unsub) |
| `saveDoc({ collection, data })` | payload | `Promise<{ ok, value? : DocRef, error? }>` |
| `updateDocs({ collection, id, data })` | payload | `Promise<{ ok, value?: true, error? }>` |
| `deleteDocs({ collection, id })` | payload | `Promise<{ ok, value?: true, error? }>` |
| `fetchCollection(name, { where?, orderBy?, limit? })` | filtros | `Promise<Array<{id,data}>>` |
| `subscribeCollection(name, onChange, opts)` | filtros | `() => void` (unsub) |
| `uploadPhotoURL({ file, id?, onProgress? })` | upload | `Promise<UploadResult \| null>` |
| `getImg({ path?, maxResults? })` | listing | `Promise<string[]>` |
| `deletImg(idOrPath)` | id | `Promise<{ ok, error? }>` |
| `atualizar()` | — | re-lista galeria |
| `setDialogPay(item)` | obj | `void` |

---

## `cmsAdminRoutes(options)`

Retorna um objeto de rota Vue Router pronto para mesclar.

```ts
type Options = {
  prefix?: string                           // default: '/admin'
  layout?: Component                        // default: AdminLayout do módulo
  layoutProps?: object                      // props passadas ao layout
  extra?: RouteRecordRaw[]                   // rotas filhas adicionais
  include?: CmsAdminPage[]                  // whitelist (default: todas)
  exclude?: CmsAdminPage[]                  // blacklist
  routeNames?: Partial<Record<CmsAdminPage, string>>  // rename
}

type CmsAdminPage = 'auth' | 'settings' | 'pages' | 'faixa' | 'footer'
```

### Páginas built-in

| Página | Path padrão | Nome padrão | Componente |
|---|---|---|---|
| `auth` | `/admin/` | `cms-auth` | `Auth.vue` |
| `settings` | `/admin/settings` | `cms-settings` | `Settings.vue` |
| `pages` | `/admin/pages` | `cms-pages` | `Pages.vue` |
| `faixa` | `/admin/faixa` | `cms-faixa` | `Faixa.vue` |
| `footer` | `/admin/footer` | `cms-footer` | `Footer.vue` |

---

## `AdminLayout` props

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `title` | string | `'Painel do administrador'` | Texto do header |
| `logo` | string | `''` | URL fixa do logo |
| `logoFromConfig` | string | `''` | Chave em `cms.config.data` para logo dinâmico |
| `menu` | `MenuItem[]` | menu padrão (Settings, Pages, Faixas, Footer) | Itens do drawer |
| `authRouteName` | string | `'cms-auth'` | Nome da rota de login |
| `defaultRouteName` | string | `'cms-faixa'` | Rota após login |
| `headerClass` | string | `'bg-black'` | Classes Quasar do toolbar |
| `drawerWidth` | number | `200` | Largura do drawer |

```ts
type MenuItem = { label: string, link: string, icon: string }
```

---

## Composables

### `useCms()`

Dentro de páginas/components do módulo (ou do consumidor que importou via `inject`):

```js
const cms = useCms()
// cms é a store completa
```

Lança erro se `useStore` não foi passado em `createCmsFirebase()`.

### `useCrud(options)`

```js
const { saveDoc, updateDocs, deleteDocs, fetchCollection, subscribeCollection } = useCrud({
  handleCallback: ({ type, message }) => Notify.create({ type, message })
})
```

**Resultado padrão `Result<T>`:** `{ ok: true, value: T } | { ok: false, error: Error }`.

Veja exemplos em [USAGE.md](./USAGE.md#11-adicionando-páginas-admin-específicas-do-cliente).

### `useAuth(options)`

```js
const auth = useAuth({ handleCallback, errorMessages })
const user = await auth.signIn({ email, password })
const unsub = auth.watchAuth((user) => { /* ... */ })
await auth.signOut({ confirm: () => Promise<boolean> })
```

### `useStorage(options)`

```js
const storage = useStorage({ pathPrefix: 'galeria/', handleCallback })
const { id, url, fullPath } = await storage.uploadFile(file, {
  onProgress: (pct) => console.log(pct)
})
const items = await storage.listFiles({ maxResults: 200 })
await storage.deleteFile(id)
```

### `useFirebase()`

```js
const { app, $firestore, $auth, $functions, $storage, analytics, logEvent } = useFirebase()
```

Útil quando você precisa de funcionalidades Firebase não cobertas pelos composables (ex: `httpsCallable`, batch writes).

---

## Tipos auxiliares

```ts
type CmsUser = {
  uid: string
  email: string | null
  emailVerified: boolean
  displayName: string | null
  photoURL: string | null
  providerId: string | null
  phoneNumber: string | null
}

type Doc<T = object> = { id: string, data: T }

type UploadResult = {
  id: string
  url: string
  fullPath: string
}

type Result<T> =
  | { ok: true, value: T }
  | { ok: false, error: Error }
```

---

## Convenções de coleção

O CMS espera certos shapes para que as páginas built-in funcionem:

### `config` (singleton)

```ts
{
  favicon: string
  meta: { title, description, ogUrl, ogImage }
  tags: Array<{ label, value, position: 'head'|'body_start'|'body_end' }>
  colors: { primary, secondary, accent }
}
```

### `pages` (array)

```ts
{ title: string, slug: string }
```

### `faixa` (array)

```ts
{
  pagId: string         // FK para pages
  pagLabel: string      // título da página (denormalizado)
  label: string         // categoria/seção
  img: string | null
  title, text, btnLabel, btnLink, btnColor, btnTextColor, bgColor: string
  show: boolean
  invert: boolean
  lista: Array<{ /* sub-itens com mesma estrutura */ }>
}
```

### `footer` (singleton)

```ts
{
  email, tel, facebook, instagram, whatsapp, linkedin: string
  endereco: string      // HTML do q-editor
}
```

Para adicionar campos custom, edite os Vue files das páginas no seu projeto (não no módulo) ou crie páginas próprias usando `Model` + `useCms`.
