// src/pages/tutor/List.vue

<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="filteredTutores"
        :columns="columnsTutor"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6"> Tutores </span>
          <q-space />
          <q-input
            v-model="filter"
            placeholder="Buscar tutor..."
            dense
            outlined
            clearable
            class="q-mr-md"
            style="min-width: 250px"
            @update:model-value="applyFilter"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-tutor' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn
              icon="mdi-pencil-outline"
              color="info"
              dense
              size="sm"
              @click="handleEdit(props.row)"
            >
              <q-tooltip> Editar </q-tooltip>
            </q-btn>
            <q-btn
              icon="mdi-delete-outline"
              color="negative"
              dense
              size="sm"
              @click="handleRemoveTutor(props.row)"
            >
              <q-tooltip> Remover </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        v-if="$q.platform.is.mobile"
        fab
        icon="mdi-plus"
        color="primary"
        :to="{ name: 'form-tutor' }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import { useRouter } from 'vue-router'
import { columnsTutor } from './table'

export default defineComponent({
  name: 'PageTutorList',
  setup() {
    const tutores = ref([])
    const filteredTutores = ref([])
    const loading = ref(true)
    const filter = ref('')
    const router = useRouter()
    const table = 'tutores'

    const { list, remove } = useApi()
    const { notifyError, notifySuccess, confirmDialog } = useNotify()

    const handleListTutor = async () => {
      try {
        loading.value = true
        tutores.value = await list(table)
        filteredTutores.value = tutores.value
        loading.value = false
      } catch (error) {
        notifyError(error.message)
      }
    }

    // Filtro em tempo real
    const applyFilter = () => {
      if (!filter.value || filter.value.trim() === '') {
        filteredTutores.value = tutores.value
        return
      }

      const searchTerm = filter.value.toLowerCase().trim()
      filteredTutores.value = tutores.value.filter((tutor) => {
        return (
          (tutor.nome && tutor.nome.toLowerCase().includes(searchTerm)) ||
          (tutor.cpf && tutor.cpf.toLowerCase().includes(searchTerm)) ||
          (tutor.email && tutor.email.toLowerCase().includes(searchTerm)) ||
          (tutor.whatsapp && tutor.whatsapp.toLowerCase().includes(searchTerm))
        )
      })
    }

    // Observa mudanças no filtro
    watch(filter, () => {
      applyFilter()
    })

    const handleEdit = (tutor) => {
      router.push({ name: 'form-tutor', params: { id: tutor.id } })
    }

    const handleRemoveTutor = async (tutor) => {
      try {
        const confirmed = await confirmDialog(
          'Confirmação',
          `Deseja realmente remover ${tutor.nome} ?`,
        )

        if (confirmed) {
          await remove(table, tutor.id)
          notifySuccess('Tutor removido com sucesso!')
          handleListTutor()
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListTutor()
    })

    return {
      columnsTutor,
      tutores,
      filteredTutores,
      loading,
      filter,
      handleEdit,
      handleRemoveTutor,
      applyFilter,
    }
  },
})
</script>
