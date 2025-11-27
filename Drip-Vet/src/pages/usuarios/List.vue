<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="usuario"
        :columns="columnsUsuarios"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Usuários
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-usuarios' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemoveUsuarios(props.row)">
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
        :to="{ name: 'form-usuarios' }"
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
import { columnsUsuarios } from './table'

export default defineComponent({
  name: 'PageUsuariosList',
  setup () {
    const usuario = ref([])
    const loading = ref(true)
    const router = useRouter()
    const $q = useQuasar()
    const { user } = useAuthUser()
    const table = 'usuarios'

    const { list, remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const handleListUsuarios = async () => {
      try {
        loading.value = true
        // Verifica se o usuário está logado antes de buscar
        if (!user.value || !user.value.id) {
          console.warn('Usuário não está logado')
          usuario.value = []
          loading.value = false
          return
        }
        usuario.value = await list(table)
        loading.value = false
      } catch (error) {
        notifyError(error.message)
        loading.value = false
      }
    }

    const handleEdit = (usuarios) => {
      router.push({ name: 'form-usuarios', params: { id: usuarios.id } })
    }

    const handleRemoveUsuarios = async (usuarios) => {
      try {
        $q.dialog({
          title: 'Confirmar',
          message: `Deseja realmente remover ${usuarios.name} ?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(table, usuarios.id)
          notifySuccess('Usuário removido com sucesso!')
          handleListUsuarios()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListUsuarios()
    })

    return {
      columnsUsuarios,
      usuario,
      loading,
      handleEdit,
      handleRemoveUsuarios
    }
  }
})
</script>
