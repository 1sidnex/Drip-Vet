<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">Cadastro de Tutor</p>
        <q-spinner v-if="loading" color="primary" size="3em" class="q-mt-md" />
      </div>
      <q-form
        ref="formRef"
        class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md"
        @submit.prevent="handleSubmit"
        v-if="!loading"
      >
        <q-input
          label="Nome"
          v-model="form.nome"
          :rules="[(val) => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

        <q-input
          label="CPF"
          v-model="form.cpf"
          mask="###.###.###-##"
          hint="Ex: 123.456.789-00"
          :rules="[
            (val) => (val && val.length > 0) || 'É preciso inserir um CPF!',
            (val) => validarCPF(val) || 'CPF inválido! Deve conter 11 dígitos.',
          ]"
        />

        <q-input
          label="WhatsApp"
          v-model="form.whatsapp"
          mask="(##) #####-####"
          hint="Ex: (67) 91234-5678"
          :rules="[
            (val) => (val && val.length > 0) || 'É preciso inserir um WhatsApp!',
            (val) => validarWhatsApp(val) || 'WhatsApp inválido! Deve conter 11 dígitos.',
          ]"
        />

        <q-input
          label="E-mail"
          v-model="form.email"
          type="email"
          hint="Ex: nome@dominio.com"
          :rules="[
            (val) => (val && val.length > 0) || 'É preciso inserir um e-mail!',
            (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
          ]"
        />

        <q-input
          label="Rua"
          v-model="form.rua"
          :rules="[(val) => (val && val.length > 0) || 'É preciso inserir a rua!']"
        />

        <q-input
          label="Número"
          v-model="form.numero"
          type="text"
          hint="Máximo 5 dígitos"
          maxlength="5"
          @update:model-value="limitarNumero"
          :rules="[
            (val) => {
              if (!val && val !== 0) return 'É preciso inserir o número!'
              const str = String(val).trim()
              return str.length > 0 || 'É preciso inserir o número!'
            },
            (val) => validarNumero(val) || 'Número inválido! Máximo 5 dígitos.',
          ]"
        />

        <q-input
          label="Bairro"
          v-model="form.bairro"
          :rules="[(val) => (val && val.length > 0) || 'É preciso inserir o bairro!']"
        />

        <q-input
          label="Cidade"
          v-model="form.cidade"
          :rules="[(val) => (val && val.length > 0) || 'É preciso inserir a cidade!']"
        />

        <q-input
          label="Estado"
          v-model="form.estado"
          mask="AA"
          hint="Ex: MS (2 letras)"
          :rules="[
            (val) => (val && val.length > 0) || 'É preciso inserir o estado!',
            (val) => (val && val.length === 2) || 'Estado deve conter 2 letras!',
          ]"
        />

        <q-input
          label="CEP"
          v-model="form.cep"
          mask="#####-###"
          hint="Ex: 79800-123"
          :rules="[
            (val) => (val && val.length > 0) || 'É preciso inserir o CEP!',
            (val) => validarCEP(val) || 'CEP inválido! Deve conter 8 dígitos.',
          ]"
        />

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
          :to="{ name: 'tutor' }"
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

