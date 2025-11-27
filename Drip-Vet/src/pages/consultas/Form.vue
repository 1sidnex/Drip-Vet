<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Formulário de Consulta
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">

        <q-input
          label="Nome do Pet"
          v-model="form.pet_nome"
          :rules="[val => (val && val.length > 0) || 'Campo obrigatório']"
        />

        <q-input
          label="Motivo da Consulta"
          v-model="form.motivo"
          :rules="[val => (val && val.length > 0) || 'Campo obrigatório']"
        />

         <q-editor
          label="Observações"
          v-model="form.observacoes"
          min-height="5rem"
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
          :to="{ name: 'consultas'}"
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
  name: 'PageFormConsulta',
  setup () {
    const table = 'consultas'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    const form = ref({
      pet_nome: '',
      motivo: '',
      observacoes: ''
    })

    onMounted(() => {
      if (isUpdate.value) {
        handleGet(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        if (isUpdate.value) {
          await update(table, form.value)
          notifySuccess('Atualizado com sucesso!')
        } else {
          await post(table, form.value)
          notifySuccess('Salvo com sucesso!')
        }
        router.push({ name: 'consultas' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGet = async (id) => {
      try {
        form.value = await getById(table, id)
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