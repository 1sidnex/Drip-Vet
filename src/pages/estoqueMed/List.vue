<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="estoque_medicamentos"
        :columns="columns_estoqueMed"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Estoque de Medicamentos
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-estoqueMed' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemoveEstoqueMed(props.row)">
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
        :to="{ name: 'form-estoqueMed' }"
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
import { useQuasar } from 'quasar'
import { columns_estoqueMed } from './table'

export default defineComponent({
  name: 'PageEstoqueMedList', 
  setup () {
    const estoque_medicamentos = ref([])
    const loading = ref(true)
    const router = useRouter()
    const $q = useQuasar()
    const { user } = useAuthUser()
    const table = 'estoqueMedicamentos'

    const { list, remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const handleListEstoqueMed = async () => {
      try {
        loading.value = true
        estoque_medicamentos.value = await list(table, user.value.id)
        loading.value = false
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleEdit = (estoqueMedicamentos) => {
      router.push({ name: 'form-estoqueMed', params: { id: estoqueMedicamentos.id } })
    }

    const handleRemoveEstoqueMed = async (estoqueMedicamentos) => {
      try {
        $q.dialog({
          title: 'Confirmar',
          message: `Deseja realmente remover ${estoqueMedicamentos.nome} ?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(table, estoqueMedicamentos.id)
          notifySuccess('Medicamento removido com sucesso!')
          handleListEstoqueMed()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListEstoqueMed()
    })

    return {
      columns_estoqueMed,
      estoque_medicamentos,
      loading,
      handleEdit,
      handleRemoveEstoqueMed
    }
  }
})
</script>
