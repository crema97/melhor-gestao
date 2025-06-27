'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Usuario {
  id: string
  nome: string
  email: string
  plano: string
  data_vencimento: string
}

export default function MinhaConta() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [editandoSenha, setEditandoSenha] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>('sucesso')
  const router = useRouter()

  useEffect(() => {
    carregarDadosUsuario()
  }, [])

  async function carregarDadosUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (usuarioData) {
        setUsuario(usuarioData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  async function alterarSenha() {
    if (novaSenha !== confirmarSenha) {
      setMensagem('As senhas não coincidem')
      setTipoMensagem('erro')
      return
    }

    if (novaSenha.length < 6) {
      setMensagem('A nova senha deve ter pelo menos 6 caracteres')
      setTipoMensagem('erro')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      })

      if (error) {
        setMensagem('Erro ao alterar senha: ' + error.message)
        setTipoMensagem('erro')
      } else {
        setMensagem('Senha alterada com sucesso!')
        setTipoMensagem('sucesso')
        setEditandoSenha(false)
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarSenha('')
      }
    } catch (error) {
      setMensagem('Erro ao alterar senha')
      setTipoMensagem('erro')
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  function getStatusPlano(dataVencimento: string) {
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes < 0) {
      return { status: 'Vencido', cor: '#ef4444', dias: Math.abs(diasRestantes) }
    } else if (diasRestantes <= 7) {
      return { status: 'Vence em breve', cor: '#f59e0b', dias: diasRestantes }
    } else {
      return { status: 'Ativo', cor: '#10b981', dias: diasRestantes }
    }
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
            Carregando...
          </p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1f2937', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#e5e7eb', fontSize: '18px' }}>
            Usuário não encontrado
          </p>
        </div>
      </div>
    )
  }

  const statusPlano = getStatusPlano(usuario.data_vencimento)

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
                Minha Conta
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '4px', 
                fontSize: '14px',
                margin: 0
              }}>
                Gerencie suas informações e assinatura
              </p>
            </div>
            <Link 
              href="/dashboard/estacionamento"
              style={{
                padding: '10px 16px',
                backgroundColor: '#374151',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* Informações do Usuário */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '8px', 
          padding: '24px',
          border: '1px solid #374151',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: '0 0 20px 0'
          }}>
            Informações Pessoais
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ 
                color: '#d1d5db', 
                fontSize: '14px', 
                fontWeight: '500',
                display: 'block',
                marginBottom: '4px'
              }}>
                Nome
              </label>
              <p style={{ 
                color: '#ffffff', 
                fontSize: '16px',
                margin: 0,
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px'
              }}>
                {usuario.nome}
              </p>
            </div>
            
            <div>
              <label style={{ 
                color: '#d1d5db', 
                fontSize: '14px', 
                fontWeight: '500',
                display: 'block',
                marginBottom: '4px'
              }}>
                E-mail
              </label>
              <p style={{ 
                color: '#ffffff', 
                fontSize: '16px',
                margin: 0,
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px'
              }}>
                {usuario.email}
              </p>
            </div>
          </div>
        </div>

        {/* Plano e Assinatura */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '8px', 
          padding: '24px',
          border: '1px solid #374151',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: '0 0 20px 0'
          }}>
            Plano e Assinatura
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#374151',
              borderRadius: '8px'
            }}>
              <div>
                <p style={{ 
                  color: '#ffffff', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: '0 0 4px 0'
                }}>
                  Plano Atual
                </p>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  {usuario.plano || 'Plano Básico'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  color: statusPlano.cor, 
                  fontSize: '14px', 
                  fontWeight: '600',
                  padding: '4px 8px',
                  backgroundColor: statusPlano.cor + '20',
                  borderRadius: '4px'
                }}>
                  {statusPlano.status}
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#374151',
              borderRadius: '8px'
            }}>
              <div>
                <p style={{ 
                  color: '#ffffff', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: '0 0 4px 0'
                }}>
                  Data de Vencimento
                </p>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  {formatarData(usuario.data_vencimento)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  color: statusPlano.cor, 
                  fontSize: '14px', 
                  fontWeight: '600',
                  margin: 0
                }}>
                  {statusPlano.dias} {statusPlano.dias === 1 ? 'dia' : 'dias'} {statusPlano.dias < 0 ? 'atrasado' : 'restantes'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Botão de Renovação (futuro) */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              Renovar Assinatura (Em breve)
            </button>
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
            Segurança
          </h2>
          
          {!editandoSenha ? (
            <button
              onClick={() => setEditandoSenha(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Alterar Senha
            </button>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  display: 'block',
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
                    fontSize: '14px'
                  }}
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <label style={{ 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  display: 'block',
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
                    fontSize: '14px'
                  }}
                  placeholder="Confirme a nova senha"
                />
              </div>
              
              {mensagem && (
                <div style={{ 
                  padding: '12px',
                  backgroundColor: tipoMensagem === 'sucesso' ? '#10b981' : '#ef4444',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {mensagem}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={alterarSenha}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Salvar Nova Senha
                </button>
                <button
                  onClick={() => {
                    setEditandoSenha(false)
                    setNovaSenha('')
                    setConfirmarSenha('')
                    setMensagem('')
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
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