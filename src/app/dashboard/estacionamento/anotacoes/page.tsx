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
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!usuario) {
        router.push('/login')
        return
      }
      await loadData(usuario.id)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  async function loadData(usuarioId: string) {
    try {
      setLoading(true)
      const { data: anotacoesData } = await supabase
        .from('anotacoes')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('data_anotacao', { ascending: false })
      setAnotacoes((anotacoesData as unknown as Anotacao[]) || [])
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
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!usuario) return
      const anotacaoData = {
        usuario_id: usuario.id,
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        categoria: formData.categoria || null,
        importante: formData.importante,
        data_anotacao: formData.data_anotacao
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
      await loadData(usuario.id)
      setFormData({
        titulo: '',
        conteudo: '',
        categoria: '',
        importante: false,
        data_anotacao: ''
      })
      setShowForm(false)
      setEditingAnotacao(null)
    } catch (error) {
      console.error('Erro ao salvar anotação:', error)
      alert('Erro ao salvar anotação. Tente novamente.')
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
      
      // Recarregar dados
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (usuario) {
          await loadData(usuario.id)
        }
      }
    } catch (error) {
      console.error('Erro ao excluir anotação:', error)
      alert('Erro ao excluir anotação. Tente novamente.')
    }
  }

  function handleEdit(anotacao: Anotacao) {
    setFormData({
      titulo: anotacao.titulo,
      conteudo: anotacao.conteudo,
      categoria: anotacao.categoria || '',
      importante: anotacao.importante,
      data_anotacao: anotacao.data_anotacao
    })
    setEditingAnotacao(anotacao)
    setShowForm(true)
  }

  function handleCancel() {
    setFormData({
      titulo: '',
      conteudo: '',
      categoria: '',
      importante: false,
      data_anotacao: ''
    })
    setShowForm(false)
    setEditingAnotacao(null)
  }

  const anotacoesImportantes = anotacoes.filter(a => a.importante)
  const anotacoesNormais = anotacoes.filter(a => !a.importante)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #374151',
            borderTop: '4px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#d1d5db' }}>Carregando anotações...</p>
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
                href="/dashboard/estacionamento"
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
                  value={formData.data_anotacao}
                  onChange={e => setFormData({ ...formData, data_anotacao: e.target.value })}
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
                  placeholder="Título da anotação"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
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
                  Conteúdo
                </label>
                <textarea
                  placeholder="Conteúdo da anotação..."
                  value={formData.conteudo}
                  onChange={e => setFormData({ ...formData, conteudo: e.target.value })}
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
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#374151',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  {editingAnotacao ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Anotações Importantes */}
        {anotacoesImportantes.length > 0 && (
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px',
            border: '1px solid #374151',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid #374151', 
              backgroundColor: '#f59e0b' 
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Anotações Importantes
              </h2>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {anotacoesImportantes.map((anotacao) => (
                  <div key={anotacao.id} style={{ 
                    backgroundColor: '#374151',
                    borderRadius: '8px',
                    padding: '24px',
                    border: '1px solid #4b5563',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => handleEdit(anotacao)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(anotacao.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      marginBottom: '12px',
                      margin: '0 0 12px 0',
                      paddingRight: '80px'
                    }}>
                            {anotacao.titulo}
                    </h3>
                    
                            {anotacao.categoria && (
                      <div style={{ 
                        display: 'inline-block',
                        backgroundColor: '#f59e0b',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '12px'
                      }}>
                        {anotacao.categoria}
                      </div>
                    )}
                    
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#9ca3af',
                      marginBottom: '16px',
                      margin: '0 0 16px 0'
                    }}>
                      {anotacao.data_anotacao && new Date(anotacao.data_anotacao).toLocaleDateString('pt-BR')}
                    </p>
                    
                    <p style={{ 
                      fontSize: '16px', 
                      color: '#d1d5db',
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
                    </div>
        )}

        {/* Todas as Anotações */}
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
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              margin: 0
            }}>
              Todas as Anotações
            </h2>
          </div>
          
          <div style={{ padding: '24px' }}>
            {anotacoesNormais.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {anotacoesNormais.map((anotacao) => (
                  <div key={anotacao.id} style={{ 
                    backgroundColor: '#374151',
                    borderRadius: '8px',
                    padding: '24px',
                    border: '1px solid #4b5563',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => handleEdit(anotacao)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(anotacao.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      marginBottom: '12px',
                      margin: '0 0 12px 0',
                      paddingRight: '80px'
                    }}>
                      {anotacao.titulo}
                    </h3>
                    
                    {anotacao.categoria && (
                      <div style={{ 
                        display: 'inline-block',
                        backgroundColor: '#6b7280',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '12px'
                      }}>
                        {anotacao.categoria}
                      </div>
                    )}
                    
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#9ca3af',
                      marginBottom: '16px',
                      margin: '0 0 16px 0'
                    }}>
                      {anotacao.data_anotacao && new Date(anotacao.data_anotacao).toLocaleDateString('pt-BR')}
                    </p>
                    
                    <p style={{ 
                      fontSize: '16px', 
                      color: '#d1d5db',
                      lineHeight: '1.6',
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {anotacao.conteudo}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ 
                  fontSize: '18px', 
                  color: '#9ca3af', 
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>
                  Nenhuma anotação registrada
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                >
                  Criar Primeira Anotação
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 