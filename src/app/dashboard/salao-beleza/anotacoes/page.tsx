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
  data_criacao: string
  data_atualizacao?: string
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
    data_anotacao: new Date().toISOString().split('T')[0]
  })
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

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

      setUsuarioId(usuario.id)
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
        .order('data_criacao', { ascending: false })

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
    
    if (!usuarioId) return

    try {
      const anotacaoData = {
        usuario_id: usuarioId,
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        categoria: formData.categoria,
        importante: formData.importante,
        data_anotacao: formData.data_anotacao
      }

      if (editingAnotacao) {
        const { error } = await supabase
          .from('anotacoes')
          .update({
            ...anotacaoData,
            data_atualizacao: new Date().toISOString()
          })
          .eq('id', editingAnotacao.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('anotacoes')
          .insert(anotacaoData)

        if (error) throw error
      }

      setFormData({
        titulo: '',
        conteudo: '',
        categoria: '',
        importante: false,
        data_anotacao: new Date().toISOString().split('T')[0]
      })
      setShowForm(false)
      setEditingAnotacao(null)
      await loadAnotacoes(usuarioId)
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

      await loadAnotacoes(usuarioId!)
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
      data_anotacao: new Date().toISOString().split('T')[0]
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
                href="/dashboard/salao-beleza"
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
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
              >
                + Nova Anotação
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 32px' }}>
        {/* Form */}
        {showForm && (
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
                <label htmlFor="importante" style={{ 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
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
                  Conteúdo
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
                  placeholder="Conteúdo da anotação"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#9CA3AF',
                    border: '1px solid #4b5563',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#ca8a04',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {editingAnotacao ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Anotações List */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          border: '1px solid #374151',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: '0' }}>
              Lista de Anotações
            </h3>
          </div>

          {anotacoes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: '16px' }}>
                Nenhuma anotação encontrada.
              </p>
            </div>
          ) : (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                {anotacoes.map((anotacao) => (
                  <div
                    key={anotacao.id}
                    style={{
                      backgroundColor: anotacao.importante ? '#7c2d12' : '#374151',
                      padding: '20px',
                      borderRadius: '8px',
                      border: anotacao.importante ? '1px solid #ea580c' : '1px solid #4b5563'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ 
                          color: '#ffffff', 
                          fontSize: '18px', 
                          fontWeight: '600', 
                          margin: '0 0 8px 0' 
                        }}>
                          {anotacao.titulo}
                        </h4>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{ 
                            color: '#9CA3AF', 
                            fontSize: '14px' 
                          }}>
                            {new Date(anotacao.data_anotacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          {anotacao.categoria && (
                            <span style={{
                              backgroundColor: '#1f2937',
                              color: '#d1d5db',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {anotacao.categoria}
                            </span>
                          )}
                          {anotacao.importante && (
                            <span style={{
                              backgroundColor: '#ea580c',
                              color: '#ffffff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              IMPORTANTE
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(anotacao)}
                          style={{
                            backgroundColor: '#3B82F6',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(anotacao.id)}
                          style={{
                            backgroundColor: '#EF4444',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <p style={{ 
                      color: '#d1d5db', 
                      fontSize: '14px', 
                      lineHeight: '1.6',
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {anotacao.conteudo}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 