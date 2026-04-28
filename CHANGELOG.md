# Changelog

Todas as mudanças notáveis seguem [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e [SemVer](https://semver.org/lang/pt-BR/).

## [0.2.0] — 2026-04-27

### Adicionado
- `docs/USAGE.md`: guia completo de uso em novos projetos.
- `docs/API.md`: referência de todos os exports.
- `cmsAdminRoutes()`: opção `routeNames` para customizar nomes de rotas (evita colisão).
- `cmsAdminRoutes()`: opção `include` / `exclude` para filtrar páginas admin.
- `package.json`: `sideEffects`, `engines.node`, `peerDependenciesMeta`, `keywords`.
- `CHANGELOG.md`.

### Mudado (breaking)
- **CRUD:** `saveDoc`, `updateDocs`, `deleteDocs` agora retornam `{ ok, value?, error? }` consistentemente em vez de tipos mistos. Migração:
  - Antes: `const r = await cms.saveDoc(p); if (r?.error) {...}`
  - Depois: `const r = await cms.saveDoc(p); if (!r.ok) {...}`
- `createCmsStore`: refatorado para Pinia setup syntax. Métodos privados `_crud/_auth/_storage` removidos da API pública.

### Corrigido
- `initFirebase`: avisa via `console.warn` se chamado novamente com config diferente, em vez de retornar silenciosamente a primeira instância.
- Removidos `console.log` de debug.

## [0.1.0] — 2026-04-27

### Adicionado
- Scaffold inicial do pacote.
- `initFirebase`: inicialização parametrizada (sem `process.env`).
- `useCrud`: saveDoc, updateDocs, deleteDocs, fetchCollection, subscribeCollection.
- `useAuth`: signIn, signOut (com confirm injetável), watchAuth, formatUser.
- `useStorage`: uploadFile, listFiles, deleteFile.
- `createCmsStore`: factory Pinia com `collections` configuráveis.
- `AdminLayout`: layout do CMS com props (logo, menu, título, cores).
- `cmsAdminRoutes`: helper para injetar rotas admin no router do consumidor.
- Páginas admin: Auth, Settings, Pages, Faixa, Footer.
- Componentes reutilizáveis: Model, DialogImg.
