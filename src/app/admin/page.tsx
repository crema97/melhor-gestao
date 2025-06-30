'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import AdminProtected from '@/components/AdminProtected'

interface TipoNegocio {
  id: string
  nome: string
}

interface Categoria {
  id: string
  nome: string
  tipo_negocio_id: string
}

interface CategoriasDisponiveis {
  receitas: Categoria[]
  despesas: Categoria[]
}

interface Usuario {
  id: string
  nome: string
  email: string
  user_id: string
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

  const [editPasswordForm, setEditPasswordForm] = useState({
    email: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletando, setDeletando] = useState<string | null>(null)

  // Estados para categorias
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<CategoriasDisponiveis>({
    receitas: [],
    despesas: []
  })
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<{
    receitas: string[]
    despesas: string[]
  }>({
    receitas: [],
    despesas: []
  })
  const [carregandoCategorias, setCarregandoCategorias] = useState(false)

  // Estados para edição de categorias de clientes
  const [showEditCategoriasModal, setShowEditCategoriasModal] = useState(false)
  const [editandoUsuario, setEditandoUsuario] = useState<{ id: string, nome: string } | null>(null)
  const [categoriasEditaveis, setCategoriasEditaveis] = useState<CategoriasDisponiveis>({
    receitas: [],
    despesas: []
  })
  const [categoriasSelecionadasEdit, setCategoriasSelecionadasEdit] = useState<{
    receitas: string[]
    despesas: string[]
  }>({
    receitas: [],
    despesas: []
  })
  const [carregandoCategoriasEdit, setCarregandoCategoriasEdit] = useState(false)
  const [salvandoCategorias, setSalvandoCategorias] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchTipos()
    fetchUsuarios()
  }, [])

  // Carregar categorias quando o tipo de negócio mudar
  useEffect(() => {
    if (form.tipo_negocio_id) {
      carregarCategorias(form.tipo_negocio_id)
    }
  }, [form.tipo_negocio_id])

  async function fetchTipos() {
    const { data } = await supabase.from('tipos_negocio').select('*')
    if (data) {
      setTiposNegocio(data)
    }
  }

  async function fetchUsuarios() {
    const { data } = await supabase.from('usuarios').select('id, nome, email, user_id, nome_negocio, data_cadastro, data_vencimento, status_pagamento, plano')
    if (data) {
      setUsuarios(data)
    }
    setLoading(false)
  }

  // Função para carregar categorias por tipo de negócio
  async function carregarCategorias(tipoNegocioId: string) {
    console.log('carregarCategorias chamada com tipoNegocioId:', tipoNegocioId)
    
    if (!tipoNegocioId) {
      console.log('Tipo de negócio vazio, limpando categorias')
      setCategoriasDisponiveis({ receitas: [], despesas: [] })
      setCategoriasSelecionadas({ receitas: [], despesas: [] })
      return
    }

    setCarregandoCategorias(true)
    try {
      const url = `/api/admin/categorias-por-tipo-alternativa?tipo=${tipoNegocioId}`
      console.log('Fazendo requisição para:', url)
      
      const response = await fetch(url)
      const data = await response.json()

      console.log('Resposta da API:', data)
      console.log('Status da resposta:', response.status)

      if (response.ok) {
        setCategoriasDisponiveis({
          receitas: data.receitas || [],
          despesas: data.despesas || []
        })
        
        // Pré-selecionar todas as categorias por padrão
        setCategoriasSelecionadas({
          receitas: data.receitas?.map((cat: Categoria) => cat.id) || [],
          despesas: data.despesas?.map((cat: Categoria) => cat.id) || []
        })
        
        console.log('Categorias carregadas com sucesso')
      } else {
        console.error('Erro ao carregar categorias:', data.error)
        setCategoriasDisponiveis({ receitas: [], despesas: [] })
        setCategoriasSelecionadas({ receitas: [], despesas: [] })
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategoriasDisponiveis({ receitas: [], despesas: [] })
      setCategoriasSelecionadas({ receitas: [], despesas: [] })
    } finally {
      setCarregandoCategorias(false)
    }
  }

  // Função para alternar seleção de categoria de receita
  function toggleCategoriaReceita(categoriaId: string) {
    setCategoriasSelecionadas(prev => ({
      ...prev,
      receitas: prev.receitas.includes(categoriaId)
        ? prev.receitas.filter(id => id !== categoriaId)
        : [...prev.receitas, categoriaId]
    }))
  }

  // Função para alternar seleção de categoria de despesa
  function toggleCategoriaDespesa(categoriaId: string) {
    setCategoriasSelecionadas(prev => ({
      ...prev,
      despesas: prev.despesas.includes(categoriaId)
        ? prev.despesas.filter(id => id !== categoriaId)
        : [...prev.despesas, categoriaId]
    }))
  }

  // Função para selecionar/deselecionar todas as categorias de receita
  function toggleTodasReceitas() {
    const todasSelecionadas = categoriasDisponiveis.receitas.length === categoriasSelecionadas.receitas.length
    setCategoriasSelecionadas(prev => ({
      ...prev,
      receitas: todasSelecionadas ? [] : categoriasDisponiveis.receitas.map(cat => cat.id)
    }))
  }

  // Função para selecionar/deselecionar todas as categorias de despesa
  function toggleTodasDespesas() {
    const todasSelecionadas = categoriasDisponiveis.despesas.length === categoriasSelecionadas.despesas.length
    setCategoriasSelecionadas(prev => ({
      ...prev,
      despesas: todasSelecionadas ? [] : categoriasDisponiveis.despesas.map(cat => cat.id)
    }))
  }

  // Funções para edição de categorias de clientes
  async function handleEditCategorias(usuario: { id: string, nome: string }) {
    setEditandoUsuario({ id: usuario.id, nome: usuario.nome })
    setShowEditCategoriasModal(true)
    await carregarCategoriasParaEdicao(usuario.id)
  }

  async function carregarCategoriasParaEdicao(usuarioId: string) {
    console.log('carregarCategoriasParaEdicao chamada com usuarioId:', usuarioId)
    setCarregandoCategoriasEdit(true)
    try {
      const url = `/api/admin/editar-categorias-cliente?usuario_id=${usuarioId}`
      console.log('Fazendo requisição para:', url)
      
      const response = await fetch(url)
      console.log('Status da resposta:', response.status)
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Dados recebidos:', data)

      if (response.ok) {
        console.log('Resposta OK, configurando categorias...')
        setCategoriasEditaveis({
          receitas: data.categoriasDisponiveis?.receitas || [],
          despesas: data.categoriasDisponiveis?.despesas || []
        })
        
        setCategoriasSelecionadasEdit({
          receitas: data.categoriasAtivas?.receitas || [],
          despesas: data.categoriasAtivas?.despesas || []
        })
        
        console.log('Categorias configuradas com sucesso')
      } else {
        console.error('Erro na resposta:', data)
        console.error('Status:', response.status)
        alert('Erro ao carregar categorias do cliente: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      alert('Erro ao carregar categorias do cliente: ' + error)
    } finally {
      setCarregandoCategoriasEdit(false)
    }
  }

  async function salvarCategoriasEditadas() {
    if (!editandoUsuario) return

    setSalvandoCategorias(true)
    try {
      const response = await fetch('/api/admin/editar-categorias-cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: editandoUsuario.id,
          categoriasSelecionadas: categoriasSelecionadasEdit
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert('Erro ao salvar categorias: ' + result.error)
        setSalvandoCategorias(false)
        return
      }

      alert('Categorias atualizadas com sucesso!')
      setShowEditCategoriasModal(false)
      setEditandoUsuario(null)
      setCategoriasEditaveis({ receitas: [], despesas: [] })
      setCategoriasSelecionadasEdit({ receitas: [], despesas: [] })

    } catch (error) {
      console.error('Erro ao salvar categorias:', error)
      alert('Erro inesperado ao salvar categorias')
    } finally {
      setSalvandoCategorias(false)
    }
  }

  function cancelarEdicaoCategorias() {
    setShowEditCategoriasModal(false)
    setEditandoUsuario(null)
    setCategoriasEditaveis({ receitas: [], despesas: [] })
    setCategoriasSelecionadasEdit({ receitas: [], despesas: [] })
  }

  // Funções para alternar seleção de categorias na edição
  function toggleCategoriaReceitaEdit(categoriaId: string) {
    setCategoriasSelecionadasEdit(prev => ({
      ...prev,
      receitas: prev.receitas.includes(categoriaId)
        ? prev.receitas.filter(id => id !== categoriaId)
        : [...prev.receitas, categoriaId]
    }))
  }

  function toggleCategoriaDespesaEdit(categoriaId: string) {
    setCategoriasSelecionadasEdit(prev => ({
      ...prev,
      despesas: prev.despesas.includes(categoriaId)
        ? prev.despesas.filter(id => id !== categoriaId)
        : [...prev.despesas, categoriaId]
    }))
  }

  function toggleTodasReceitasEdit() {
    const todasSelecionadas = categoriasEditaveis.receitas.length === categoriasSelecionadasEdit.receitas.length
    setCategoriasSelecionadasEdit(prev => ({
      ...prev,
      receitas: todasSelecionadas ? [] : categoriasEditaveis.receitas.map(cat => cat.id)
    }))
  }

  function toggleTodasDespesasEdit() {
    const todasSelecionadas = categoriasEditaveis.despesas.length === categoriasSelecionadasEdit.despesas.length
    setCategoriasSelecionadasEdit(prev => ({
      ...prev,
      despesas: todasSelecionadas ? [] : categoriasEditaveis.despesas.map(cat => cat.id)
    }))
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
        body: JSON.stringify({
          ...form,
          categoriasSelecionadas
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert('Erro ao criar usuário: ' + result.error)
        setCarregando(false)
        return
      }

      setForm({ nome: '', email: '', senha: '', nome_negocio: '', tipo_negocio_id: '', plano: 'mensal' })
      setCategoriasSelecionadas({ receitas: [], despesas: [] })
      setCategoriasDisponiveis({ receitas: [], despesas: [] })
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
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return

    console.log('Tentando excluir usuário:', { email, nome })
    setDeletando(email)
    
    try {
      const response = await fetch(`/api/admin/delete-user?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      console.log('Resposta da API de exclusão:', result)

      if (!response.ok) {
        console.error('Erro na resposta:', result)
        alert('Erro ao excluir usuário: ' + (result.error || 'Erro desconhecido'))
        setDeletando(null)
        return
      }

      console.log('Usuário excluído com sucesso')
      await fetchUsuarios()
      alert(result.message || 'Usuário excluído com sucesso!')
      
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro inesperado ao excluir usuário: ' + error)
    } finally {
      setDeletando(null)
    }
  }

  function handleEditPassword(usuario: Usuario) {
    setEditingUser(usuario)
    setEditPasswordForm({
      email: usuario.email,
      novaSenha: '',
      confirmarSenha: ''
    })
    setShowEditPasswordModal(true)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (editPasswordForm.novaSenha !== editPasswordForm.confirmarSenha) {
      alert('As senhas não coincidem!')
      return
    }

    if (editPasswordForm.novaSenha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!')
      return
    }

    setUpdatingPassword(true)

    try {
      const response = await fetch('/api/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: editPasswordForm.email,
          novaSenha: editPasswordForm.novaSenha
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert('Erro ao atualizar senha: ' + result.error)
        setUpdatingPassword(false)
        return
      }

      alert('Senha atualizada com sucesso!')
      setShowEditPasswordModal(false)
      setEditPasswordForm({ email: '', novaSenha: '', confirmarSenha: '' })
      setEditingUser(null)

    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      alert('Erro inesperado ao atualizar senha')
    } finally {
      setUpdatingPassword(false)
    }
  }

  function handleCancelEditPassword() {
    setShowEditPasswordModal(false)
    setEditPasswordForm({ email: '', novaSenha: '', confirmarSenha: '' })
    setEditingUser(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
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
                  Painel Administrativo
                </h1>
                <p style={{ 
                  color: '#d1d5db', 
                  marginTop: '4px', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  Gerencie seus clientes
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
          {/* Create User Form */}
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
              Cadastrar Novo Cliente
            </h2>

            <form onSubmit={handleSubmit} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome"
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

              {/* Seção de Seleção de Categorias */}
              {form.tipo_negocio_id && (
                <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#ffffff',
                    marginBottom: '16px'
                  }}>
                    Categorias Disponíveis para o Cliente
                  </h3>
                  
                  {carregandoCategorias ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px', 
                      color: '#9ca3af' 
                    }}>
                      Carregando categorias...
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '24px' 
                    }}>
                      {/* Categorias de Receita */}
                      <div style={{ 
                        backgroundColor: '#374151', 
                        borderRadius: '8px',
                        padding: '20px',
                        border: '1px solid #4b5563'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#10b981',
                            margin: 0
                          }}>
                            Categorias de Receita
                          </h4>
                          <button
                            type="button"
                            onClick={toggleTodasReceitas}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          >
                            {categoriasDisponiveis.receitas.length === categoriasSelecionadas.receitas.length 
                              ? 'Deselecionar Todas' 
                              : 'Selecionar Todas'
                            }
                          </button>
                        </div>
                        
                        {categoriasDisponiveis.receitas.length === 0 ? (
                          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                            Nenhuma categoria de receita disponível para este tipo de negócio
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categoriasDisponiveis.receitas.map((categoria) => (
                              <label key={categoria.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '4px',
                                backgroundColor: categoriasSelecionadas.receitas.includes(categoria.id) 
                                  ? '#1f2937' 
                                  : 'transparent',
                                transition: 'background-color 0.2s'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={categoriasSelecionadas.receitas.includes(categoria.id)}
                                  onChange={() => toggleCategoriaReceita(categoria.id)}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer'
                                  }}
                                />
                                <span style={{ 
                                  color: '#d1d5db', 
                                  fontSize: '14px',
                                  flex: 1
                                }}>
                                  {categoria.nome}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Categorias de Despesa */}
                      <div style={{ 
                        backgroundColor: '#374151', 
                        borderRadius: '8px',
                        padding: '20px',
                        border: '1px solid #4b5563'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#ef4444',
                            margin: 0
                          }}>
                            Categorias de Despesa
                          </h4>
                          <button
                            type="button"
                            onClick={toggleTodasDespesas}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                          >
                            {categoriasDisponiveis.despesas.length === categoriasSelecionadas.despesas.length 
                              ? 'Deselecionar Todas' 
                              : 'Selecionar Todas'
                            }
                          </button>
                        </div>
                        
                        {categoriasDisponiveis.despesas.length === 0 ? (
                          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                            Nenhuma categoria de despesa disponível para este tipo de negócio
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categoriasDisponiveis.despesas.map((categoria) => (
                              <label key={categoria.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '4px',
                                backgroundColor: categoriasSelecionadas.despesas.includes(categoria.id) 
                                  ? '#1f2937' 
                                  : 'transparent',
                                transition: 'background-color 0.2s'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={categoriasSelecionadas.despesas.includes(categoria.id)}
                                  onChange={() => toggleCategoriaDespesa(categoria.id)}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer'
                                  }}
                                />
                                <span style={{ 
                                  color: '#d1d5db', 
                                  fontSize: '14px',
                                  flex: 1
                                }}>
                                  {categoria.nome}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {usuarios.map((u) => (
                  <div key={u.email} style={{ 
                    backgroundColor: '#374151', 
                    borderRadius: '8px',
                    padding: '24px',
                    border: '1px solid #4b5563'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold', 
                          color: '#ffffff',
                          margin: '0 0 8px 0'
                        }}>
                          {u.nome}
                        </h3>
                        <p style={{ 
                          color: '#d1d5db', 
                          fontSize: '16px',
                          margin: 0
                        }}>
                          {u.email}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditCategorias({ id: u.id, nome: u.nome })}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Editar Categorias
                        </button>
                        <button
                          onClick={() => handleEditPassword(u)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar Senha
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.email, u.nome)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: deletando === u.email ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
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

          {/* Edit Password Modal */}
          {showEditPasswordModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                padding: '32px',
                border: '1px solid #374151',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>
                  Editar Senha do Cliente
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#d1d5db', fontSize: '16px', margin: '0 0 8px 0' }}>
                    <strong>Cliente:</strong> {editingUser?.nome}
                  </p>
                  <p style={{ color: '#d1d5db', fontSize: '16px', margin: 0 }}>
                    <strong>Email:</strong> {editingUser?.email}
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      color: '#d1d5db',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      placeholder="Digite a nova senha"
                      value={editPasswordForm.novaSenha}
                      onChange={e => setEditPasswordForm({ ...editPasswordForm, novaSenha: e.target.value })}
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

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      color: '#d1d5db',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      placeholder="Confirme a nova senha"
                      value={editPasswordForm.confirmarSenha}
                      onChange={e => setEditPasswordForm({ ...editPasswordForm, confirmarSenha: e.target.value })}
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

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleCancelEditPassword}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
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
                      disabled={updatingPassword}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: updatingPassword ? '#6b7280' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: updatingPassword ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => !updatingPassword && (e.currentTarget.style.backgroundColor = '#2563eb')}
                      onMouseOut={(e) => !updatingPassword && (e.currentTarget.style.backgroundColor = '#3b82f6')}
                    >
                      {updatingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Categories Modal */}
          {showEditCategoriasModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                padding: '32px',
                border: '1px solid #374151',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>
                  Editar Categorias do Cliente
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#d1d5db', fontSize: '16px', margin: 0 }}>
                    <strong>Cliente:</strong> {editandoUsuario?.nome}
                  </p>
                </div>

                {carregandoCategoriasEdit ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '48px', 
                    color: '#9ca3af',
                    fontSize: '18px' 
                  }}>
                    Carregando categorias...
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Categorias de Receita */}
                    <div style={{ 
                      backgroundColor: '#374151', 
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #4b5563'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#10b981',
                          margin: 0
                        }}>
                          Categorias de Receita
                        </h4>
                        <button
                          type="button"
                          onClick={toggleTodasReceitasEdit}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                          {categoriasEditaveis.receitas.length === categoriasSelecionadasEdit.receitas.length 
                            ? 'Deselecionar Todas' 
                            : 'Selecionar Todas'
                          }
                        </button>
                      </div>
                      
                      {categoriasEditaveis.receitas.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                          Nenhuma categoria de receita disponível
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {categoriasEditaveis.receitas.map((categoria) => (
                            <label key={categoria.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '4px',
                              backgroundColor: categoriasSelecionadasEdit.receitas.includes(categoria.id) 
                                ? '#1f2937' 
                                : 'transparent',
                              transition: 'background-color 0.2s'
                            }}>
                              <input
                                type="checkbox"
                                checked={categoriasSelecionadasEdit.receitas.includes(categoria.id)}
                                onChange={() => toggleCategoriaReceitaEdit(categoria.id)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer'
                                }}
                              />
                              <span style={{ 
                                color: '#d1d5db', 
                                fontSize: '14px',
                                flex: 1
                              }}>
                                {categoria.nome}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Categorias de Despesa */}
                    <div style={{ 
                      backgroundColor: '#374151', 
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #4b5563'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#ef4444',
                          margin: 0
                        }}>
                          Categorias de Despesa
                        </h4>
                        <button
                          type="button"
                          onClick={toggleTodasDespesasEdit}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                          {categoriasEditaveis.despesas.length === categoriasSelecionadasEdit.despesas.length 
                            ? 'Deselecionar Todas' 
                            : 'Selecionar Todas'
                          }
                        </button>
                      </div>
                      
                      {categoriasEditaveis.despesas.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                          Nenhuma categoria de despesa disponível
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {categoriasEditaveis.despesas.map((categoria) => (
                            <label key={categoria.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '4px',
                              backgroundColor: categoriasSelecionadasEdit.despesas.includes(categoria.id) 
                                ? '#1f2937' 
                                : 'transparent',
                              transition: 'background-color 0.2s'
                            }}>
                              <input
                                type="checkbox"
                                checked={categoriasSelecionadasEdit.despesas.includes(categoria.id)}
                                onChange={() => toggleCategoriaDespesaEdit(categoria.id)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer'
                                }}
                              />
                              <span style={{ 
                                color: '#d1d5db', 
                                fontSize: '14px',
                                flex: 1
                              }}>
                                {categoria.nome}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={cancelarEdicaoCategorias}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
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
                    type="button"
                    onClick={salvarCategoriasEditadas}
                    disabled={salvandoCategorias}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: salvandoCategorias ? '#6b7280' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: salvandoCategorias ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => !salvandoCategorias && (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseOut={(e) => !salvandoCategorias && (e.currentTarget.style.backgroundColor = '#10b981')}
                  >
                    {salvandoCategorias ? 'Salvando...' : 'Salvar Categorias'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </AdminProtected>
  )
} 