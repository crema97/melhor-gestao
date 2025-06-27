'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Usuario {
  id: string
  nome: string
  email: string
  nome_negocio: string
  tipo_negocio_id: string
}

export default function MinhaContaEstetica() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>('sucesso')
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  async function checkUserAndLoadData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      // Verificar se o usuário tem acesso ao dashboard de estética
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (usuarioError || !usuarioData) {
        router.push('/login')
        return
      }

      // Verificar se é um usuário de estética (tipo_negocio_id = 3)
      if (usuarioData.tipo_negocio_id !== '3') {
        router.push('/dashboard')
        return
      }

      setUsuario(usuarioData)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleAlterarSenha() {
    if (!usuario) return

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setMensagem('Todos os campos são obrigatórios')
      setTipoMensagem('erro')
      return
    }

    if (novaSenha.length < 6) {
      setMensagem('A nova senha deve ter pelo menos 6 caracteres')
      setTipoMensagem('erro')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem('A nova senha e a confirmação não coincidem')
      setTipoMensagem('erro')
      return
    }

    setAlterandoSenha(true)
    setMensagem('')

    try {
      // Primeiro, verificar se a senha atual está correta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: senhaAtual
      })

      if (signInError) {
        setMensagem('Senha atual incorreta')
        setTipoMensagem('erro')
        return
      }

      // Alterar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha
      })

      if (updateError) {
        setMensagem('Erro ao alterar senha: ' + updateError.message)
        setTipoMensagem('erro')
        return
      }

      setMensagem('Senha alterada com sucesso!')
      setTipoMensagem('sucesso')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setMensagem('Erro interno ao alterar senha')
      setTipoMensagem('erro')
    } finally {
      setAlterandoSenha(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Carregando...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '1px solid #374151'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 8px 0'
          }}>
            Minha Conta - {usuario?.nome_negocio || 'Estética'}
          </h1>
          <p style={{
            color: '#9ca3af',
            margin: 0,
            fontSize: '16px'
          }}>
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/dashboard/estetica')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          >
            Voltar ao Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Informações do Usuário */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 20px 0'
          }}>
            Informações Pessoais
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Nome
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '16px'
              }}>
                {usuario?.nome}
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Email
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '16px'
              }}>
                {usuario?.email}
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Nome do Negócio
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '16px'
              }}>
                {usuario?.nome_negocio}
              </div>
            </div>
          </div>
        </div>

        {/* Alterar Senha */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 20px 0'
          }}>
            Alterar Senha
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Senha Atual
              </label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Digite sua senha atual"
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Nova Senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Digite a nova senha"
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirme a nova senha"
              />
            </div>
            
            {mensagem && (
              <div style={{
                padding: '12px',
                backgroundColor: tipoMensagem === 'sucesso' ? '#065f46' : '#7f1d1d',
                border: `1px solid ${tipoMensagem === 'sucesso' ? '#10b981' : '#ef4444'}`,
                borderRadius: '6px',
                color: tipoMensagem === 'sucesso' ? '#d1fae5' : '#fecaca',
                fontSize: '14px'
              }}>
                {mensagem}
              </div>
            )}
            
            <button
              onClick={handleAlterarSenha}
              disabled={alterandoSenha}
              style={{
                padding: '12px 24px',
                backgroundColor: alterandoSenha ? '#6b7280' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: alterandoSenha ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!alterandoSenha) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
              onMouseOut={(e) => {
                if (!alterandoSenha) {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                }
              }}
            >
              {alterandoSenha ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </div>

        {/* Plano e Assinatura */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #374151'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 20px 0'
          }}>
            Plano e Assinatura
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Plano Atual
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#065f46',
                border: '1px solid #10b981',
                borderRadius: '6px',
                color: '#d1fae5',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Plano Básico - Estética
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Status
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#065f46',
                border: '1px solid #10b981',
                borderRadius: '6px',
                color: '#d1fae5',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Ativo
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#9ca3af',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                Próximo Vencimento
              </label>
              <div style={{
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '16px'
              }}>
                Em breve - Sistema de pagamentos
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#1e3a8a',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              color: '#dbeafe',
              fontSize: '14px'
            }}>
              <strong>Em desenvolvimento:</strong> Em breve você poderá gerenciar sua assinatura, 
              visualizar histórico de pagamentos e alterar planos diretamente aqui.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 