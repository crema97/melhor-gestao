// Script para testar se as variáveis de ambiente estão configuradas
// Execute: node testar_variaveis_ambiente.js

require('dotenv').config({ path: '.env.local' })

console.log('=== Teste de Variáveis de Ambiente ===\n')

// Verificar se as variáveis existem
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL do Supabase:', url ? '✅ Configurada' : '❌ Não configurada')
console.log('Service Role Key:', serviceKey ? '✅ Configurada' : '❌ Não configurada')
console.log('Anon Key:', anonKey ? '✅ Configurada' : '❌ Não configurada')

if (!url || !serviceKey || !anonKey) {
  console.log('\n❌ Algumas variáveis estão faltando!')
  console.log('Crie o arquivo .env.local com as variáveis necessárias.')
  process.exit(1)
}

// Verificar formato das chaves
console.log('\n=== Verificação de Formato ===')

if (url && !url.includes('supabase.co')) {
  console.log('❌ URL do Supabase parece estar incorreta')
} else {
  console.log('✅ URL do Supabase parece estar correta')
}

if (serviceKey && !serviceKey.startsWith('eyJ')) {
  console.log('❌ Service Role Key parece estar incorreta')
} else {
  console.log('✅ Service Role Key parece estar correta')
}

if (anonKey && !anonKey.startsWith('eyJ')) {
  console.log('❌ Anon Key parece estar incorreta')
} else {
  console.log('✅ Anon Key parece estar correta')
}

console.log('\n✅ Todas as variáveis estão configuradas!')
console.log('Agora você pode testar a exclusão de usuários.') 