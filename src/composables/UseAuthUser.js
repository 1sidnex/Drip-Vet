import { ref } from 'vue'
import useSupabase from 'boot/supabase'

// Exporta o user para uso global
export const user = ref(null)

export default function useAuthUser() {
  const { supabase } = useSupabase()

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  const loginWithSocialProvider = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  const isLoggedIn = () => {
    return !!user.value
  }

  // Atualizado para aceitar metadados (nome, telefone) e salvar no user_metadata
  const register = async ({ email, password, ...meta }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta // Salva nome, telefone, etc. nos metadados do utilizador
        // redirectTo removido pois não vamos depender da confirmação de e-mail no fluxo imediato
      }
    })
    if (error) throw error
    // Em alguns casos de configuração do Supabase, o usuário já pode vir logado após o registro.
    // Se data.user existir, atualizamos o estado local.
    if (data.user) {
      user.value = data.user
    }
    return data.user
  }

  const update = async (data) => {
    const { data: updatedData, error } = await supabase.auth.updateUser({ data })
    if (error) throw error
    user.value = updatedData.user
    return updatedData.user
  }

  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`
    })
    if (error) throw error
  }

  const resetPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return data
  }

  return {
    user,
    login,
    loginWithSocialProvider,
    isLoggedIn,
    logout,
    register,
    update,
    sendPasswordResetEmail,
    resetPassword
  }
}