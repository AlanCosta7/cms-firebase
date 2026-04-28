/**
 * @file Helper de rotas admin para o consumidor injetar no router.
 *
 * Decisões:
 *  - Nomes de rota são namespaced por padrão (`cms-auth`, `cms-faixa`...) para
 *    evitar colisão com rotas do app consumidor. Customizável via `routeNames`.
 *  - `include`/`exclude` permitem desativar páginas que o cliente não usa.
 *  - `extra` adiciona rotas filhas customizadas (ex: produtos do cliente).
 */

import AdminLayout from './layouts/AdminLayout.vue'
import Auth from './pages/admin/Auth.vue'
import Settings from './pages/admin/Settings.vue'
import Pages from './pages/admin/Pages.vue'
import Faixa from './pages/admin/Faixa.vue'
import Footer from './pages/admin/Footer.vue'

/**
 * Página built-in do módulo. Use estas chaves em `include`/`exclude`/`routeNames`.
 * @typedef {'auth'|'settings'|'pages'|'faixa'|'footer'} CmsAdminPage
 */

/**
 * @typedef {object} CmsAdminRoutesOptions
 * @property {string} [prefix='/admin']
 * @property {object} [layout]
 * @property {object} [layoutProps]
 * @property {Array<object>} [extra]              - rotas filhas adicionais
 * @property {CmsAdminPage[]} [include]           - whitelist de páginas (default: todas)
 * @property {CmsAdminPage[]} [exclude]           - blacklist (default: nenhuma)
 * @property {Partial<Record<CmsAdminPage, string>>} [routeNames] - rename de nomes
 */

const DEFAULTS = {
  prefix: '/admin',
  routeNames: {
    auth:     'cms-auth',
    settings: 'cms-settings',
    pages:    'cms-pages',
    faixa:    'cms-faixa',
    footer:   'cms-footer'
  }
}

const ALL_PAGES = ['auth', 'settings', 'pages', 'faixa', 'footer']

function buildPages(prefix, names) {
  return {
    auth:     { path: '',                  name: names.auth,     component: Auth },
    settings: { path: `${prefix}/settings`, name: names.settings, component: Settings },
    pages:    { path: `${prefix}/pages`,    name: names.pages,    component: Pages },
    faixa:    { path: `${prefix}/faixa`,    name: names.faixa,    component: Faixa },
    footer:   { path: `${prefix}/footer`,   name: names.footer,   component: Footer }
  }
}

/**
 * @param {CmsAdminRoutesOptions} [options]
 */
export function cmsAdminRoutes(options = {}) {
  const {
    prefix = DEFAULTS.prefix,
    layout = AdminLayout,
    layoutProps = null,
    extra = [],
    include,
    exclude = []
  } = options

  const names = { ...DEFAULTS.routeNames, ...(options.routeNames || {}) }
  const builtIn = buildPages(prefix, names)

  const wanted = (include && include.length ? include : ALL_PAGES)
    .filter((p) => !exclude.includes(p))
    .map((p) => builtIn[p])
    .filter(Boolean)

  return {
    path: prefix,
    component: layout,
    props: layoutProps ? () => layoutProps : undefined,
    children: [...wanted, ...extra]
  }
}

// Exports adicionais para clientes que prefiram montar rotas próprias
export { AdminLayout, Auth, Settings, Pages, Faixa, Footer }
