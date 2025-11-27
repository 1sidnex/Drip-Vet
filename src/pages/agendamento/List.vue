<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="agendamentos"
        :columns="columnsAgendamento"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6"> Agendamentos </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-agendamento' }"
          />
        </template>
        <template v-slot:body-cell-tutor="props">
          <q-td :props="props">
            {{ props.row.nomeTutor || props.row.tutor || '-' }}
          </q-td>
        </template>
        <template v-slot:body-cell-pet="props">
          <q-td :props="props">
            {{ props.row.nomePet || props.row.pet || '-' }}
          </q-td>
        </template>
        <template v-slot:body-cell-vet="props">
          <q-td :props="props">
            {{ props.row.nomeVeterinario || props.row.vet || '-' }}
          </q-td>
        </template>
        <template v-slot:body-cell-horaConsulta="props">
          <q-td :props="props">
            {{ formatarHora(props.row.horaConsulta) }}
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
              @click="handleRemoveAgendamento(props.row)"
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
        :to="{ name: 'form-agendamento' }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'
import { columnsAgendamento } from './table'

export default defineComponent({
  name: 'PageAgendamentoList',
  setup() {
    const agendamentos = ref([])
    const loading = ref(true)
    const router = useRouter()
    const $q = useQuasar()
    const table = 'agendamento'

    const { list, remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const formatarHora = (hora) => {
      if (!hora) return '-'
      if (hora.includes(':')) {
        const partes = hora.split(':')
        if (partes.length >= 2) {
          return `${partes[0]}:${partes[1]}`
        }
      }
      return hora
    }

    const handleListAgendamento = async () => {
      try {
        loading.value = true
        const agendamentosData = await list(table)

        // Busca os nomes dos tutores, pets e veterinários
        const agendamentosFormatados = await Promise.all(
          (agendamentosData || []).map(async (agendamento) => {
            let nomeTutor = '-'
            let nomePet = '-'
            let nomeVeterinario = '-'

            // Busca nome do tutor
            if (agendamento.tutor) {
              try {
                const { data: tutor } = await supabase
                  .from('tutores')
                  .select('nome')
                  .eq('id', agendamento.tutor)
                  .single()

                if (tutor) {
                  nomeTutor = tutor.nome
                }
              } catch (err) {
                console.warn('Erro ao buscar tutor:', err)
              }
            }

            // Busca nome do pet
            if (agendamento.pet) {
              try {
                const { data: pet } = await supabase
                  .from('pets')
                  .select('nome')
                  .eq('id', agendamento.pet)
                  .single()

                if (pet) {
                  nomePet = pet.nome
                }
              } catch (err) {
                console.warn('Erro ao buscar pet:', err)
              }
            }

            // Busca nome do veterinário
            if (agendamento.vet) {
              try {
                const { data: veterinario } = await supabase
                  .from('usuarios')
                  .select('nome')
                  .eq('id', agendamento.vet)
                  .single()

                if (veterinario) {
                  nomeVeterinario = veterinario.nome
                }
              } catch (err) {
                console.warn('Erro ao buscar veterinário:', err)
              }
            }

            return {
              ...agendamento,
              nomeTutor,
              nomePet,
              nomeVeterinario,
            }
          }),
        )

        agendamentos.value = agendamentosFormatados
        loading.value = false
      } catch (error) {
        notifyError(error.message)
        loading.value = false
      }
    }

    const handleEdit = (agendamento) => {
      router.push({ name: 'form-agendamento', params: { id: agendamento.id } })
    }

    const handleRemoveAgendamento = async (agendamento) => {
      try {
        $q.dialog({
          title: 'Confirmar',
          message: `Deseja realmente remover o agendamento do dia ${agendamento.dataConsulta}, às ${agendamento.horaConsulta}?`,
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          await remove(table, agendamento.id)
          notifySuccess('Agendamento removido com sucesso!')
          handleListAgendamento()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListAgendamento()
    })

    return {
      columnsAgendamento,
      agendamentos,
      loading,
      handleEdit,
      handleRemoveAgendamento,
      formatarHora,
    }
  },
})
</script>
