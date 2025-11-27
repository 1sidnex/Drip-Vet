import { createClient } from '@supabase/supabase-js'
import { user } from 'src/composables/UseAuthUser'

// Lê variáveis do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Log para debug (ajuda a saber se estão sendo lidas)
console.log('🔍 Supabase URL:', supabaseUrl || 'NÃO DEFINIDA')
console.log('🔍 Supabase Key:', supabaseKey ? 'Carregada' : 'NÃO DEFINIDA')

// Validação para evitar erros silenciosos
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não foram carregadas.')
  console.error('Verifique se o arquivo .env está na raiz do projeto (desenvolvimento)')
  console.error(
    'ou se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY estão configuradas no Netlify (produção)',
  )
}

// Cria o cliente Supabase (usa valores vazios se não estiverem definidos para evitar crash)
// Mas a aplicação não funcionará sem essas variáveis
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
)

// Mantém o estado global do usuário atualizado
supabase.auth.onAuthStateChange((event, session) => {
  user.value = session?.user || null
})

// Exporta como função default para uso como composable
export default function useSupabase() {
  return { supabase }
}

// Exporta também o cliente diretamente para compatibilidade
export { supabase }