export default defineComponent({
  name: 'PageFormTutor',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)
    const loading = ref(false)
    const formRef = ref(null)

    const form = ref({
      nome: '',
      cpf: '',
      whatsapp: '',
      email: '',
      observacoes: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      endereco_id: null,
    })

    // Funções de validação
    const validarCPF = (cpf) => {
      if (!cpf) return false
      // Remove formatação
      const cpfLimpo = cpf.replace(/\D/g, '')
      // Verifica se tem 11 dígitos
      return cpfLimpo.length === 11
    }

    const validarWhatsApp = (whatsapp) => {
      if (!whatsapp) return false
      // Remove formatação
      const whatsappLimpo = whatsapp.replace(/\D/g, '')
      // Verifica se tem 11 dígitos (DDD + 9 dígitos)
      return whatsappLimpo.length === 11
    }

    const validarNumero = (numero) => {
      // Se não tiver valor, retorna false (campo obrigatório)
      if (numero === null || numero === undefined || numero === '') return false

      // Converte para string e remove espaços
      const numeroStr = String(numero).trim()

      // Se após remover espaços estiver vazio, retorna false
      if (numeroStr.length === 0) return false

      // Verifica se contém apenas dígitos e tem no máximo 5 caracteres
      // Aceita valores de 1 a 5 dígitos
      return /^\d+$/.test(numeroStr) && numeroStr.length >= 1 && numeroStr.length <= 5
    }

    const validarCEP = (cep) => {
      if (!cep) return false
      // Remove formatação
      const cepLimpo = cep.replace(/\D/g, '')
      // Verifica se tem 8 dígitos
      return cepLimpo.length === 8
    }

    const limitarNumero = (valor) => {
      // Se não tiver valor, permite que seja vazio (será validado pelo form)
      if (!valor && valor !== 0) {
        return
      }

      // Converte para string
      const str = String(valor)

      // Remove caracteres não numéricos e limita a 5 dígitos
      const numeroLimpo = str.replace(/\D/g, '').slice(0, 5)

      // Só atualiza se o valor foi alterado (para evitar loops)
      if (numeroLimpo !== str) {
        form.value.numero = numeroLimpo
      }
    }

    // Watcher para limitar o número a 5 dígitos
    watch(
      () => form.value.numero,
      (newVal) => {
        // Se não tiver valor, não faz nada
        if (!newVal && newVal !== 0) return

        // Converte para string
        const str = String(newVal)

        // Se tiver mais de 5 caracteres, limita
        if (str.length > 5) {
          form.value.numero = str.slice(0, 5)
          return
        }

        // Remove caracteres não numéricos apenas se houver caracteres inválidos
        if (!/^\d*$/.test(str)) {
          const limpo = str.replace(/\D/g, '')
          if (limpo !== str) {
            form.value.numero = limpo
          }
        }
      },
    )

    onMounted(() => {
      if (isUpdate.value) {
        handleGetTutor(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        // Valida o formulário antes de processar
        if (formRef.value) {
          const valid = await formRef.value.validate()
          if (!valid) {
            return
          }
        }

        // Valida e limpa o número antes de salvar
        const numeroOriginal = form.value.numero

        // Converte para string e valida
        const numeroStr =
          numeroOriginal !== null && numeroOriginal !== undefined
            ? String(numeroOriginal).trim()
            : ''

        if (numeroStr.length === 0) {
          notifyError('É preciso inserir o número da casa!')
          return
        }

        const numeroLimpo = numeroStr.replace(/\D/g, '')

        if (numeroLimpo.length === 0) {
          notifyError('O número da casa deve conter apenas dígitos!')
          return
        }

        if (numeroLimpo.length > 5) {
          notifyError('O número da casa deve ter no máximo 5 dígitos!')
          return
        }

        // Limpa o CEP removendo formatação
        const cepLimpo = form.value.cep.replace(/\D/g, '')

        if (isUpdate.value) {
          // Atualiza dados do tutor
          const tutorData = {
            id: isUpdate.value,
            nome: form.value.nome,
            cpf: form.value.cpf,
            whatsapp: form.value.whatsapp.replace(/\D/g, ''),
            email: form.value.email,
            observacoes: form.value.observacoes,
          }
          await update('tutores', tutorData)

          // Atualiza endereço (assumindo que temos o ID do endereço pelo getById)
          if (form.value.endereco_id) {
            const enderecoData = {
              id: form.value.endereco_id,
              rua: form.value.rua,
              numero: numeroLimpo,
              bairro: form.value.bairro,
              cidade: form.value.cidade,
              estado: form.value.estado.toUpperCase(),
              cep: cepLimpo,
            }
            await update('endereco', enderecoData)
          }

          notifySuccess('Tutor atualizado com sucesso!')
          router.push({ name: 'tutor' })
        } else {
          // Cadastra novo tutor
          // Primeiro cria o endereço (sem tutor ainda)
          const enderecoData = {
            rua: form.value.rua,
            numero: numeroLimpo,
            bairro: form.value.bairro,
            cidade: form.value.cidade,
            estado: form.value.estado.toUpperCase(),
            cep: cepLimpo,
            tutor: null, // Será atualizado depois
          }

          const novoEndereco = await post('endereco', enderecoData)

          if (!novoEndereco || novoEndereco.length === 0) {
            throw new Error('Não foi possível criar o endereço.')
          }

          const enderecoId = novoEndereco[0].id

          // Agora cria o tutor com referência ao endereço
          const tutorData = {
            nome: form.value.nome,
            cpf: form.value.cpf,
            whatsapp: form.value.whatsapp.replace(/\D/g, ''),
            email: form.value.email,
            observacoes: form.value.observacoes,
            endereco: enderecoId,
          }

          const novoTutor = await post('tutores', tutorData)

          if (novoTutor && novoTutor.length > 0) {
            const tutorId = novoTutor[0].id

            // Atualiza o endereço com a referência ao tutor (relação circular)
            const enderecoUpdate = {
              id: enderecoId,
              tutor: tutorId,
            }
            await update('endereco', enderecoUpdate)

            notifySuccess('Tutor salvo com sucesso!')
            router.push({ name: 'tutor' })
          } else {
            throw new Error('Não foi possível criar o novo tutor.')
          }
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetTutor = async (id) => {
      try {
        loading.value = true
        const response = await getById('tutores', id)

        if (response) {
          // Garante que todos os campos tenham valores padrão se estiverem vazios
          // Converte número para string para garantir compatibilidade com validação
          const numeroFormatado =
            response.numero !== null && response.numero !== undefined ? String(response.numero) : ''

          form.value = {
            nome: response.nome || '',
            cpf: response.cpf || '',
            whatsapp: response.whatsapp || '',
            email: response.email || '',
            observacoes: response.observacoes || '',
            rua: response.rua || '',
            numero: numeroFormatado,
            bairro: response.bairro || '',
            cidade: response.cidade || '',
            estado: response.estado || '',
            cep: response.cep || '',
            endereco_id: response.endereco_id || response.endereco || null,
          }
        }
        loading.value = false
      } catch (error) {
        console.error('Erro ao buscar tutor:', error)
        notifyError('Erro ao carregar dados do tutor: ' + error.message)
        loading.value = false
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      loading,
      formRef,
      validarCPF,
      validarWhatsApp,
      validarNumero,
      validarCEP,
      limitarNumero,
    }
  },
})
</script>
