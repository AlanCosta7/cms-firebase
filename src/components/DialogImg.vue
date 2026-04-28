<template>
  <q-dialog v-model="visible" persistent maximized>
    <q-card>
      <q-toolbar class="bg-black text-white">
        <q-toolbar-title>Imagens</q-toolbar-title>
        <q-space />
        <div class="q-pt-md">
          <q-file
            outlined
            v-model="files"
            style="width: 300px"
            color="black"
            bg-color="white"
            bottom-slots
            dense
            label="Upload de imagem"
            multiple
            accept=".jpg, .png, image/*"
            @rejected="onRejected"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" color="accent" aria-label="Upload" />
            </template>
            <template v-slot:after>
              <q-btn
                round
                dense
                flat
                :disable="!files"
                aria-label="Enviar"
                color="white"
                icon="send"
                @click="send()"
              />
            </template>
          </q-file>
        </div>
        <q-space />
        <div>
          <q-btn flat round dense aria-label="Fechar" icon="close" @click="fechar" />
        </div>
      </q-toolbar>

      <q-card-section class="row items-center">
        <q-list class="row items-center">
          <q-item
            v-for="(item, i) in lista"
            :key="i"
            clickable
            v-ripple
            class="q-pa-md q-ma-md"
            :class="isSelected(item) ? 'border' : 'borderSecondary'"
            @click="select(item)"
          >
            <q-item-section avatar>
              <div class="absolute-top-right z-top q-ma-xs">
                <q-btn
                  color="negative"
                  aria-label="Deletar imagem"
                  icon="close"
                  size="xs"
                  round
                  @click.stop="confirmDelete(item)"
                />
              </div>
              <q-img
                :src="item"
                width="100px"
                spinner-color="primary"
                spinner-size="40px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
/**
 * Galeria de imagens. Equivalente ao dialogImg.vue original, com:
 *  - v-model em vez de prop+emit duplo
 *  - store via useCms (não importa globalStore direto)
 */
import { ref, computed } from 'vue'
import { Notify, Dialog } from 'quasar'
import { useCms } from '../composables/useCms.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selected:   { type: String, default: null }
})
const emit = defineEmits(['update:modelValue', 'select'])

const cms = useCms()
const lista = computed(() => cms.listaGaleria || [])
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const files = ref(null)

function fechar() {
  emit('update:modelValue', false)
}

function isSelected(item) {
  return item === props.selected
}

function select(item) {
  emit('select', item)
}

function onRejected(rejectedEntries) {
  Notify.create({
    type: 'negative',
    message: `${rejectedEntries.length} arquivo(s) não passou(m) nas restrições de validação`,
    timeout: 2000
  })
}

async function send() {
  if (!files.value) return
  for (const file of files.value) {
    await cms.uploadPhotoURL({ file })
  }
  files.value = null
}

function confirmDelete(item) {
  Dialog.create({
    title: 'Excluir',
    message: 'Tem certeza que deseja excluir essa imagem?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await cms.deletImg(item)
    await cms.getImg()
  })
}
</script>

<style scoped>
.border          { border: solid 5px #21BA45; }
.borderSecondary { border: solid 1px #bebebe; }
</style>
