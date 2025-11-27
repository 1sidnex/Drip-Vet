<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">Cadastro de PET</p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">

        <div v-if="isUpdate && form.imgUrl && !img" class="q-mb-md">
          <p class="text-caption q-mb-xs">Foto de perfil atual:</p>
          <q-chip
            square
            icon="mdi-file-image"
            :label="currentFileName"
            removable
            @remove="removeCurrentFile"
            color="blue-1"
            text-color="blue-10"
          />
        </div>
        
        <q-file
          outlined
          v-model="img"
          :label="isUpdate && form.imgUrl ? 'Selecionar nova foto (substituir)' : 'Foto de perfil (anexar)'"
          accept=".png,.jpg,.jpeg,.PNG,.JPG,.JPEG"
          @rejected="onRejected"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <q-input
          label="Nome"
          v-model="form.nome"
          :rules="[(val) => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

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

        <q-input label="Raça" v-model="form.raca" />

        <div>
          <div class="q-mb-xs text-body2">Sexo</div>
          <div class="row q-gutter-xs">
            <q-btn
              :color="form.sexo === 'Macho' ? 'primary' : 'grey-4'"
              :text-color="form.sexo === 'Macho' ? 'white' : 'dark'"
              label="Macho"
              @click="form.sexo = 'Macho'"
              size="sm"
              rounded
              style="min-width: 100px"
            />
            <q-btn
              :color="form.sexo === 'Fêmea' ? 'pink' : 'grey-4'"
              :text-color="form.sexo === 'Fêmea' ? 'white' : 'dark'"
              label="Fêmea"
              @click="form.sexo = 'Fêmea'"
              size="sm"
              rounded
              style="min-width: 100px"
            />
          </div>
        </div>

        <q-input
          label="Data de Nascimento"
          v-model="form.dataNasc"
          mask="##/##/####"
          placeholder="DD/MM/AAAA"
          @update:model-value="calcularIdade"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="form.dataNasc"
                  mask="DD/MM/YYYY"
                  @update:model-value="calcularIdade"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          label="Idade"
          :model-value="form.idade !== null && form.idade !== undefined ? form.idade : ''"
          readonly
          hint="Calculada automaticamente"
        />

        <q-input label="Peso" v-model="form.peso" type="number" step="0.1" suffix="kg" />

        <q-select
          label="Possui Chip?"
          v-model="form.chip"
          :options="optionsChip"
          map-options
          emit-value
        />

        <q-editor
          label="Observações"
          v-model="form.observacoes"
          min-height="5rem"
          placeholder="Observações gerais sobre o pet"
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
          :to="{ name: 'pet' }"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import { date } from 'quasar'

