'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert('Erro no login: ' + error.message)
      setLoading(false)
      return
    }

    // Busca dados do usuário para redirecionamento
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Erro ao obter dados do usuário')
      setLoading(false)
      return
    }

    console.log('User ID:', user.id)
    console.log('User Email:', user.email)

    // Busca dados do usuário na tabela usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('is_admin, tipo_negocio_id, nome')
      .eq('user_id', user.id)
      .single()

    console.log('Usuario encontrado:', usuario)
    console.log('Erro na busca:', usuarioError)

    if (usuarioError) {
      console.error('Erro ao buscar usuário:', usuarioError)
      alert('Erro ao buscar dados do usuário: ' + usuarioError.message)
      setLoading(false)
      return
    }

    if (!usuario) {
      alert('Usuário não encontrado na base de dados. Verifique se o user_id está correto.')
      setLoading(false)
      return
    }

    console.log('Tipo de usuário:', usuario.is_admin ? 'Admin' : 'Cliente')
    console.log('Tipo de negócio ID:', usuario.tipo_negocio_id)
    console.log('Tipo de negócio ID (string):', String(usuario.tipo_negocio_id))

    // Redirecionamento baseado no tipo de usuário
    if (usuario.is_admin) {
      console.log('Redirecionando para /admin')
      router.push('/admin')
    } else {
      console.log('Verificando tipo de negócio...')
      console.log('ID recebido:', usuario.tipo_negocio_id)
      console.log('Tipo do ID:', typeof usuario.tipo_negocio_id)
      
      switch (usuario.tipo_negocio_id) {
        // Coloque os ids reais dos tipos negócio da sua tabela
        case '04c82ce2-c099-44ca-85ce-b48549e5a592':
          console.log('Redirecionando para /dashboard/barbearia')
          router.push('/dashboard/barbearia')
          break
        case '1b4d20d8-8b1a-40ac-9485-e3a11a6510a5':
          console.log('Redirecionando para /dashboard/lavarapido')
          router.push('/dashboard/lavarapido')
          break
        case 'e9f13adb-5f8c-4a26-b7c0-447397f276e2':
          console.log('Redirecionando para /dashboard/estacionamento')
          router.push('/dashboard/estacionamento')
          break
        // Adicionar casos para os novos tipos de negócio
        // IMPORTANTE: Substitua os IDs pelos valores reais obtidos do Supabase
        case 'de8e8986-ee3d-4473-a09e-c81abb071de4': // ID real da Estética
          console.log('Redirecionando para /dashboard/estetica')
          router.push('/dashboard/estetica')
          break
        case '7e1d1f77-4721-47cc-8173-393074cdae13': // ID real do Salão de Beleza
          console.log('Redirecionando para /dashboard/salao-beleza')
          router.push('/dashboard/salao-beleza')
          break
        default:
          console.log('ID não encontrado no switch, redirecionando para /dashboard (padrão)')
          console.log('IDs disponíveis no switch:')
          console.log('- 04c82ce2-c099-44ca-85ce-b48549e5a592 (Barbearia)')
          console.log('- 1b4d20d8-8b1a-40ac-9485-e3a11a6510a5 (Lava Rápido)')
          console.log('- e9f13adb-5f8c-4a26-b7c0-447397f276e2 (Estacionamento)')
          console.log('- de8e8986-ee3d-4473-a09e-c81abb071de4 (Estética)')
          console.log('- ID_DO_SALAO_BELEZA (Salão de Beleza - precisa ser substituído)')
          router.push('/dashboard')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #c7d2fe 100%)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Título */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Melhor Gestão
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            Faça login para continuar
          </p>
        </div>

        {/* Caixa do formulário */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '1.5rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Formulário */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                  (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                required
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                  (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #5ce1e6 0%, #4dd1d6 100%)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4dd1d6 0%, #3dc1c6 100%)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #5ce1e6 0%, #4dd1d6 100%)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ 
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem',
                    width: '16px',
                    height: '16px'
                  }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
} 