<template>
  <q-page padding class="flex flex-center" style="background-color: #357a44; min-height: 100vh;">
    <q-card class="q-pa-lg" style="width: 400px; max-width: 90%; background-color: #f5f5f5;">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md text-primary" style="font-weight: bold;">
          Criar Conta
        </div>
        <q-form @submit.prevent="handleRegister" class="q-gutter-md">
          <q-input
            label="Nome Completo"
            v-model="form.nome"
            outlined
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Nome é obrigatório']"
          />

          <q-input
            label="E-mail"
            v-model="form.email"
            type="email"
            outlined
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'E-mail é obrigatório', val => /.+@.+\..+/.test(val) || 'E-mail inválido']"
          />

          <q-input
            label="Telefone"
            v-model="form.telefone"
            mask="(##) #####-####"
            fill-mask
            outlined
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Telefone é obrigatório']"
          />

          <q-input
            label="Senha"
            v-model="form.password"
            type="password"
            outlined
            hint="Entre 6 e 20 caracteres"
            lazy-rules
            :rules="[
              val => (val && val.length >= 6 && val.length <= 20) || 'A senha deve ter entre 6 e 20 caracteres'
            ]"
          />

          <div class="q-pt-md">
            <q-btn
              label="Confirmar Cadastro"
              color="primary"
              class="full-width"
              unelevated
              rounded
              type="submit"
              :loading="loading"
            />
            <q-btn
              label="Voltar ao Login"
              color="dark"
              flat
              rounded
              class="full-width q-mt-sm"
              :to="{ name: 'login' }"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import useAuthUser from 'src/composables/UseAuthUser'
import useNotify from 'src/composables/UseNotify'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'PageRegister',

  setup () {
    const router = useRouter()
    const { register } = useAuthUser()
    const { notifyError, notifySuccess } = useNotify()
    const loading = ref(false)

    const form = ref({
      nome: '',
      email: '',
      password: '',
      telefone: ''
    })

    const handleRegister = async () => {
      loading.value = true
      try {
        // Passamos os dados adicionais (nome, telefone) para a função register
        await register(form.value)
        notifySuccess('Cadastro realizado com sucesso! Faça login.')
        router.push({ name: 'login' })
      } catch (error) {
        notifyError(error.message || 'Erro ao realizar cadastro.')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      handleRegister
    }
  }
})
</script>