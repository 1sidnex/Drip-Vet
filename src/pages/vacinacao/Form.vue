<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">Formulário de Vacinação</p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-select
          label="Nome do Pet"
          v-model="form.pet"
          :options="filteredPets"
          option-label="nome"
          option-value="id"
          map-options
          emit-value
          use-input
          input-debounce="0"
          @filter="filterPets"
          @update:model-value="onPetSelected"
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
          label="Nome da Vacina"
          v-model="form.vacina_nome"
          :options="filteredVacinas"
          use-input
          fill-input
          input-debounce="0"
          @filter="filterVacinas"
          clearable
          hint="Digite o nome da vacina ou selecione uma existente"
          :rules="[(val) => !!val || 'Campo obrigatório']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> Nenhuma vacina encontrada </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          label="Data da Aplicação"
          v-model="form.data_aplicacao"
          mask="####-##-##"
          hint="Formato: AAAA-MM-DD"
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
          :to="{ name: 'vacinacao' }"
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
  name: 'PageFormVacinacao',
  setup() {
    const table = 'vacinacao'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update, list } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    const form = ref({
      pet: null,
      pet_nome: '',
      vacina_nome: '',
      data_aplicacao: '',
    })

    const optionsPets = ref([])
    const filteredPets = ref([])
    const optionsVacinas = ref([])
    const filteredVacinas = ref([])

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

    const filterVacinas = (val, update) => {
      if (val === '') {
        update(() => {
          filteredVacinas.value = optionsVacinas.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        filteredVacinas.value = optionsVacinas.value.filter(
          (vacina) => vacina.toLowerCase().indexOf(needle) > -1,
        )
      })
    }

    const onPetSelected = (petId) => {
      if (petId) {
        const petSelecionado = optionsPets.value.find((p) => p.id === petId)
        if (petSelecionado) {
          form.value.pet_nome = petSelecionado.nome
        }
      } else {
        form.value.pet_nome = ''
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

    const handleListVacinas = async () => {
      try {
        // Busca todas as vacinas já cadastradas para obter nomes únicos
        const { data, error } = await supabase
          .from('vacinacao')
          .select('vacina_nome')
          .not('vacina_nome', 'is', null)

        if (error) throw error

        // Extrai nomes únicos de vacinas
        const vacinasUnicas = [...new Set((data || []).map((v) => v.vacina_nome).filter(Boolean))]
        optionsVacinas.value = vacinasUnicas.sort()
        filteredVacinas.value = vacinasUnicas.sort()
      } catch (error) {
        console.error('Erro ao carregar vacinas:', error)
        optionsVacinas.value = []
        filteredVacinas.value = []
      }
    }

    onMounted(() => {
      handleListPets()
      handleListVacinas()
      if (isUpdate.value) {
        handleGet(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        // Busca o nome do pet selecionado
        const petSelecionado = optionsPets.value.find((p) => p.id === form.value.pet)
        const dataParaEnvio = {
          ...form.value,
          pet_nome: petSelecionado ? petSelecionado.nome : form.value.pet_nome,
        }

        // Remove o campo pet (ID) se não for necessário na tabela
        // Mantém apenas pet_nome conforme a estrutura atual
        delete dataParaEnvio.pet

        if (isUpdate.value) {
          await update(table, dataParaEnvio)
          notifySuccess('Atualizado com sucesso!')
        } else {
          await post(table, dataParaEnvio)
          notifySuccess('Salvo com sucesso!')
        }
        router.push({ name: 'vacinacao' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGet = async (id) => {
      try {
        const vacinacao = await getById(table, id)

        // Aguarda a lista de pets carregar antes de buscar o pet
        if (optionsPets.value.length === 0) {
          await handleListPets()
        }

        // Busca o pet pelo nome para preencher o select
        if (vacinacao.pet_nome) {
          const petEncontrado = optionsPets.value.find(
            (p) => p.nome.toLowerCase() === vacinacao.pet_nome.toLowerCase(),
          )
          if (petEncontrado) {
            form.value.pet = petEncontrado.id
            form.value.pet_nome = petEncontrado.nome
          } else {
            form.value.pet_nome = vacinacao.pet_nome
          }
        }

        form.value = {
          ...vacinacao,
          vacina_nome: vacinacao.vacina_nome || '',
          data_aplicacao: vacinacao.data_aplicacao || '',
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      filteredPets,
      filterPets,
      filteredVacinas,
      filterVacinas,
      onPetSelected,
    }
  },
})
</script>
