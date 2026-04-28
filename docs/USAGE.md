# Guia de uso — `@frella/cms-firebase`

Este guia leva você do zero a um projeto Quasar funcional com CMS + Firebase em ~15 minutos. Use-o como **runbook** ao iniciar cada novo cliente.

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Criar o projeto Quasar](#2-criar-o-projeto-quasar)
3. [Configurar autenticação no GitHub Packages](#3-configurar-autenticação-no-github-packages)
4. [Instalar o módulo](#4-instalar-o-módulo)
5. [Configurar Firebase no projeto](#5-configurar-firebase-no-projeto)
6. [Criar a store CMS](#6-criar-a-store-cms)
7. [Registrar o boot](#7-registrar-o-boot)
8. [Injetar as rotas admin](#8-injetar-as-rotas-admin)
9. [Criar usuário admin no Firebase](#9-criar-usuário-admin-no-firebase)
10. [Customizando o painel](#10-customizando-o-painel)
11. [Adicionando páginas admin específicas do cliente](#11-adicionando-páginas-admin-específicas-do-cliente)
12. [Estrutura recomendada de pastas](#12-estrutura-recomendada-de-pastas)
13. [Deploy](#13-deploy)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Pré-requisitos

Antes de começar tenha:

- Node 18+ e npm 9+ (`node --version`)
- Conta no Firebase com um projeto criado, com Firestore, Authentication e Storage habilitados
- Token GitHub com permissão `read:packages` para baixar o módulo privado
- Quasar CLI global (opcional): `npm i -g @quasar/cli`

---

## 2. Criar o projeto Quasar

```sh
npm init quasar
# escolha:
#   - App with Quasar CLI
#   - Quasar v2
#   - Vue 3
#   - Pacote: Vite
#   - Linguagem: JavaScript (ou TS se preferir)
#   - Pinia (não Vuex)
#   - ESLint sim
cd <nome-do-projeto>
```

---

## 3. Configurar autenticação no GitHub Packages

O pacote é privado. Crie um arquivo `.npmrc` na raiz do projeto:

```ini
@frella:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

E exporte o token na sessão do shell **antes** de rodar `npm install`:

```sh
export NPM_TOKEN=ghp_xxxxxxxxxxxx   # token com read:packages
```

> Adicione `.npmrc` ao `.gitignore` se preferir não comitá-lo. Como o `${NPM_TOKEN}` é resolvido em runtime, o arquivo em si pode ser commitado — mas o token **nunca**.

---

## 4. Instalar o módulo

```sh
npm install @frella/cms-firebase firebase
```

> `firebase`, `pinia`, `quasar`, `vue` e `vue-router` são peerDependencies — já vêm com o starter Quasar, exceto `firebase` que você instala explicitamente.

---

## 5. Configurar Firebase no projeto

Crie um `.env` na raiz com as credenciais do seu projeto Firebase:

```ini
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=meu-cliente.firebaseapp.com
FIREBASE_PROJECT_ID=meu-cliente
FIREBASE_STORAGE_BUCKET=meu-cliente.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:...:web:abc
FIREBASE_MEASUREMENT_ID=G-XXXX
```

Adicione `.env` ao `.gitignore`. As variáveis precisam ser carregadas no Quasar — abra `quasar.config.js` e em `build` adicione:

```js
// quasar.config.js
build: {
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
  }
}
```

E instale o `dotenv`:

```sh
npm install dotenv
```

E no topo do `quasar.config.js`:

```js
require('dotenv').config()
```

---

## 6. Criar a store CMS

Crie `src/stores/cms.js`:

```js
import { createCmsStore } from '@frella/cms-firebase'
import { Notify, Dialog } from 'quasar'

export const useCmsStore = createCmsStore({
  id: 'cms',
  collections: ['config', 'pages', 'faixa', 'footer'],
  // Coleções tratadas como doc único (lista[0]) — default já cobre essas:
  singletons: ['config', 'footer'],

  // Notificações UX automáticas
  handleCallback: ({ type, message }) =>
    Notify.create({ type, message, timeout: 2000 }),

  // Confirmação antes de deslogar
  confirmSignOut: () => new Promise((resolve) => {
    Dialog.create({
      title: 'Deslogar',
      message: 'Tem certeza que deseja sair?',
      cancel: true,
      persistent: true
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
  }),

  // Onde subir e listar imagens no Storage
  storageOptions: {
    pathPrefix: 'galeria/',
    deletePathPrefix: 'galeria/'
  }
})
```

> A store é uma factory: você pode ter mais de uma com IDs diferentes se precisar de painéis distintos no mesmo app (raro).

---

## 7. Registrar o boot

Crie `src/boot/cms.js`:

```js
import { boot } from 'quasar/wrappers'
import { createCmsFirebase } from '@frella/cms-firebase'
import { useCmsStore } from 'stores/cms'

export default boot(({ app }) => {
  app.use(createCmsFirebase({
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    },
    authLanguage: 'pt-BR',
    enableAnalytics: false,        // habilite só em produção, se quiser
    useStore: useCmsStore          // OBRIGATÓRIO p/ páginas admin do módulo
  }))
})
```

Registre o boot em `quasar.config.js`:

```js
boot: ['cms', /* outros */]
```

---

## 8. Injetar as rotas admin

Edite `src/router/routes.js`:

```js
import { cmsAdminRoutes } from '@frella/cms-firebase'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
      // ... rotas públicas do cliente
    ]
  },

  // Painel CMS — pronto para uso em /admin
  cmsAdminRoutes({ prefix: '/admin' }),

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') }
]

export default routes
```

Pronto. Acessando `/admin` aparece o login; após autenticar, o drawer do admin com Settings, Pages, Faixa, Footer.

---

## 9. Criar usuário admin no Firebase

No console Firebase do cliente:

1. **Authentication → Sign-in method:** habilite **Email/Password**.
2. **Authentication → Users → Add user:** crie o usuário (ex: `admin@cliente.com`) com uma senha forte.
3. **Firestore Database → Rules:** restrinja escrita aos autenticados:
   ```rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
4. **Storage → Rules:** mesma lógica:
   ```rules
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

---

## 10. Customizando o painel

### Logo, título e cores

```js
cmsAdminRoutes({
  prefix: '/admin',
  layoutProps: {
    title: 'Painel — Cliente XYZ',
    logo: '/logo-cliente.svg',          // URL fixa
    // OU dinâmica de cms.config.data.<chave>:
    // logoFromConfig: 'favicon',
    headerClass: 'bg-deep-purple-9 text-white'
  }
})
```

### Renomear/desativar páginas

```js
cmsAdminRoutes({
  prefix: '/admin',
  exclude: ['footer'],                  // cliente não tem footer editável
  routeNames: {
    faixa: 'banners',                   // /admin/faixa expõe rota nomeada 'banners'
    settings: 'config-geral'
  }
})
```

### Menu lateral customizado

```js
cmsAdminRoutes({
  prefix: '/admin',
  layoutProps: {
    menu: [
      { label: 'Geral',    link: 'cms-settings', icon: 'settings' },
      { label: 'Páginas',  link: 'cms-pages',    icon: 'description' },
      { label: 'Banners',  link: 'cms-faixa',    icon: 'view_carousel' },
      { label: 'Produtos', link: 'admin-produtos', icon: 'shopping_bag' } // rota custom
    ]
  }
})
```

---

## 11. Adicionando páginas admin específicas do cliente

Páginas como _Agenda_, _Serviços_, _Produtos_ geralmente têm regras de negócio próprias. Crie no projeto:

`src/pages/admin/Produtos.vue`:

```vue
<template>
  <div v-if="cms.currentUser" class="q-pa-md">
    <h1>Produtos</h1>
    <Model
      v-for="(item, i) in cms.faixa"
      :key="i"
      :form="item"
      collection="produtos"
      size="600"
    />
  </div>
</template>

<script setup>
import { useCms, Model } from '@frella/cms-firebase'   // helpers expostos
const cms = useCms()
</script>
```

E registre via `extra`:

```js
cmsAdminRoutes({
  prefix: '/admin',
  extra: [
    {
      path: '/admin/produtos',
      name: 'admin-produtos',
      component: () => import('pages/admin/Produtos.vue')
    }
  ],
  layoutProps: {
    menu: [
      // ... seus itens
      { label: 'Produtos', link: 'admin-produtos', icon: 'shopping_bag' }
    ]
  }
})
```

> Adicione `'produtos'` em `collections` da store se quiser que `cms.produtos` seja hidratado em tempo real.

---

## 12. Estrutura recomendada de pastas

Para um projeto bem organizado:

```
meu-cliente/
├── .env                       # credenciais Firebase (gitignored)
├── .npmrc                     # auth GitHub Packages
├── quasar.config.js
├── src/
│   ├── boot/
│   │   └── cms.js             # registra @frella/cms-firebase
│   ├── stores/
│   │   ├── index.js           # Pinia setup
│   │   └── cms.js             # createCmsStore() — exporta useCmsStore
│   ├── router/
│   │   ├── index.js
│   │   └── routes.js          # injeta cmsAdminRoutes()
│   ├── layouts/
│   │   └── MainLayout.vue     # layout público (não usa o módulo)
│   ├── pages/
│   │   ├── IndexPage.vue      # site público
│   │   ├── About.vue
│   │   └── admin/             # páginas admin extras (cliente-específicas)
│   │       └── Produtos.vue
│   └── components/            # componentes do site público
│       └── ...
└── firebase.json              # se usar Firebase Hosting
```

---

## 13. Deploy

### Firebase Hosting

```sh
npm install -g firebase-tools
firebase login
firebase init hosting
# escolha o projeto, public dir = dist/spa, single-page = sim
quasar build
firebase deploy --only hosting
```

### Variáveis de build em CI

Em GitHub Actions, configure os secrets:

```yaml
env:
  FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  # ... demais
  NPM_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # acesso ao GH Packages
```

E o passo de install:

```yaml
- run: npm ci
  env:
    NPM_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 14. Troubleshooting

### `Firebase não inicializado`

Apareceu esse erro? O boot `cms.js` não está sendo executado antes do uso. Verifique:

1. `boot: ['cms', ...]` está em `quasar.config.js`?
2. Algum componente está chamando `useCms()` ou `useFirebase()` em **escopo de módulo** (top-level)? Mova para dentro de `setup()`.

### `Store não registrado`

`useCms()` foi chamado mas `useStore: useCmsStore` não foi passado em `createCmsFirebase()`. Verifique seu boot.

### `403 Forbidden` ao instalar

`NPM_TOKEN` ausente, expirado, ou sem permissão `read:packages`. Crie um novo token em GitHub → Settings → Developer settings → Personal access tokens.

### Páginas admin não recebem dados em tempo real

A store não foi hidratada. O `AdminLayout` chama `hydrate()` automaticamente em `onMounted`. Se você usa um layout próprio:

```js
const cms = useCmsStore()
onMounted(() => {
  cms.watchAuth()
  cms.hydrate()
})
onBeforeUnmount(() => cms.unsubscribeAll())
```

### Imagens não aparecem na galeria

`getImg()` lista pelo `pathPrefix` configurado em `storageOptions`. Confira se as imagens foram subidas no path certo (default: `galeria/`).

### Conflito de nome de rota

Você tem uma rota chamada `auth` ou `settings` no projeto e está colidindo com as do CMS. Use `routeNames` para renomear:

```js
cmsAdminRoutes({
  routeNames: { auth: 'admin-login', settings: 'admin-config' }
})
```

---

## Próximos passos

- Leia [`API.md`](./API.md) para a referência completa de exports.
- Para regras de Firestore mais granulares (por coleção, por usuário), veja a [doc oficial Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started).
- Para customizar o `Model.vue` (form universal), copie-o do módulo e mantenha localmente — as chaves de `form.data` controlam quais campos renderizam.
