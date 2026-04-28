<template>
  <div v-if="cms.currentUser" class="row justify-center relative-position">
    <div style="width: 80vw; max-width: 1200px">
      <div class="q-my-xl">
        <h1 class="text-center text-weight-bolder" style="width: 80vw; max-width: 500px">
          Configurações
        </h1>
      </div>

      <div class="row items-start justify-around">
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md full-width">
          <q-card flat bordered class="q-pa-md">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6 q-mb-md">Favicon</div>
              <q-btn color="primary" icon="upload" label="upload image" @click="openGallery('favicon')" />
            </div>
            <div class="row items-center q-gutter-md">
              <q-img
                v-if="form.data.favicon"
                :src="form.data.favicon"
                width="64px"
                spinner-color="primary"
                class="rounded-borders"
              />
              <q-card v-else style="width: 64px; height: 64px">
                <div class="flex flex-center bg-grey-3" style="width: 64px; height: 64px">
                  <q-icon size="md" name="image" />
                </div>
              </q-card>
              <q-input v-model="form.data.favicon" outlined type="text" label="URL do favicon" class="col" />
            </div>
          </q-card>

          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 q-mb-md">Meta tags</div>
            <div class="q-gutter-md">
              <q-input v-model="form.data.meta.title" outlined type="text" label="Meta title" />
              <q-input v-model="form.data.meta.description" outlined type="textarea" label="Meta description" />
              <q-input v-model="form.data.meta.ogUrl" outlined type="text" label="og:url" />

              <div class="row items-center q-gutter-md">
                <div class="column col-xs-12 col-md-10">
                  <div class="row items-center q-mb-md">
                    <div class="text-h6 q-mb-md col">Preview</div>
                    <q-btn color="primary" icon="upload" label="upload image" @click="openGallery('ogImage')" />
                  </div>
                  <div class="row items-center q-mb-md">
                    <div class="flex flex-center col-xs-12 col-md-2">
                      <q-img
                        v-if="form.data.meta.ogImage"
                        :src="form.data.meta.ogImage"
                        width="120px"
                        height="120px"
                        class="rounded-borders"
                      />
                      <q-card v-else style="width: 120px; height: 120px">
                        <div class="flex flex-center bg-grey-3" style="width: 120px; height: 120px">
                          Sem imagem
                        </div>
                      </q-card>
                    </div>
                    <div class="col-xs-12 col-md-10">
                      <q-input v-model="form.data.meta.ogImage" outlined type="text" label="og:image" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 q-mb-md">Tags adicionais</div>
            <div v-for="(tag, i) in form.data.tags" :key="i" class="row items-center q-gutter-md q-mb-sm">
              <q-input v-model="tag.label" outlined type="text" label="Tag" class="col-xs-12 col-md-3" />
              <q-input v-model="tag.value" outlined type="textarea" label="Valor" class="col-xs-12 col-md-5" />
              <q-select
                v-model="tag.position"
                outlined
                emit-value
                map-options
                :options="tagPositionOptions"
                label="Inserir em"
                class="col-xs-12 col-md-3"
              />
              <q-btn icon="delete" color="negative" flat round @click="removeTag(i)" />
            </div>
            <q-btn color="primary" flat icon="add" label="Adicionar tag" @click="addTag" />
          </q-card>

          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 q-mb-md">Cores do tema</div>
            <div class="row q-col-gutter-md">
              <div class="col-xs-12 col-md-4">
                <q-input v-model="form.data.colors.primary" outlined type="text" label="Primary">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-color v-model="form.data.colors.primary" format-model="hex" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-xs-12 col-md-4">
                <q-input v-model="form.data.colors.secondary" outlined type="text" label="Secondary">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-color v-model="form.data.colors.secondary" format-model="hex" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-xs-12 col-md-4">
                <q-input v-model="form.data.colors.accent" outlined type="text" label="Accent">
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-color v-model="form.data.colors.accent" format-model="hex" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card>

          <div>
            <q-btn label="Salvar" type="submit" color="primary" />
            <q-btn label="Limpar" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
    </div>

    <DialogImg v-model="galleryOpen" :selected="gallerySelected" @select="onSelectImg" />
  </div>
</template>

<script setup>
/**
 * Página Settings (era admin/Admin.vue no original).
 * Edita o documento `config` da coleção configurada.
 */
import { onMounted, ref, watch } from 'vue'
import DialogImg from '../../components/DialogImg.vue'
import { useCms } from '../../composables/useCms.js'

const cms = useCms()

const tagPositionOptions = [
  { label: '1. No cabeçalho (<head>)', value: 'head' },
  { label: '2. Após a tag de abertura <body>', value: 'body_start' },
  { label: '3. Antes da tag de fechamento </body>', value: 'body_end' }
]

const COLLECTION = 'config'
const form = ref(defaultForm())
const galleryOpen = ref(false)
const galleryTarget = ref(null)
const gallerySelected = ref(null)

function defaultForm() {
  return {
    id: null,
    data: {
      favicon: '',
      meta: { title: '', description: '', ogUrl: '', ogImage: '' },
      tags: [{ label: '', value: '', position: 'head' }],
      colors: { primary: '', secondary: '', accent: '' }
    }
  }
}

function normalizeData(data) {
  return {
    favicon: data?.favicon || '',
    meta: {
      title: data?.meta?.title || '',
      description: data?.meta?.description || '',
      ogUrl: data?.meta?.ogUrl || '',
      ogImage: data?.meta?.ogImage || ''
    },
    tags:
      Array.isArray(data?.tags) && data.tags.length
        ? data.tags.map((t) => ({
            label: t?.label || '',
            value: t?.value || '',
            position: t?.position || 'head'
          }))
        : [{ label: '', value: '', position: 'head' }],
    colors: {
      primary: data?.colors?.primary || '',
      secondary: data?.colors?.secondary || '',
      accent: data?.colors?.accent || ''
    }
  }
}

function addTag() {
  form.value.data.tags.push({ label: '', value: '', position: 'head' })
}

function removeTag(i) {
  if (form.value.data.tags.length === 1) {
    form.value.data.tags[0] = { label: '', value: '', position: 'head' }
    return
  }
  form.value.data.tags.splice(i, 1)
}

function onReset() {
  form.value = defaultForm()
}

function openGallery(target) {
  galleryTarget.value = target
  galleryOpen.value = true
}

function onSelectImg(url) {
  if (galleryTarget.value === 'favicon') form.value.data.favicon = url
  if (galleryTarget.value === 'ogImage') form.value.data.meta.ogImage = url
  galleryOpen.value = false
}

async function onSubmit() {
  const payload = {
    collection: COLLECTION,
    data: form.value.data
  }
  if (form.value.id) {
    payload.id = form.value.id
    await cms.updateDocs(payload)
  } else {
    await cms.saveDoc(payload)
  }
}

function load() {
  if (cms.config) {
    form.value = { id: cms.config.id, data: normalizeData(cms.config.data) }
  } else {
    form.value = defaultForm()
  }
}

onMounted(() => {
  cms.getImg()
  load()
})
watch(() => cms.config, load)
</script>
