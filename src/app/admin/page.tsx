'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminProtected from '@/components/AdminProtected'

interface TipoNegocio {
  id: string
  nome: string
}

interface Usuario {
  nome: string
  email: string
  nome_negocio: string
  data_cadastro?: string
  data_vencimento?: string
  status_pagamento?: string
  plano?: string
}

export default function AdminDashboard() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    nome_negocio: '',
    tipo_negocio_id: '',
    plano: 'mensal'
  })

  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletando, setDeletando] = useState<string | null>(null)

  useEffect(() => {
    fetchTipos()
    fetchUsuarios()
  }, [])

  async function fetchTipos() {
    const { data } = await supabase.from('tipos_negocio').select('*')
    if (data) {
      setTiposNegocio(data)
    }
  }

  async function fetchUsuarios() {
    const { data } = await supabase.from('usuarios').select('nome, email, nome_negocio, data_cadastro, data_vencimento, status_pagamento, plano')
    if (data) {
      setUsuarios(data)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)

    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      })

      const result = await response.json()

      if (!response.ok) {
        alert('Erro ao criar usuário: ' + result.error)
        setCarregando(false)
        return
      }

      setForm({ nome: '', email: '', senha: '', nome_negocio: '', tipo_negocio_id: '', plano: 'mensal' })
      await fetchUsuarios()
      setCarregando(false)
      alert(`Cliente cadastrado com sucesso! Vencimento: ${result.vencimento}`)

    } catch (error) {
      console.error('Erro geral:', error)
      alert('Erro inesperado: ' + error)
      setCarregando(false)
    }
  }

  async function handleDeleteUser(email: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setDeletando(email)

    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (!response.ok) {
        alert('Erro ao deletar usuário: ' + result.error)
        setDeletando(null)
        return
      }

      await fetchUsuarios()
      setDeletando(null)
      alert('Cliente excluído com sucesso!')

    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      alert('Erro inesperado ao deletar usuário')
      setDeletando(null)
    }
  }

  function formatarData(data: string | undefined) {
    if (!data) return 'N/A'
    try {
      const dataObj = new Date(data)
      return dataObj.toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  function getStatusColor(status: string | undefined) {
    switch (status) {
      case 'ativo': return '#10b981'
      case 'pendente': return '#f59e0b'
      case 'cancelado': return '#ef4444'
      default: return '#6b7280'
    }
  }

  function getStatusText(status: string | undefined) {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'pendente': return 'Pendente'
      case 'cancelado': return 'Cancelado'
      default: return 'N/A'
    }
  }

  function isVencido(dataVencimento: string | undefined) {
    if (!dataVencimento) return false
    return new Date(dataVencimento) < new Date()
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

  return (
    <AdminProtected>
      <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderBottom: '1px solid #374151',
          padding: '32px 0'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ 
                  fontSize: '30px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                  Painel Administrativo
                </h1>
                <p style={{ 
                  color: '#d1d5db', 
                  marginTop: '8px', 
                  fontSize: '18px',
                  margin: 0
                }}>
                  Gerenciamento de clientes e mensalidades
                </p>
              </div>
              <div style={{ 
                padding: '12px 24px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                {usuarios.length} Clientes
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px', 
            marginBottom: '48px' 
          }}>
            <div style={{ 
              backgroundColor: '#1f2937', 
              borderRadius: '8px', 
              padding: '32px',
              border: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#8b5cf6', 
                  borderRadius: '8px',
                  marginRight: '24px'
                }}>
                  <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                    Total de Clientes
                  </p>
                  <p style={{ 
                    fontSize: '30px', 
                    fontWeight: 'bold', 
                    color: '#ffffff',
                    margin: 0
                  }}>
                    {usuarios.length}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#1f2937', 
              borderRadius: '8px', 
              padding: '32px',
              border: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '8px',
                  marginRight: '24px'
                }}>
                  <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                    Clientes Ativos
                  </p>
                  <p style={{ 
                    fontSize: '30px', 
                    fontWeight: 'bold', 
                    color: '#ffffff',
                    margin: 0
                  }}>
                    {usuarios.filter(u => u.status_pagamento === 'ativo').length}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#1f2937', 
              borderRadius: '8px', 
              padding: '32px',
              border: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f59e0b', 
                  borderRadius: '8px',
                  marginRight: '24px'
                }}>
                  <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                    Vencendo em 7 dias
                  </p>
                  <p style={{ 
                    fontSize: '30px', 
                    fontWeight: 'bold', 
                    color: '#ffffff',
                    margin: 0
                  }}>
                    {usuarios.filter(u => {
                      if (!u.data_vencimento) return false
                      const vencimento = new Date(u.data_vencimento)
                      const hoje = new Date()
                      const diffTime = vencimento.getTime() - hoje.getTime()
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      return diffDays <= 7 && diffDays > 0
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151',
            marginBottom: '48px'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Cadastrar Novo Cliente
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Nome Completo
                </label>
          <input
            type="text"
                  placeholder="Digite o nome completo"
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
            required
          />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Email
                </label>
          <input
            type="email"
                  placeholder="Digite o email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
            required
          />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Senha
                </label>
          <input
            type="password"
                  placeholder="Digite a senha"
            value={form.senha}
            onChange={e => setForm({ ...form, senha: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
            required
          />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Nome do Negócio
                </label>
          <input
            type="text"
                  placeholder="Digite o nome do negócio"
            value={form.nome_negocio}
            onChange={e => setForm({ ...form, nome_negocio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
            required
          />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Tipo de Negócio
                </label>
          <select
            value={form.tipo_negocio_id}
            onChange={e => setForm({ ...form, tipo_negocio_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
            required
          >
            <option value="">Selecione o tipo de negócio</option>
            {tiposNegocio.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Plano de Pagamento
                </label>
                <select
                  value={form.plano}
                  onChange={e => setForm({ ...form, plano: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                  required
                >
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
          <button
            type="submit"
            disabled={carregando}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    backgroundColor: carregando ? '#6b7280' : '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: carregando ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#7c3aed')}
                  onMouseOut={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#8b5cf6')}
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
              </div>
        </form>
          </div>

          {/* Users List Section */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Clientes Cadastrados
            </h2>

            {usuarios.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px', 
                color: '#9ca3af',
                fontSize: '18px' 
              }}>
                Nenhum cliente cadastrado ainda
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '20px' 
              }}>
          {usuarios.map((u, i) => (
                  <div key={i} style={{ 
                    backgroundColor: '#374151', 
                    borderRadius: '8px', 
                    padding: '24px',
                    border: '1px solid #4b5563',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: '#8b5cf6', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px'
                      }}>
                        <span style={{ 
                          color: 'white', 
                          fontSize: '20px', 
                          fontWeight: 'bold' 
                        }}>
                          {u.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          color: '#ffffff', 
                          fontSize: '18px', 
                          fontWeight: '600',
                          margin: '0 0 4px 0'
                        }}>
                          {u.nome}
                        </h3>
                        <p style={{ 
                          color: '#d1d5db', 
                          fontSize: '14px',
                          margin: 0
                        }}>
                          {u.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(u.email, u.nome)}
                        disabled={deletando === u.email}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: deletando === u.email ? '#6b7280' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: deletando === u.email ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseOver={(e) => deletando !== u.email && (e.currentTarget.style.backgroundColor = '#b91c1c')}
                        onMouseOut={(e) => deletando !== u.email && (e.currentTarget.style.backgroundColor = '#dc2626')}
                      >
                        {deletando === u.email ? (
                          <>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              border: '2px solid #ffffff',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Excluir
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        backgroundColor: '#1f2937', 
                        borderRadius: '6px',
                        border: '1px solid #4b5563'
                      }}>
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}>
                          Negócio
                        </p>
                        <p style={{ 
                          color: '#ffffff', 
                          fontSize: '16px',
                          margin: 0
                        }}>
                          {u.nome_negocio}
                        </p>
                      </div>

                      <div style={{ 
                        padding: '12px 16px', 
                        backgroundColor: '#1f2937', 
                        borderRadius: '6px',
                        border: '1px solid #4b5563'
                      }}>
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}>
                          Plano
                        </p>
                        <p style={{ 
                          color: '#ffffff', 
                          fontSize: '16px',
                          margin: 0,
                          textTransform: 'capitalize'
                        }}>
                          {u.plano || 'Mensal'}
                        </p>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        backgroundColor: '#1f2937', 
                        borderRadius: '6px',
                        border: '1px solid #4b5563'
                      }}>
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}>
                          Cadastro
                        </p>
                        <p style={{ 
                          color: '#ffffff', 
                          fontSize: '16px',
                          margin: 0
                        }}>
                          {formatarData(u.data_cadastro)}
                        </p>
                      </div>

                      <div style={{ 
                        padding: '12px 16px', 
                        backgroundColor: '#1f2937', 
                        borderRadius: '6px',
                        border: '1px solid #4b5563'
                      }}>
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}>
                          Vencimento
                        </p>
                        <p style={{ 
                          color: isVencido(u.data_vencimento) ? '#ef4444' : '#ffffff', 
                          fontSize: '16px',
                          margin: 0,
                          fontWeight: isVencido(u.data_vencimento) ? '600' : '400'
                        }}>
                          {formatarData(u.data_vencimento)}
                        </p>
                      </div>
                    </div>

                    <div style={{ 
                      padding: '12px 16px', 
                      backgroundColor: '#1f2937', 
                      borderRadius: '6px',
                      border: '1px solid #4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}>
                          Status
                        </p>
                        <p style={{ 
                          color: getStatusColor(u.status_pagamento), 
                          fontSize: '16px',
                          margin: 0,
                          fontWeight: '600'
                        }}>
                          {getStatusText(u.status_pagamento)}
                        </p>
                      </div>
                      {isVencido(u.data_vencimento) && (
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          VENCIDO
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtected>
  )
} 