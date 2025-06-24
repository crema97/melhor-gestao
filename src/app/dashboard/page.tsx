'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Usuario {
  id: string
  nome: string
  email: string
  nome_negocio: string
  tipo_negocio_id: string
  is_admin: boolean
}

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/')
          return
        }

        // Buscar dados do usuário
        const { data: usuarioData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Erro ao buscar usuário:', error)
          router.push('/')
          return
        }

        setUsuario(usuarioData)
        
        // Se for admin, redirecionar para painel admin
        if (usuarioData.is_admin) {
          router.push('/admin')
          return
        }

        // Se for usuário normal, redirecionar para o dashboard específico
        if (usuarioData.tipo_negocio_id) {
          // Buscar o nome do tipo de negócio
          const { data: tipoNegocio } = await supabase
            .from('tipos_negocio')
            .select('nome')
            .eq('id', usuarioData.tipo_negocio_id)
            .single()

          if (tipoNegocio) {
            const dashboardPath = getDashboardPath(tipoNegocio.nome)
            router.push(dashboardPath)
            return
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        router.push('/')
      }
    }
    checkUser()
  }, [router])

  function getDashboardPath(tipoNegocio: string): string {
    switch (tipoNegocio.toLowerCase()) {
      case 'barbearia':
        return '/dashboard/barbearia'
      case 'salão de beleza':
      case 'salao de beleza':
        return '/dashboard/salao-beleza'
      case 'estética':
      case 'estetica':
        return '/dashboard/estetica'
      case 'lava rápido':
      case 'lava rapido':
        return '/dashboard/lavarapido'
      case 'estacionamento':
        return '/dashboard/estacionamento'
      default:
        return '/dashboard/barbearia' // fallback
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1f2937', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #8b5cf6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '24px', color: '#e5e7eb', fontSize: '18px', fontWeight: '500' }}>
            Carregando dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#1f2937', 
        borderBottom: '1px solid #374151',
        padding: '24px 0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: 0
              }}>
                Melhor Gestão
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '4px', 
                fontSize: '14px',
                margin: 0
              }}>
                Bem-vindo, {usuario.nome}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: '0 0 12px 0'
          }}>
            Selecione seu tipo de negócio
          </h2>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '14px',
            margin: '0 0 24px 0'
          }}>
            Escolha o dashboard específico para o seu negócio
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <a 
              href="/dashboard/barbearia"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.borderColor = '#4b5563'
              }}
            >
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0 0 6px 0'
              }}>
                Barbearia
              </h3>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '12px',
                margin: 0
              }}>
                Gestão completa para barbearias
              </p>
            </a>

            <a 
              href="/dashboard/salao-beleza"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.borderColor = '#4b5563'
              }}
            >
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0 0 6px 0'
              }}>
                Salão de Beleza
              </h3>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '12px',
                margin: 0
              }}>
                Gestão para salões de beleza
              </p>
            </a>

            <a 
              href="/dashboard/estetica"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.borderColor = '#4b5563'
              }}
            >
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0 0 6px 0'
              }}>
                Estética
              </h3>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '12px',
                margin: 0
              }}>
                Gestão para clínicas estéticas
              </p>
            </a>

            <a 
              href="/dashboard/lavarapido"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.borderColor = '#4b5563'
              }}
            >
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0 0 6px 0'
              }}>
                Lava Rápido
              </h3>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '12px',
                margin: 0
              }}>
                Gestão para lava rápidos
              </p>
            </a>

            <a 
              href="/dashboard/estacionamento"
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
                e.currentTarget.style.borderColor = '#4b5563'
              }}
            >
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0 0 6px 0'
              }}>
                Estacionamento
              </h3>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '12px',
                margin: 0
              }}>
                Gestão para estacionamentos
              </p>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
} 