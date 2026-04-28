<template>
  <div v-if="cms.currentUser" class="row justify-center relative-position">
    <div style="width: 80vw; max-width: 1200px">
      <div class="q-my-xl">
        <h1 class="text-center text-weight-bolder" style="width: 80vw; max-width: 500px">
          Páginas
        </h1>
      </div>

      <div class="row items-start justify-around q-col-gutter-lg">
        <div class="col-xs-12 col-md-4">
          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 q-mb-md">Páginas salvas</div>
            <q-list bordered separator>
              <q-item
                v-for="item in pages"
                :key="item.id"
                clickable
                v-ripple
                @click="selectPage(item)"
                :class="selectedPage && selectedPage.id === item.id ? 'bg-secondary text-white' : ''"
              >
                <q-item-section>
                  <q-item-label>{{ item.data.title || 'Sem título' }}</q-item-label>
                  <q-item-label caption>{{ item.data.slug || 'Sem slug' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="!pages.length">
                <q-item-section>
                  <q-item-label caption>Nenhuma página cadastrada</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md col-xs-12 col-md-7">
          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 q-mb-md">Dados da página</div>
            <q-input v-model="form.title" outlined type="text" label="Título da página" />
            <q-input v-model="form.slug" outlined type="text" label="Slug" />
          </q-card>
          <div>
            <q-btn label="Salvar" type="submit" color="primary" />
            <q-btn label="Limpar" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Página de gerenciamento de páginas (era admin/NewPag.vue no original).
 * Lê em tempo real de cms.pages (hidratado pelo store) e edita títulos/slugs.
 */
import { computed, ref } from 'vue'
import { useCms } from '../../composables/useCms.js'

const cms = useCms()

const form = ref(defaultForm())
const selectedPage = ref(null)

const pages = computed(() => cms.pages || [])

function defaultForm() {
  return { id: null, title: '', slug: '' }
}

function onReset() {
  form.value = defaultForm()
  selectedPage.value = null
}

async function onSubmit() {
  const payload = {
    collection: 'pages',
    data: { title: form.value.title, slug: form.value.slug }
  }
  if (form.value.id) {
    payload.id = form.value.id
    await cms.updateDocs(payload)
  } else {
    await cms.saveDoc(payload)
  }
}

function selectPage(item) {
  selectedPage.value = item
  form.value = {
    id: item.id,
    title: item.data?.title || '',
    slug: item.data?.slug || ''
  }
}
</script>
