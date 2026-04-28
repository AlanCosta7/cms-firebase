<template>
  <div v-if="form && form.data" class="row justify-center relative-position">
    <div :style="`width: 90vw; max-width: ${size}px`">
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-xs">
        <div class="q-gutter-sm">
          <div v-if="'pag' in form.data">
            <q-input v-model="form.data.pag" outlined type="text" label="Página" />
          </div>

          <div v-if="'img' in form.data">
            <div class="text-h6 q-pa-xs q-my-md rounded-borders">Imagem principal:</div>
            <q-card
              class="my-card bg-grey-1 cursor-pointer"
              @click="openGallery('form', form.data.img)"
              style="width: 300px; height: 300px;"
            >
              <q-img v-if="form.data.img" :src="form.data.img" width="300px" height="300px">
                <div class="absolute-full text-subtitle2 column flex flex-center">
                  <q-icon size="md" name="photo_camera" />
                  <div>Clique para atualizar a imagem</div>
                </div>
              </q-img>
              <q-card v-else flat class="flex flex-center bg-negative text-white" style="width: 300px; height: 300px">
                <div>Clique aqui para adicionar uma imagem</div>
              </q-card>
            </q-card>
          </div>

          <div v-if="'title' in form.data">
            <q-input v-model="form.data.title" outlined type="text" label="Título" />
          </div>
          <div v-if="'show' in form.data">
            <q-toggle v-model="form.data.show" color="green" label="Destaque" />
          </div>
          <div v-if="'btnLabel' in form.data">
            <q-input v-model="form.data.btnLabel" outlined type="text" label="Label do botão" />
          </div>
          <div v-if="'btnLink' in form.data">
            <q-input v-model="form.data.btnLink" outlined type="text" label="Link do Botão" />
          </div>
          <div v-if="'btnColor' in form.data">
            <q-input v-model="form.data.btnColor" outlined type="text" label="Cor do Botão" />
          </div>
          <div v-if="'btnTextColor' in form.data">
            <q-input v-model="form.data.btnTextColor" outlined type="text" label="Cor do texto do Botão" />
          </div>
          <div v-if="'bgColor' in form.data">
            <q-input v-model="form.data.bgColor" outlined type="text" label="Cor do background" />
          </div>
          <div v-if="'invert' in form.data">
            <q-toggle v-model="form.data.invert" color="green" label="Inverter" />
          </div>

          <div v-if="'text' in form.data">
            <q-editor
              v-model="form.data.text"
              placeholder="Descrição"
              toolbar-text-color="white"
              toolbar-toggle-color="yellow-8"
              toolbar-bg="primary"
              :toolbar="editorToolbar"
            />
          </div>

          <div v-if="'btn' in form.data">
            <div class="text-h6 q-pa-xs bg-accent text-white q-my-md rounded-borders">Label do Botão:</div>
            <q-input v-model="form.data.btn" outlined type="text" label="Label do botão" />
          </div>

          <div v-if="'index' in form.data">
            <q-input v-model="form.data.index" outlined type="text" label="Index" />
          </div>
        </div>

        <!-- Lista interna (sub-itens) -->
        <div class="row items-start scroll" v-if="'lista' in form.data">
          <q-list class="col-md-3 col-xs-10 q-pa-md scroll" style="max-height: 1200px;">
            <div
              v-for="(item, i) in sortedLista"
              :key="i"
              class="q-mt-md"
            >
              <q-item
                class="borda bg-grey-3"
                :class="item === selectItem ? 'bordaSecondary' : ''"
                clickable
                v-ripple
                @click="setSelected(item)"
              >
                <div>
                  <q-img
                    v-if="'img' in item"
                    :src="item.img"
                    width="120px"
                    spinner-color="primary"
                    spinner-size="82px"
                  />
                  <div v-if="'title' in item" class="ellipsis text-caption" style="max-width: 120px;">
                    {{ item.index }} - {{ item.title }}
                  </div>
                </div>
              </q-item>
            </div>
            <div class="q-my-md full-width">
              <q-btn
                color="primary"
                class="full-width"
                size="xs"
                label="Adicionar"
                aria-label="Adicionar"
                @click="addItem"
              />
            </div>
          </q-list>

          <div class="col-md-9 col-xs-12 q-gutter-md" v-if="selectItem">
            <div class="row items-start q-gutter-md">
              <div
                v-if="'img' in selectItem"
                class="bg-grey-3 cursor-pointer"
                @click="openGallery('selectItem', selectItem.img)"
              >
                <q-img v-if="selectItem.img" :src="selectItem.img" width="200px" />
                <q-card v-else flat class="flex flex-center bg-negative text-white" style="width: 200px; height: 200px;">
                  <div class="text-center">Clique para adicionar imagem</div>
                </q-card>
              </div>
              <div>
                <q-btn color="primary" icon="clear" label="Remover imagem" @click="selectItem.img = ''" />
              </div>
              <div class="col-md-12 q-gutter-md">
                <q-input v-if="'title' in selectItem" v-model="selectItem.title" outlined type="text" label="Título" />
                <q-editor
                  v-if="'text' in selectItem"
                  v-model="selectItem.text"
                  placeholder="Descrição"
                  toolbar-text-color="white"
                  toolbar-toggle-color="yellow-8"
                  toolbar-bg="primary"
                  :toolbar="editorToolbar"
                />
                <q-input v-if="'btnLabel' in selectItem" v-model="selectItem.btnLabel" outlined type="text" label="Label do botão" />
                <q-input v-if="'btnLink' in selectItem" v-model="selectItem.btnLink" outlined type="text" label="Link do botão" />
                <q-input v-if="'btnColor' in selectItem" v-model="selectItem.btnColor" outlined type="text" label="Cor do botão" />
                <q-input v-if="'btnTextColor' in selectItem" v-model="selectItem.btnTextColor" outlined type="text" label="Cor do texto do botão" />
                <q-input v-if="'bgColor' in selectItem" v-model="selectItem.bgColor" outlined type="text" label="Cor do background" />
                <q-toggle v-if="'invert' in selectItem" v-model="selectItem.invert" color="green" label="Inverter" />
                <q-input v-if="'icon' in selectItem" v-model="selectItem.icon" outlined type="text" label="Icon" />
                <q-input v-if="'rating' in selectItem" v-model="selectItem.rating" outlined type="text" label="Rating" />
                <q-input v-if="'index' in selectItem" v-model="selectItem.index" outlined type="text" label="Ordem" />
              </div>
              <div>
                <q-btn color="negative" label="Excluir item" aria-label="Excluir" @click="removeItem" />
              </div>
            </div>
          </div>
        </div>

        <div class="q-my-xl q-gutter-sm">
          <q-btn label="Salvar"  type="submit" color="primary" />
          <q-btn label="Excluir" color="negative" @click="onDelete" v-if="form.id" />
        </div>
      </q-form>
    </div>
    <DialogImg v-model="galleryOpen" :selected="gallerySelected" @select="onSelectImg" />
  </div>
