'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Anotacao {
  id: string
  titulo: string
  conteudo: string
  categoria?: string
  importante: boolean
  data_anotacao: string
  created_at: string
}

export default function AnotacoesPage() {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAnotacao, setEditingAnotacao] = useState<Anotacao | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    categoria: '',
    importante: false,
    data_anotacao: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [checkUserAndLoadData])

  async function checkUserAndLoadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!usuario) {
        router.push('/login')
        return
      }

      await loadAnotacoes(usuario.id)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  async function loadAnotacoes(usuarioId: string) {
    try {
      const { data, error } = await supabase
        .from('anotacoes')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('data_anotacao', { ascending: false })

      if (error) throw error
      setAnotacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar anotações:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!usuario) return

      const anotacaoData = {
        usuario_id: usuario.id,
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        categoria: formData.categoria || null,
        importante: formData.importante,
        data_anotacao: formData.data_anotacao || new Date().toISOString().split('T')[0]
      }

      if (editingAnotacao) {
        const { error } = await supabase
          .from('anotacoes')
          .update(anotacaoData)
          .eq('id', editingAnotacao.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('anotacoes')
          .insert([anotacaoData])

        if (error) throw error
      }

      setFormData({
        titulo: '',
        conteudo: '',
        categoria: '',
        importante: false,
        data_anotacao: ''
      })
      setShowForm(false)
      setEditingAnotacao(null)
      await loadAnotacoes(usuario.id)
    } catch (error) {
      console.error('Erro ao salvar anotação:', error)
      alert('Erro ao salvar anotação')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return

    try {
      const { error } = await supabase
        .from('anotacoes')
        .delete()
        .eq('id', id)

      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (usuario) {
          await loadAnotacoes(usuario.id)
        }
      }
    } catch (error) {
      console.error('Erro ao excluir anotação:', error)
      alert('Erro ao excluir anotação')
    }
  }

  function handleEdit(anotacao: Anotacao) {
    setEditingAnotacao(anotacao)
    setFormData({
      titulo: anotacao.titulo,
      conteudo: anotacao.conteudo,
      categoria: anotacao.categoria || '',
      importante: anotacao.importante,
      data_anotacao: anotacao.data_anotacao
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingAnotacao(null)
    setFormData({
      titulo: '',
      conteudo: '',
      categoria: '',
      importante: false,
      data_anotacao: ''
    })
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
            Carregando anotações...
          </p>
        </div>
      </div>
    )
  }

  return (
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
                Anotações
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '8px', 
                fontSize: '18px',
                margin: 0
              }}>
                Gerencie suas anotações
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link 
                href="/dashboard/barbearia"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#374151',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              >
                ← Voltar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Form */}
        {showForm && (
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151',
            marginBottom: '32px'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              {editingAnotacao ? 'Editar Anotação' : 'Nova Anotação'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ 
              display: 'grid !important', 
              gridTemplateColumns: '1fr !important', 
              gap: '24px',
              width: '100%'
            }}>
              <div style={{ minWidth: '0', width: '100%' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_anotacao}
                  onChange={(e) => setFormData({ ...formData, data_anotacao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ minWidth: '0', width: '100%' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                  placeholder="Título da anotação"
                />
              </div>

              <div style={{ minWidth: '0', width: '100%' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                  placeholder="Categoria (opcional)"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="importante"
                  checked={formData.importante}
                  onChange={(e) => setFormData({ ...formData, importante: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#ca8a04'
                  }}
                />
                <label 
                  htmlFor="importante"
                  style={{ 
                    color: '#d1d5db', 
                    fontSize: '16px', 
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Marcar como importante
                </label>
              </div>

              <div style={{ minWidth: '0', width: '100%' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Conteúdo *
                </label>
                <textarea
                  required
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px',
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  placeholder="Conteúdo da anotação..."
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ca8a04',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
                >
                  {editingAnotacao ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Botão Nova Anotação */}
        {!showForm && (
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ca8a04',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
            >
              + Nova Anotação
            </button>
          </div>
        )}

        {/* Anotações List */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '8px',
          border: '1px solid #374151',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '24px', 
            borderBottom: '1px solid #374151', 
            backgroundColor: '#374151' 
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              margin: 0
            }}>
              Lista de Anotações ({anotacoes.length})
            </h3>
          </div>
          
          <div style={{ padding: '24px' }}>
            {anotacoes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {anotacoes.map((anotacao) => (
                  <div key={anotacao.id} style={{ 
                    padding: '24px', 
                    backgroundColor: '#374151', 
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    borderLeft: anotacao.importante ? '4px solid #ca8a04' : '1px solid #4b5563'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            color: '#ffffff',
                            margin: 0
                          }}>
                            {anotacao.titulo}
                          </h4>
                          {anotacao.importante && (
                            <span style={{ 
                              padding: '4px 12px', 
                              backgroundColor: '#ca8a04', 
                              color: 'white', 
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              Importante
                            </span>
                          )}
                        </div>
                        {anotacao.categoria && (
                          <span style={{ 
                            padding: '4px 12px', 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500',
                            marginRight: '12px'
                          }}>
                            {anotacao.categoria}
                          </span>
                        )}
                        <p style={{ 
                          color: '#d1d5db', 
                          fontSize: '14px',
                          margin: '8px 0 0 0'
                        }}>
                          {new Date(anotacao.data_anotacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(anotacao)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(anotacao.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: '#1f2937', 
                      padding: '16px', 
                      borderRadius: '6px',
                      border: '1px solid #374151'
                    }}>
                      <p style={{ 
                        color: '#e5e7eb', 
                        fontSize: '16px',
                        lineHeight: '1.6',
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {anotacao.conteudo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#ca8a04',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p style={{ color: '#d1d5db', fontSize: '18px', margin: 0 }}>
                  Nenhuma anotação registrada
                </p>
                <p style={{ color: '#9ca3af', fontSize: '16px', marginTop: '8px', margin: '8px 0 0 0' }}>
                  Clique em &quot;Nova Anotação&quot; para começar
                </p>
              </div>
            )}
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