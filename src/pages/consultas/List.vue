// src/pages/consultas/List.vue

<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="consultas"
        :columns="columnsConsultas"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Consultas
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-consulta' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemoveConsulta(props.row)">
              <q-tooltip>
                Remover
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        v-if="$q.platform.is.mobile"
        fab
        icon="mdi-plus"
        color="primary"
        :to="{ name: 'form-consulta' }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import useAuthUser from 'src/composables/UseAuthUser'
import { useRouter } from 'vue-router'
import { columnsConsultas } from './table' // Corrigido aqui

export default defineComponent({
  name: 'PageConsultasList',
  setup () {
    const consultas = ref([]) // Corrigido aqui
    const loading = ref(true)
    const router = useRouter()
    const table = 'consultas'
    const { list, remove } = useApi()
    const { notifyError, notifySuccess, confirmDialog } = useNotify() // Adicionado confirmDialog
    const { user } = useAuthUser()

    const handleListConsultas = async () => { // Corrigido aqui
      try {
        loading.value = true
        // Verifica se o usuário está logado antes de buscar
        if (!user.value || !user.value.id) {
          console.warn('Usuário não está logado')
          consultas.value = []
          loading.value = false
          return
        }
        consultas.value = await list(table)
        loading.value = false
      } catch (error) {
        notifyError(error.message)
        loading.value = false
      }
    }

    const handleEdit = (item) => {
      router.push({ name: 'form-consulta', params: { id: item.id } })
    }

    const handleRemoveConsulta = async (item) => { // Corrigido aqui
      if (await confirmDialog('Confirmação', `Deseja realmente remover a consulta de ${item.pet_nome}?`)) {
        try {
          await remove(table, item.id)
          notifySuccess('Removido com sucesso!')
          handleListConsultas() // Corrigido aqui
        } catch (error) {
          notifyError(error.message)
        }
      }
    }

    onMounted(() => {
      handleListConsultas() // Corrigido aqui
    })

    return {
      columnsConsultas, // Corrigido aqui
      consultas, // Corrigido aqui
      loading,
      handleEdit,
      handleRemoveConsulta // Corrigido aqui
    }
  }
})
</script>