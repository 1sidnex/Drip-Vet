<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="items"
        :columns="columns"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Campanhas
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-campanha' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemove(props.row)">
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
        :to="{ name: 'form-campanha' }"
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
import { columns } from './table'

export default defineComponent({
  name: 'PageCampanhasList',
  setup () {
    const items = ref([])
    const loading = ref(true)
    const router = useRouter()
    const table = 'campanhas'
    const $q = useQuasar()
    const { list, remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()
    const { user } = useAuthUser()

    const handleList = async () => {
      try {
        loading.value = true
        // Verifica se o usuário está logado antes de buscar
        if (!user.value || !user.value.id) {
          console.warn('Usuário não está logado')
          items.value = []
          loading.value = false
          return
        }
        items.value = await list(table)
        loading.value = false
      } catch (error) {
        notifyError(error.message)
        loading.value = false
      }
    }

    const handleEdit = (item) => {
      router.push({ name: 'form-campanha', params: { id: item.id } })
    }

    const handleRemove = async (item) => {
      try {
        $q.dialog({
          title: 'Confirmação',
          message: `Deseja realmente remover a campanha "${item.nome}"?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(table, item.id)
          notifySuccess('Removido com sucesso!')
          handleList()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleList()
    })

    return {
      columns,
      items,
      loading,
      handleEdit,
      handleRemove
    }
  }
})
</script>