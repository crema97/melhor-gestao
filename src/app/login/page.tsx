'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Busca dados do usuário para redirecionamento
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('Erro ao obter dados do usuário')
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
      setError('Erro ao buscar dados do usuário: ' + usuarioError.message)
      setLoading(false)
      return
    }

    if (!usuario) {
      setError('Usuário não encontrado na base de dados. Verifique se o user_id está correto.')
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
      backgroundColor: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ 
        backgroundColor: '#1f2937', 
        borderRadius: '12px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #374151'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: '0 0 8px 0'
          }}>
            Melhor Gestão
          </h1>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '14px',
            margin: 0
          }}>
            Faça login para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              color: '#e5e7eb', 
              fontSize: '14px', 
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              color: '#e5e7eb', 
              fontSize: '14px', 
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
              placeholder="Sua senha"
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#5ce1e6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s',
              marginTop: '8px'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4dd1d6')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#5ce1e6')}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
} 