</template>

<script setup>
/**
 * Form universal — renderiza campos baseado nas chaves presentes em `form.data`.
 *
 * Emite eventos via store (saveDoc/updateDocs/deleteDocs). A coleção alvo é
 * inferida de `form.data.collectionName` ou passada via prop.
 */
import { computed, ref } from 'vue'
import { Dialog } from 'quasar'
import DialogImg from './DialogImg.vue'
import { useCms } from '../composables/useCms.js'

const props = defineProps({
  form: { type: Object, default: null },
  size: { type: [Number, String], default: 1200 },
  collection: { type: String, default: null }
})

const cms = useCms()
const form = computed(() => props.form)
const targetCollection = computed(
  () => props.collection || form.value?.data?.collectionName || 'faixa'
)

const sortedLista = computed(() => {
  if (!form.value?.data?.lista) return []
  return [...form.value.data.lista].sort(
    (a, b) => Number(a.index || 0) - Number(b.index || 0)
  )
})

const selectItem = ref(null)
const galleryOpen = ref(false)
const galleryTarget = ref(null)
const gallerySelected = ref(null)

function setSelected(item) {
  cms.getImg()
  selectItem.value = item
}

function addItem() {
  if (!form.value?.data?.lista) return
  form.value.data.lista.push({
    img: '', title: '', text: '',
    btnLabel: '', btnLink: '', btnColor: '', btnTextColor: '',
    bgColor: '', invert: false, icon: '', rating: '', index: 0
  })
}

function removeItem() {
  if (!selectItem.value || !form.value?.data?.lista) return
  const i = form.value.data.lista.indexOf(selectItem.value)
  if (i >= 0) form.value.data.lista.splice(i, 1)
  selectItem.value = null
}

function openGallery(target, current) {
  galleryTarget.value = target
  gallerySelected.value = current
  galleryOpen.value = true
}

function onSelectImg(url) {
  if (galleryTarget.value === 'form') {
    form.value.data.img = url
  } else if (galleryTarget.value === 'selectItem' && selectItem.value) {
    selectItem.value.img = url
  }
  galleryOpen.value = false
}

async function onSubmit() {
  if (!form.value) return
  if (form.value.id) {
    await cms.updateDocs({
      collection: targetCollection.value,
      data: form.value.data,
      id: form.value.id
    })
  } else {
    await cms.saveDoc({
      collection: targetCollection.value,
      data: form.value.data
    })
  }
}

function onReset() {
  selectItem.value = null
}

function onDelete() {
  if (!form.value?.id) return
  Dialog.create({
    title: 'Confirmação',
    message: 'Tem certeza que deseja excluir este item?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    cms.deleteDocs({ collection: targetCollection.value, id: form.value.id })
  })
}

const editorToolbar = [
  [{ label: 'Alinhamento', icon: 'format_align_left', list: 'only-icons',
     options: ['left', 'center', 'right', 'justify'] }],
  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
  ['hr', 'link'],
  [{ label: 'Formatting', icon: 'format_size', list: 'no-icons',
     options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'] }],
  ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
  ['removeFormat', 'viewsource']
]
</script>

<style scoped>
.bordaSecondary { border: solid 3px #1d79f2; }
</style>
