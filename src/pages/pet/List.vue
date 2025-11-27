<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="filteredPets"
        :columns="columnsPets"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6"> Pets </span>
          <q-space />
          <q-input
            v-model="filter"
            placeholder="Buscar pet ou tutor..."
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
            :to="{ name: 'form-pet' }"
          />
        </template>
        <template v-slot:body-cell-tutor="props">
          <q-td :props="props">
            {{ props.row.nomeTutor || props.row.tutor || '-' }}
          </q-td>
        </template>
        <template v-slot:body-cell-idade="props">
          <q-td :props="props">
            {{ formatarIdade(props.row.idade) }}
          </q-td>
        </template>
        <template v-slot:body-cell-imgUrl="props">
          <q-td :props="props">
            <q-avatar v-if="props.row.imgUrl">
              <img :src="props.row.imgUrl" />
            </q-avatar>
            <q-avatar v-else color="grey" text-color="white" icon="mdi-image-off" />
          </q-td>
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
              @click="handleRemovePets(props.row)"
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
        :to="{ name: 'form-pet' }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'
import { columnsPets } from './table'

export default defineComponent({
  name: 'PagePetsList',
  setup() {
    const pet = ref([])
    const filteredPets = ref([])
    const loading = ref(true)
    const filter = ref('')
    const router = useRouter()
    const table = 'pets'
    const $q = useQuasar()

    const { list, remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const formatarIdade = (idadeEmMeses) => {
      if (!idadeEmMeses && idadeEmMeses !== 0) {
        return '-'
      }

      const meses = parseInt(idadeEmMeses)
      if (meses === 0) {
        return '0 meses'
      }

      const anos = Math.floor(meses / 12)
      const mesesRestantes = meses % 12

      if (anos === 0 && mesesRestantes === 0) {
        return '0 meses'
      } else if (anos === 0) {
        return mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`
      } else if (mesesRestantes === 0) {
        return anos === 1 ? '1 ano' : `${anos} anos`
      } else {
        const anosTexto = anos === 1 ? '1 ano' : `${anos} anos`
        const mesesTexto = mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`
        return `${anosTexto} e ${mesesTexto}`
      }
    }

    const handleListPets = async () => {
      try {
        loading.value = true
        const petsData = await list(table)

        // Busca os nomes dos tutores para cada pet
        const petsFormatados = await Promise.all(
          (petsData || []).map(async (petItem) => {
            let nomeTutor = '-'

            // Busca nome do tutor
            if (petItem.tutor) {
              try {
                const { data: tutor } = await supabase
                  .from('tutores')
                  .select('nome')
                  .eq('id', petItem.tutor)
                  .single()

                if (tutor) {
                  nomeTutor = tutor.nome
                }
              } catch (err) {
                console.warn('Erro ao buscar tutor:', err)
              }
            }

            return {
              ...petItem,
              nomeTutor,
            }
          }),
        )

        pet.value = petsFormatados
        filteredPets.value = petsFormatados
        loading.value = false
      } catch (error) {
        notifyError(error.message)
        loading.value = false
      }
    }

    // Filtro em tempo real
    const applyFilter = () => {
      if (!filter.value || filter.value.trim() === '') {
        filteredPets.value = pet.value
        return
      }

      const searchTerm = filter.value.toLowerCase().trim()
      filteredPets.value = pet.value.filter((petItem) => {
        return (
          (petItem.nome && petItem.nome.toLowerCase().includes(searchTerm)) ||
          (petItem.nomeTutor && petItem.nomeTutor.toLowerCase().includes(searchTerm)) ||
          (petItem.raca && petItem.raca.toLowerCase().includes(searchTerm))
        )
      })
    }

    // Observa mudanças no filtro
    watch(filter, () => {
      applyFilter()
    })

    const handleEdit = (pet) => {
      router.push({ name: 'form-pet', params: { id: pet.id } })
    }

    const handleRemovePets = async (pets) => {
      try {
        $q.dialog({
          title: 'Confirmar',
          message: `Deseja realmente remover ${pets.nome} ?`,
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          await remove(table, pets.id)
          notifySuccess('Pet removido com sucesso!')
          handleListPets()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListPets()
    })

    return {
      columnsPets,
      pet,
      filteredPets,
      loading,
      filter,
      handleEdit,
      handleRemovePets,
      formatarIdade,
      applyFilter,
    }
  },
})
</script>
