<template>
  <div v-if="cms.currentUser" class="row justify-center relative-position">
    <div style="width: 80vw; max-width: 1200px">
      <div class="q-my-xl">
        <h1 class="text-center text-weight-bolder" style="width: 80vw; max-width: 400px">
          Footer
        </h1>
      </div>

      <div class="row items-start justify-around">
        <q-form @submit="onSubmit" v-if="form && form.data" class="q-gutter-md full-width">
          <q-input v-if="'email' in form.data"     v-model="form.data.email"     outlined type="text" label="Email" />
          <q-input v-if="'tel' in form.data"       v-model="form.data.tel"       outlined type="text" label="Telefone" />
          <q-input v-if="'facebook' in form.data"  v-model="form.data.facebook"  outlined type="text" label="Facebook" />
          <q-input v-if="'instagram' in form.data" v-model="form.data.instagram" outlined type="text" label="Instagram" />
          <q-input v-if="'whatsapp' in form.data"  v-model="form.data.whatsapp"  outlined type="text" label="WhatsApp" />
          <q-input v-if="'linkedin' in form.data"  v-model="form.data.linkedin"  outlined type="text" label="Linkedin" />

          <div v-if="'endereco' in form.data">
            <q-editor
              v-model="form.data.endereco"
              placeholder="Endereço"
              toolbar-text-color="white"
              toolbar-toggle-color="yellow-8"
              toolbar-bg="primary"
            />
          </div>

          <div>
            <q-btn label="Salvar" type="submit" color="primary" />
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Editor do footer (singleton). Lê e escreve no doc único da coleção `footer`.
 */
import { ref, watch } from 'vue'
import { useCms } from '../../composables/useCms.js'

const cms = useCms()
const form = ref(defaultForm())

function defaultForm() {
  return {
    id: null,
    data: {
      label: 'Footer',
      collectionName: 'footer',
      email: '',
      tel: '',
      facebook: '',
      instagram: '',
      whatsapp: '',
      linkedin: '',
      endereco: ''
    }
  }
}

watch(
  () => cms.footer,
  (newDoc) => {
    if (newDoc?.data) {
      form.value = {
        id: newDoc.id,
        data: { ...defaultForm().data, ...newDoc.data }
      }
    } else {
      form.value = defaultForm()
    }
  },
  { immediate: true }
)

async function onSubmit() {
  if (form.value.id) {
    await cms.updateDocs({ collection: 'footer', data: form.value.data, id: form.value.id })
  } else {
    await cms.saveDoc({ collection: 'footer', data: form.value.data })
  }
}
</script>
