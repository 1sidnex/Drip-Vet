<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Cadastro de Usuários
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-input
          label="Nome"
          v-model="form.nome"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir o nome!']"
        />

        <q-select
          v-model="form.tipoUsuario"
          :options="optionsUsuarios"
          label="Tipo de usuário"
          option-value="id"
          option-label="name"
          map-options
          emit-value
          :rules="[val => !!val || 'É preciso inserir o tipo de usuário!']"
        />

        <q-input
          label="Email"
          v-model="form.email"
          lazy-rules
          :rules="[val => (val && val.length > 0) || 'É preciso inserir o e-mail!']"
          type="email"
        />

        <q-input
          label="Senha"
          v-model="form.senha"
          lazy-rules
          :rules="[val => (val && val.length >= 6) || 'É preciso inserir um senha de pelo menos 6 caracteres!']"
        />

        <q-btn
          :label="isUpdate ? 'Atualizar' : 'Salvar'"
          color="primary"
          class="full-width"
          rounded
          type="submit"
        />

        <q-btn
          label="Cancelar"
          color="primary"
          class="full-width"
          rounded
          flat
          :to="{ name: 'usuarios'}"
        />

      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

export default defineComponent({
  name: 'PageFormUsuarios',
  setup () {
    const table = 'usuarios'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    // let usuario = {}
    // const optionsUsuarios = ref([])
    // const form = ref({
    //   nome: '',
    //   email: '',
    //   senha: '',
    //   tipoUsuario: ''
    // })
    const form = ref({
      nome: '',
      email: '',
      senha: '',
      tipoUsuario: ''
    })

    onMounted(() => {
      if (isUpdate.value) {
        handleGetUsuarios(isUpdate.value)
      }
    })

    // const handleListTipoUsuarios = async () => {
    //   optionsUsuarios.value = await listPublic('usuarios', usuario.value.id)
    // }

    const handleSubmit = async () => {
      try {
        if (isUpdate.value) {
          await update(table, form.value)
          notifySuccess('Usuário atualizado com sucesso!')
        } else {
          await post(table, form.value)
          notifySuccess('Usuário salvo com sucesso!')
        }
        router.push({ name: 'usuarios' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetUsuarios = async (id) => {
      try {
        const usuarios = await getById(table, id)
        form.value = usuarios
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate
    }
  }
})
</script>
