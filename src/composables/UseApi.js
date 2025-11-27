import useSupabase from 'src/boot/supabase'
import useAuthUser from './UseAuthUser'
import { v4 as uuidv4 } from 'uuid'
import useBrand from 'src/composables/UseBrand'
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const brand = ref({
  primary: '',
  secondary: '',
  name: '',
  phone: '',
  paralax_url: '',
})

export default function useApi() {
  const { supabase } = useSupabase()
  const { user } = useAuthUser()
  const { setBrand } = useBrand()
  const $q = useQuasar()

  // Busca o ID do usuario na tabela usuarios baseado no email do auth.users
  const getUsuarioId = async () => {
    if (!user.value?.email) return null

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.value.email)
        .single()

      if (error || !data) return null
      return data.id
    } catch (error) {
      console.warn('Erro ao buscar usuario_id:', error)
      return null
    }
  }

  const list = async (table) => {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error
    return data
  }

  const fetchCount = async (table, userId) => {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('user', userId)
    if (error) throw error
    return {
      data,
      count,
    }
  }

  const getById = async (table, id) => {
    // Lógica específica para trazer endereço junto com o tutor
    if (table === 'tutores') {
      // Busca o tutor primeiro
      const { data: tutorData, error: tutorError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (tutorError) throw tutorError

      // Se o tutor tem um endereco_id, busca o endereço separadamente
      let enderecoData = null
      if (tutorData.endereco) {
        const { data: endereco, error: enderecoError } = await supabase
          .from('endereco')
          .select('*')
          .eq('id', tutorData.endereco)
          .single()

        // Não lança erro se não encontrar endereço, apenas registra
        if (!enderecoError && endereco) {
          enderecoData = endereco
        }
      }

      // Combina os dados do tutor com os dados do endereço
      const usuario = {
        ...tutorData,
        endereco_id: enderecoData?.id || tutorData.endereco || null,
        rua: enderecoData?.rua || '',
        numero: enderecoData?.numero || '',
        bairro: enderecoData?.bairro || '',
        cidade: enderecoData?.cidade || '',
        estado: enderecoData?.estado || '',
        cep: enderecoData?.cep || '',
      }
      return usuario
    }

    // Padrão para outras tabelas
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
    if (error) throw error
    return data
  }

  const post = async (table, form) => {
    // Tabelas que precisam de 'user' (bigint - referencia usuarios)
    const tablesWithUserBigint = ['tutores', 'agendamento', 'estoqueMedicamentos', 'campanhas'] // <--- CORREÇÃO APLICADA

    // Tabelas que precisam de 'user' (uuid - referencia auth.users)
    const tablesWithUserUuid = ['pets']

    // Prepara os dados para inserção
    const dataToInsert = { ...form }

    // Adiciona 'user' conforme o tipo necessário
    if (user.value?.id) {
      if (tablesWithUserBigint.includes(table)) {
        // Para tabelas que referenciam usuarios (bigint)
        // Busca o id do usuario na tabela usuarios baseado no email
        const usuarioId = await getUsuarioId()
        if (usuarioId) {
          dataToInsert.user = usuarioId
        }
        // Se não encontrar, deixa sem user (pode causar erro de constraint se for NOT NULL)
      } else if (tablesWithUserUuid.includes(table)) {
        // Para pets que referenciam auth.users (uuid)
        dataToInsert.user = user.value.id
      }
    }

    const { data, error } = await supabase.from(table).insert([dataToInsert]).select()
    if (error) throw error
    return data
  }

  const update = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .update({ ...form })
      .match({ id: form.id })
    if (error) throw error
    return data
  }

  const remove = async (table, id) => {
    const { data, error } = await supabase.from(table).delete().match({ id })
    if (error) throw error
    return data
  }

  const uploadImg = async (file, storage) => {
    const fileName = uuidv4()
    const { error } = await supabase.storage.from(storage).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const publicUrl = await getUrlPublic(fileName, storage)
    return publicUrl
  }

  const getUrlPublic = async (fileName, storage) => {
    const { data, error } = supabase.storage.from(storage).getPublicUrl(fileName)
    if (error) throw error
    return data.publicUrl
  }

  const getBrand = async () => {
    // Busca o usuario_id baseado no email do auth.users
    const usuarioId = await getUsuarioId()
    if (usuarioId) {
      $q.loading.show({
        backgroundColor: 'dark',
      })
      const { data, error } = await supabase.from('config').select('*').eq('user', usuarioId)
      if (error) throw error
      if (data.length > 0) {
        brand.value = data[0]
        setBrand(brand.value.primary, brand.value.secondary)
      }
      $q.loading.hide()
      return brand
    }
  }

  return {
    list,
    fetchCount,
    getById,
    post,
    update,
    remove,
    uploadImg,
    getBrand,
    brand,
  }
}