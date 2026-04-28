<template>
  <section>
    <q-toolbar class="bg-grey q-pa-md text-primary">
      <q-select
        v-model="pageSelect"
        :options="pageOptions"
        class="bg-white"
        style="width: 200px;"
        label="Pages"
        filled
      />
      <q-space />
      <div class="row items-center q-gutter-md">
        <q-input v-model="newFaixa" type="text" class="bg-white" filled label="Label da Faixa" />
        <q-btn label="New faixa" color="primary" icon="add" :disable="!pageSelect" @click="newFaixaPage" />
      </div>
    </q-toolbar>

    <q-tabs v-model="tab" class="text-primary">
      <q-tab v-for="(item, i) in listaTab" :key="i" :name="item" :label="item" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel v-for="(item, i) in listaTab" :key="i" :name="item">
        <div class="row justify-around">
          <div class="col-xs-10 col-md-2">
            <q-list class="column" v-if="faixaList.length">
              <q-item
                v-for="(opc, o) in faixaList"
                :key="o"
                clickable
                v-ripple
                @click="onPick(opc)"
              >
                <q-item-section avatar v-if="opc?.data && 'img' in opc.data">
                  <q-img
                    v-if="opc.data.img"
                    :src="opc.data.img"
                    width="150px"
                  />
                  <q-card v-else class="bg-grey" style="width: 150px; height: 150px;" />
                </q-item-section>
                <q-item-section v-else-if="opc?.data && 'label' in opc.data">
                  <div class="ellipsis" style="max-width: 150px;">{{ opc.data.label }}</div>
                </q-item-section>
              </q-item>
            </q-list>
            <div>
              <q-btn :disable="!selectItem" color="primary" icon="add" label="Adicionar item" @click="addItem" />
            </div>
          </div>
          <div class="col-xs-10 col-md-8">
            <Model v-if="selectItem" :form="selectItem" :size="600" collection="faixa" />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </section>
</template>

<script setup>
/**
 * Editor de faixas. Lê páginas e faixas hidratadas no store
 * e cria novas faixas vinculadas à página selecionada.
 */
import { computed, ref, watch } from 'vue'
import Model from '../../components/Model.vue'
import { useCms } from '../../composables/useCms.js'

const cms = useCms()

const tab = ref(null)
const newFaixa = ref('')
const pageSelect = ref(null)
const selectItem = ref(null)

const pageOptions = computed(() =>
  (cms.pages || []).map((p) => ({ value: p.id, label: p.data?.title || '(sem título)' }))
)

const faixasDaPagina = computed(() => {
  if (!pageSelect.value) return []
  return (cms.faixa || []).filter((f) => f.data?.pagId === pageSelect.value.value)
})

const faixaList = computed(() =>
  tab.value ? faixasDaPagina.value.filter((f) => f.data?.label === tab.value) : []
)

const listaTab = computed(() => {
  const labels = faixasDaPagina.value.map((f) => f.data?.label).filter(Boolean)
  return [...new Set(labels)]
})

function onPick(item) {
  cms.getImg()
  selectItem.value = item
}

async function addItem() {
  if (!selectItem.value) return
  await cms.saveDoc({ collection: 'faixa', data: selectItem.value.data })
}

async function newFaixaPage() {
  const novo = {
    pagId: pageSelect.value.value,
    pagLabel: pageSelect.value.label,
    label: newFaixa.value,
    img: null,
    title: '',
    text: '',
    show: false,
    btnLabel: '', btnLink: '', btnColor: '', btnTextColor: '',
    bgColor: '', invert: false,
    lista: []
  }
  await cms.saveDoc({ collection: 'faixa', data: novo })
  newFaixa.value = ''
}

watch(pageSelect, () => { tab.value = null; selectItem.value = null })
watch(listaTab, (tabs) => {
  if (!tab.value && tabs?.length) tab.value = tabs[0]
})
</script>
