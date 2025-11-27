<template>
  <q-page
    class="flex flex-center column"
    style="background-color: #357a44; min-height: 100vh;"
  >
    <div
      class="text-center"
      style="color: white; font-size: 60px; font-weight: bold; margin-bottom: 5px;"
    >
      Drip Vet
    </div>

    <q-card
      class="q-pa-lg"
      style="width: 400px; max-width: 90%; background-color: #1b5e20;"
    >
      <q-card-section>
        <q-form @submit.prevent="doLogin">
          <q-input
            v-model="email"
            label="E-mail"
            type="email"
            outlined
            autocomplete="email"
            class="white-input q-mb-md"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'E-mail é obrigatório']"
          />
          <q-input
            v-model="password"
            label="Senha"
            type="password"
            outlined
            class="white-input q-mb-md"
            autocomplete="current-password"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Senha é obrigatória']"
          />
          <q-btn
            label="Entrar"
            type="submit"
            class="full-width white-btn q-mb-sm"
            :loading="loading"
            unelevated
            style="background-color: #2196F3 !important; color: white !important;"
          />
          <q-btn
            label="Cadastrar"
            color="positive"
            class="full-width"
            flat
            :to="{ name: 'register' }"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="center" v-if="errorMessage">
        <div class="text-negative">{{ errorMessage }}</div>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useAuthUser from 'src/composables/UseAuthUser'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const { login } = useAuthUser()

async function doLogin() {
  loading.value = true
  errorMessage.value = ''
  try {
    await login({ email: email.value, password: password.value })
    router.push({ name: 'home' })
  } catch (error) {
    errorMessage.value = error.message || 'E-mail ou senha inválidos'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.white-input >>> .q-field__control {
  background-color: white !important;
  color: black !important;
}

.white-btn {
  background-color: white !important;
  color: black !important;
  font-weight: bold;
}
</style>