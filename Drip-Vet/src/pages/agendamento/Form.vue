<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">Agendamento</p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-select
          label="Tutor"
          v-model="form.tutor"
          :options="filteredTutores"
          option-label="nome"
          option-value="id"
          map-options
          emit-value
          use-input
          input-debounce="0"
          @filter="filterTutores"
          clearable
          :rules="[(val) => !!val || 'É preciso selecionar um tutor!']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> Nenhum tutor encontrado </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          label="Pet"
          v-model="form.pet"
          :options="filteredPets"
          option-label="nome"
          option-value="id"
          map-options
          emit-value
          use-input
          input-debounce="0"
          @filter="filterPets"
          clearable
          :rules="[(val) => !!val || 'É preciso selecionar um pet!']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> Nenhum pet encontrado </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-model="form.vet"
          :options="optionsUsuarios"
          label="Veterinário"
          option-value="id"
          option-label="nome"
          map-options
          emit-value
          clearable
          :rules="[(val) => !!val || 'É preciso selecionar um veterinário!']"
        />

        <q-input
          label="Data da consulta"
          v-model="form.dataConsulta"
          mask="####-##-##"
          hint="Formato: AAAA-MM-DD"
        />

        <q-input
          label="Horário da consulta"
          v-model="form.horaConsulta"
          mask="##:##"
          hint="Formato: HH:MM"
        />

        <q-input label="Tipo da consulta" v-model="form.tipoConsulta" />

        <q-editor label="Observações" v-model="form.observacoes" min-height="5rem" />

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
          :to="{ name: 'agendamento' }"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from 'src/boot/supabase'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

export default defineComponent({
  name: 'PageFormAgendamento',
  setup() {
    const table = 'agendamento'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update, list } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    let agendamento = {}
    const form = ref({
      tutor: null,
      pet: null,
      vet: '',
      dataConsulta: '',
      horaConsulta: '',
      tipoConsulta: '',
      observacoes: '',
    })

    const optionsUsuarios = ref([])
    const optionsTutores = ref([])
    const filteredTutores = ref([])
    const optionsPets = ref([])
    const filteredPets = ref([])

    const filterTutores = (val, update) => {
      if (val === '') {
        update(() => {
          filteredTutores.value = optionsTutores.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        filteredTutores.value = optionsTutores.value.filter(
          (tutor) => tutor.nome.toLowerCase().indexOf(needle) > -1,
        )
      })
    }

    const filterPets = (val, update) => {
      if (val === '') {
        update(() => {
          filteredPets.value = optionsPets.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        filteredPets.value = optionsPets.value.filter(
          (pet) => pet.nome.toLowerCase().indexOf(needle) > -1,
        )
      })
    }

    const handleListTutores = async () => {
      try {
        const tutores = await list('tutores')
        optionsTutores.value = tutores || []
        filteredTutores.value = tutores || []
      } catch (error) {
        notifyError('Erro ao carregar tutores: ' + error.message)
      }
    }

    const handleListPets = async () => {
      try {
        const pets = await list('pets')
        optionsPets.value = pets || []
        filteredPets.value = pets || []
      } catch (error) {
        notifyError('Erro ao carregar pets: ' + error.message)
      }
    }

    const fetchVeterinarios = async () => {
      try {
        // Busca todos os usuários (sem filtrar por tipoUsuario para evitar erro de enum)
        const { data, error } = await supabase.from('usuarios').select('id, nome, tipoUsuario')

        if (error) throw error

        // Filtra apenas veterinários no código (se o tipoUsuario existir)
        // Se não houver tipoUsuario, lista todos os usuários
        if (data && data.length > 0) {
          const veterinarios = data.filter((usuario) => {
            // Tenta diferentes variações do nome
            const tipo = usuario.tipoUsuario?.toLowerCase() || ''
            return (
              tipo.includes('vet') ||
              tipo.includes('veterin') ||
              tipo === 'veterinario' ||
              tipo === 'veterinária' ||
              tipo === 'veterinario' ||
              !usuario.tipoUsuario // Se não tiver tipo, inclui também
            )
          })

          // Se encontrou veterinários filtrados, usa eles. Senão, usa todos
          optionsUsuarios.value = veterinarios.length > 0 ? veterinarios : data
        } else {
          optionsUsuarios.value = []
        }
      } catch (error) {
        console.error('Erro ao buscar veterinários:', error)
        // Em caso de erro, tenta buscar todos os usuários sem filtro
        try {
          const { data } = await supabase.from('usuarios').select('id, nome')
          optionsUsuarios.value = data || []
        } catch {
          notifyError('Erro ao carregar lista de veterinários')
          optionsUsuarios.value = []
        }
      }
    }

    onMounted(() => {
      handleListTutores()
      handleListPets()
      fetchVeterinarios()
      if (isUpdate.value) {
        handleGetAgendamento(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        // Prepara dados para envio
        const dataParaEnvio = { ...form.value }

        // Garante que tutor e pet sejam números (conforme schema: smallint)
        if (dataParaEnvio.tutor) {
          dataParaEnvio.tutor = parseInt(dataParaEnvio.tutor)
        }
        if (dataParaEnvio.pet) {
          dataParaEnvio.pet = parseInt(dataParaEnvio.pet)
        }

        if (isUpdate.value) {
          await update(table, dataParaEnvio)
          notifySuccess('Agendamento atualizado com sucesso!')
        } else {
          await post(table, dataParaEnvio)
          notifySuccess('Agendamento salvo com sucesso!')
        }
        router.push({ name: 'agendamento' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetAgendamento = async (id) => {
      try {
        agendamento = await getById(table, id)

        // Garante que tutor e pet sejam números (IDs) para os selects funcionarem
        form.value = {
          ...agendamento,
          tutor: agendamento.tutor ? parseInt(agendamento.tutor) : null,
          pet: agendamento.pet ? parseInt(agendamento.pet) : null,
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      filteredTutores,
      filterTutores,
      filteredPets,
      filterPets,
      optionsUsuarios,
    }
  },
})
</script>
