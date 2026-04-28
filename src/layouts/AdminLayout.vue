<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar :class="headerClass">
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn
          v-if="currentUser"
          aria-label="Sair"
          color="white"
          text-color="black"
          icon="logout"
          label="Sair"
          @click="onLogout"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-drawer
      v-if="currentUser"
      v-model="drawer"
      show-if-above
      :width="drawerWidth"
      :breakpoint="500"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <div :style="{ marginTop: logoSrc ? '150px' : '24px' }">
        <q-list padding>
          <q-item
            v-for="(item, i) in menu"
            :key="i"
            clickable
            v-ripple
            @click="onNav(item)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" :aria-label="item.label" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>
      </div>

      <div
        v-if="logoSrc"
        class="absolute-top flex flex-center"
        style="height: 150px"
      >
        <q-img
          :src="logoSrc"
          width="160px"
          spinner-color="primary"
          spinner-size="82px"
        />
      </div>
    </q-drawer>
  </q-layout>
</template>

<script setup>
/**
 * Layout shell do CMS, totalmente configurável via props.
 *
 * Diferenças do AdminLayout original:
 *  - Logo, menu, título e classes de cor vêm por prop (não há mais
 *    `global.config.data.favicon` hardcoded — quem quiser vincula via prop).
 *  - signOut/redirect ao auth não usam setTimeout artificiais.
 *  - Funciona com qualquer store que siga o contrato de `createCmsStore`
 *    (currentUser, watchAuth, hydrate, signOut).
 */
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from 'quasar'
import { useCms } from '../composables/useCms.js'

const props = defineProps({
  title: { type: String, default: 'Painel do administrador' },
  logo: { type: String, default: '' },              // URL fixa
  logoFromConfig: { type: String, default: '' },    // chave em store.config.data
  menu: {
    type: Array,
    default: () => [
      { label: 'Settings', link: 'cms-settings', icon: 'sym_o_settings' },
      { label: 'Pages',    link: 'cms-pages',    icon: 'sym_o_tabs' },
      { label: 'Faixas',   link: 'cms-faixa',    icon: 'sym_o_dashboard' },
      { label: 'Footer',   link: 'cms-footer',   icon: 'sym_o_bottom_navigation' }
    ]
  },
  authRouteName:    { type: String, default: 'cms-auth' },
  defaultRouteName: { type: String, default: 'cms-faixa' },
  headerClass:      { type: String, default: 'bg-black' },
  drawerWidth:      { type: Number, default: 200 }
})

const router = useRouter()
const cms = useCms()
const drawer = ref(true)

const currentUser = computed(() => cms.currentUser)

const logoSrc = computed(() => {
  if (props.logo) return props.logo
  if (props.logoFromConfig) {
    return cms.config?.data?.[props.logoFromConfig] || ''
  }
  return ''
})

let unsubAuth = null

function onNav(item) {
  router.push({ name: item.link })
}

async function onLogout() {
  const ok = await cms.signOut()
  if (ok) router.push({ name: props.authRouteName })
}

watch(currentUser, (user) => {
  if (!user) {
    router.push({ name: props.authRouteName })
  }
})

onMounted(async () => {
  Loading.show({ message: '<h3>Carregando...</h3>', html: true })
  unsubAuth = cms.watchAuth()
  if (typeof cms.hydrate === 'function') cms.hydrate()
  Loading.hide()

  if (!currentUser.value) {
    router.push({ name: props.authRouteName })
  }
})

onBeforeUnmount(() => {
  if (typeof unsubAuth === 'function') unsubAuth()
  if (typeof cms.unsubscribeAll === 'function') cms.unsubscribeAll()
})
</script>
