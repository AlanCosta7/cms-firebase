<template>
  <div class="row justify-center" style="height: 90vh">
    <div class="col-lg-6 col-sm-6 flex flex-center">
      <div>
        <div class="row justify-center">
          <h5 class="text-uppercase text-center text-weight-bolder">Login</h5>
        </div>
        <q-form @submit="onSubmit" class="full-width">
          <div class="row justify-center q-gutter-md">
            <q-input
              class="q-px-md"
              style="width: 80%; max-width: 600px"
              outlined
              rounded
              color="primary"
              v-model="email"
              type="text"
              label="Email"
            />
            <q-input
              class="q-px-md"
              style="width: 80%; max-width: 600px"
              outlined
              rounded
              color="primary"
              v-model="password"
              type="password"
              label="Senha"
            />
            <q-btn
              class="text-white q-px-md"
              style="width: 70%; max-width: 550px"
              rounded
              aria-label="Entrar"
              label="Entrar"
              type="submit"
              color="positive"
            />
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Loading } from 'quasar'
import { useRouter } from 'vue-router'
import { useCms } from '../../composables/useCms.js'

const props = defineProps({
  redirectRouteName: { type: String, default: 'cms-faixa' }
})

const cms = useCms()
const router = useRouter()
const email = ref('')
const password = ref('')

async function onSubmit() {
  Loading.show({ message: '<h3>Carregando...</h3>', html: true })
  const user = await cms.signIn({ email: email.value, password: password.value })
  Loading.hide()
  if (user) router.push({ name: props.redirectRouteName })
}
</script>
