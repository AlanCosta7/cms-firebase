# @frella/cms-firebase

Módulo CMS + CRUD com Firebase para projetos institucionais Vue 3 + Quasar.
Encapsula a inicialização do Firebase, store Pinia, layout admin e páginas
de CMS (Settings, Pages, Faixa, Footer) prontas para usar.

## Instalação

```sh
npm install @frella/cms-firebase firebase
```

> Pacote privado no GitHub Packages — veja `.npmrc.example` e [USAGE.md](./docs/USAGE.md#3-configurar-autenticação-no-github-packages).

## Setup mínimo (3 passos)

```js
// 1. src/stores/cms.js
import { createCmsStore } from '@frella/cms-firebase'
import { Notify, Dialog } from 'quasar'

export const useCmsStore = createCmsStore({
  collections: ['config', 'pages', 'faixa', 'footer'],
  handleCallback: ({ type, message }) => Notify.create({ type, message }),
  confirmSignOut: () => new Promise((r) =>
    Dialog.create({ title: 'Sair?', cancel: true })
      .onOk(() => r(true)).onCancel(() => r(false))
  )
})
```

```js
// 2. src/boot/cms.js
import { boot } from 'quasar/wrappers'
import { createCmsFirebase } from '@frella/cms-firebase'
import { useCmsStore } from 'stores/cms'

export default boot(({ app }) => {
  app.use(createCmsFirebase({
    firebaseConfig: { /* sua config */ },
    useStore: useCmsStore
  }))
})
```

```js
// 3. src/router/routes.js
import { cmsAdminRoutes } from '@frella/cms-firebase'

export default [
  { path: '/', component: () => import('layouts/MainLayout.vue'), children: [/* público */] },
  cmsAdminRoutes({ prefix: '/admin' }),
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') }
]
```

`/admin` está pronto: login, settings, pages, faixa, footer.

## Documentação

- **[Guia de uso completo →](./docs/USAGE.md)** — passo a passo do zero ao deploy, com troubleshooting.
- **[API Reference →](./docs/API.md)** — todos os exports, tipos e convenções de coleção.
- **[Changelog →](./CHANGELOG.md)**

## Build local

```sh
npm install
npm run build       # gera dist/cms-firebase.js + style.css
npm run dev         # build com watch
```

## O que está pronto

- Inicialização parametrizada do Firebase
- Store Pinia (setup syntax) com hidratação reativa
- Composables `useCrud`, `useAuth`, `useStorage` (retornos `Result<T>`)
- Layout admin configurável (logo, menu, cores, namespacing de rotas)
- Páginas built-in: Auth, Settings, Pages, Faixa, Footer
- Helper `cmsAdminRoutes` com `include`/`exclude`/`routeNames`
- Galeria de imagens reutilizável (`DialogImg`)
- Form universal reutilizável (`Model`)

## Roadmap

- Schemas tipados (`defineCollections`) por cliente
- Páginas opcionais como exemplos importáveis (Header, Servicos, Agenda)
- Plugin de gerador de rules de Firestore baseado em schema
- Tipagens TypeScript geradas automaticamente

## Licença

UNLICENSED — proprietário, ver [LICENSE](./LICENSE).