export default defineComponent({
  name: 'PageFormPets',
  setup() {
    const table = 'pets'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update, uploadImg, list } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    const form = ref({
      nome: '',
      observacoes: '',
      raca: '',
      sexo: '',
      dataNasc: '',
      chip: '',
      idade: null,
      peso: null,
      tutor: null,
      imgUrl: '',
    })
    const img = ref(null) // Guarda o novo arquivo selecionado pelo usuário

    const optionsChip = [
      { label: 'Sim', value: 'Sim' },
      { label: 'Não', value: 'Não' },
    ]

    const optionsTutores = ref([])
    const filteredTutores = ref([])
    const idadeEmMeses = ref(null)

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

    const onRejected = () => {
      notifyError('Apenas arquivos PNG e JPG são permitidos!')
    }

    const calcularIdade = () => {
      if (!form.value.dataNasc) {
        form.value.idade = null
        return
      }

      try {
        const dataLimpa = form.value.dataNasc.trim()
        if (!dataLimpa || dataLimpa.length < 10) {
          form.value.idade = null
          return
        }

        const dataNasc = date.extractDate(dataLimpa, 'DD/MM/YYYY')

        if (!dataNasc || isNaN(dataNasc.getTime())) {
          form.value.idade = null
          return
        }

        const hoje = new Date()

        let anos = hoje.getFullYear() - dataNasc.getFullYear()
        let meses = hoje.getMonth() - dataNasc.getMonth()
        const diaAtual = hoje.getDate()
        const diaNasc = dataNasc.getDate()

        if (meses < 0 || (meses === 0 && diaAtual < diaNasc)) {
          anos--
          meses += 12
        }

        if (diaAtual < diaNasc) {
          meses--
          if (meses < 0) {
            meses += 12
            anos--
          }
        }

        if (anos < 0) {
          form.value.idade = '0 meses'
          return
        }

        idadeEmMeses.value = anos * 12 + meses

        if (anos === 0 && meses === 0) {
          form.value.idade = '0 meses'
        } else if (anos === 0) {
          form.value.idade = meses === 1 ? '1 mês' : `${meses} meses`
        } else if (meses === 0) {
          form.value.idade = anos === 1 ? '1 ano' : `${anos} anos`
        } else {
          const anosTexto = anos === 1 ? '1 ano' : `${anos} anos`
          const mesesTexto = meses === 1 ? '1 mês' : `${meses} meses`
          form.value.idade = `${anosTexto} e ${mesesTexto}`
        }
      } catch (error) {
        console.error('Erro ao calcular idade:', error)
        form.value.idade = null
      }
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

    // Computed property para mostrar o nome amigável para a foto atual
    const currentFileName = computed(() => {
      if (!form.value.imgUrl) return ''
      try {
        const url = new URL(form.value.imgUrl)
        const pathSegments = url.pathname.split('/')
        let filename = pathSegments[pathSegments.length - 1];
        
        // Remove query parameters (e.g., ?t=...)
        filename = filename.split('?')[0];

        // Tenta extrair o nome original se o formato for 'UUID-nomeoriginal.ext'
        const match = filename.match(/^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}-(.*)$/);
        if (match && match[1]) {
          return match[1]; // Retorna o nome após o UUID
        } else if (filename.length >= 36 && !filename.includes('.')) { 
          // Se for um UUID puro sem extensão, exibe algo genérico
          return 'foto-pet.jpg'; // Ou outro nome amigável padrão
        } else if (filename.includes('.')) {
          return filename; // Se já tiver um nome com extensão, usa ele
        }
        return 'foto-pet.jpg'; // Fallback
      } catch {
        return 'foto-pet.jpg'; // Fallback em caso de URL inválida
      }
    });


    // Função para remover a foto atual (limpar form.imgUrl e img)
    const removeCurrentFile = () => {
      form.value.imgUrl = ''
      img.value = null // Garante que o input de arquivo esteja limpo também
    }

    // Watcher para calcular idade automaticamente quando a data mudar
    watch(
      () => form.value.dataNasc,
      (newValue) => {
        if (newValue) {
          calcularIdade()
        }
      },
    )

    onMounted(() => {
      handleListTutores()
      if (isUpdate.value) {
        handleGetPets(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        // Validações antes de enviar o formulário
        if (img.value) { // Se um novo arquivo foi selecionado
          const fileName = img.value.name.toLowerCase()
          const allowedExtensions = ['.png', '.jpg', '.jpeg']
          const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

          if (!allowedExtensions.includes(fileExtension)) {
            notifyError('Apenas arquivos PNG e JPG são permitidos!')
            return // Impede o envio do formulário
          }

          // A foto será substituída: faz upload do novo arquivo
          const imgUrl = await uploadImg(img.value, 'pets')
          form.value.imgUrl = imgUrl
        } else if (isUpdate.value && form.value.imgUrl === '') {
          // Se estiver editando e o usuário removeu o chip da foto atual,
          // o campo imgUrl já está em '' e será enviado assim para o banco.
          // Isso irá apagar a imagem no banco, se a coluna permitir NULL.
        } 
        // Se isUpdate e !img.value e form.imgUrl ainda tem valor, significa que
        // nenhuma nova foto foi selecionada e a antiga foi mantida. Não precisa fazer nada aqui.


        // Copia dados e remove campos não persistentes (como 'saude' e 'cor')
        const dataParaEnvio = { ...form.value }
        delete dataParaEnvio.saude
        delete dataParaEnvio.cor 

        // Converte idade formatada para número (meses) para salvar no banco
        if (idadeEmMeses.value !== null) {
          dataParaEnvio.idade = idadeEmMeses.value
        }

        // Converte chip de string para boolean
        if (dataParaEnvio.chip !== undefined && dataParaEnvio.chip !== null) {
          dataParaEnvio.chip = dataParaEnvio.chip === 'Sim' || dataParaEnvio.chip === true
        }

        // Garante que tutor seja um número (bigint) ou null
        // **REFORÇANDO A VALIDAÇÃO DO TUTOR**
        if (dataParaEnvio.tutor && typeof dataParaEnvio.tutor === 'object' && dataParaEnvio.tutor.id) {
            // Se o tutor for um objeto com id (pode acontecer se o v-model não emitir value, mas objeto)
            dataParaEnvio.tutor = parseInt(dataParaEnvio.tutor.id);
        } else if (dataParaEnvio.tutor && !isNaN(dataParaEnvio.tutor)) {
            // Se já for um número ou string numérica
            dataParaEnvio.tutor = parseInt(dataParaEnvio.tutor);
        } else {
            // Se for null, undefined, ou não for um número válido
            dataParaEnvio.tutor = null; 
        }

        // Converte data BR (DD/MM/AAAA) para formato do banco (AAAA-MM-DD)
        if (dataParaEnvio.dataNasc) {
          const dataObjeto = date.extractDate(dataParaEnvio.dataNasc, 'DD/MM/YYYY')
          if (dataObjeto) {
            dataParaEnvio.dataNasc = date.formatDate(dataObjeto, 'YYYY-MM-DD')
          } else {
            // Se a dataNasc for inválida após extração, defina como null para evitar erro no DB
            dataParaEnvio.dataNasc = null; 
          }
        }

        if (isUpdate.value) {
          await update(table, dataParaEnvio)
          notifySuccess('PET atualizado com sucesso!')
        } else {
          await post(table, dataParaEnvio)
          notifySuccess('PET salvo com sucesso!')
        }
        router.push({ name: 'pet' })
      } catch (error) {
        console.error("Erro no handleSubmit:", error)
        if (error.message && error.message.includes('bucket not found')) {
          notifyError('Erro: Bucket de imagens "pets" não encontrado no Supabase.')
        } else if (error.message && error.message.includes('invalid input syntax for type bigint')) {
          notifyError('Erro de formato de dados: Verifique se todos os campos numéricos e de seleção obrigatórios estão preenchidos corretamente. Detalhes: ' + error.message)
        } else if (error.message) {
          notifyError(error.message)
        } else {
          notifyError('Ocorreu um erro desconhecido ao salvar o PET.')
        }
      }
    }

    const handleGetPets = async (id) => {
      try {
        const petData = await getById(table, id)
        
        // Mapeia os dados do banco para o formulário
        const dataToLoad = {
            nome: petData.nome || '',
            observacoes: petData.observacoes || '',
            raca: petData.raca || '',
            sexo: petData.sexo || '',
            dataNasc: petData.dataNasc || '',
            chip: petData.chip !== undefined && petData.chip !== null ? (petData.chip === true ? 'Sim' : 'Não') : '',
            idade: petData.idade || null,
            peso: petData.peso || null,
            tutor: petData.tutor || null,
            imgUrl: petData.imgUrl || '',
        }
        
        // Converte data do banco para formato BR ao editar
        if (dataToLoad.dataNasc) {
          dataToLoad.dataNasc = date.formatDate(dataToLoad.dataNasc, 'DD/MM/YYYY')
        }

        form.value = {
            ...form.value,
            ...dataToLoad
        }

        // Calcula a idade automaticamente ao carregar
        if (form.value.dataNasc) {
          calcularIdade()
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      img,
      optionsChip,
      filteredTutores,
      filterTutores,
      onRejected,
      currentFileName,
      removeCurrentFile,
      calcularIdade,
    }
  },
})
</script>