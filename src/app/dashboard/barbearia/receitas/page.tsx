'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PeriodSelector from '@/components/PeriodSelector'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CategoriaReceita {
  id: string
  nome: string
}

interface Receita {
  id: string
  valor: number
  data_receita: string
  forma_pagamento: string
  observacoes?: string
  categoria_receita: {
    id: string
    nome: string
  } | null
}

interface MonthlyData {
  mes: string
  receitas: number
}

interface DailyData {
  dia: string
  receitas: number
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [filteredReceitas, setFilteredReceitas] = useState<Receita[]>([])
  const [categorias, setCategorias] = useState<CategoriaReceita[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [formData, setFormData] = useState({
    valor: '',
    data_receita: '',
    forma_pagamento: 'dinheiro',
    categoria_receita_id: '',
    observacoes: ''
  })
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)
  })
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({
    categoria: '',
    formaPagamento: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (usuarioId) {
      loadReceitas(usuarioId)
    }
  }, [dateRange, usuarioId])

  useEffect(() => {
    if (filteredReceitas.length > 0) {
      loadChartData()
    }
  }, [filteredReceitas])

  useEffect(() => {
    aplicarFiltros()
  }, [receitas, filtros, dateRange])

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
      await loadCategoriasAtivas(usuario.id)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      setLoading(false)
      router.push('/login')
    }
  }

  async function loadReceitas(usuarioId: string) {
    try {
      setLoading(true)
      
      // Buscar TODAS as receitas do usuário (sem filtrar por categorias ativas)
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          categoria_receita:categorias_receita(id, nome)
        `)
        .eq('usuario_id', usuarioId)
        .order('data_receita', { ascending: false })

      if (error) throw error

      console.log('Receitas carregadas:', data?.length || 0)
      console.log('Receitas:', data)
      
      setReceitas(data || [])
      setFilteredReceitas(data || [])
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategoriasAtivas(usuarioId: string) {
    try {
      const response = await fetch(`/api/usuario/categorias-ativas?usuario_id=${usuarioId}`)
      const data = await response.json()
      if (data.success) {
        setCategorias(data.categorias.receitas || [])
      } else {
        setCategorias([])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias ativas:', error)
      setCategorias([])
    }
  }

  function handlePeriodChange(startDate: Date, endDate: Date) {
    setDateRange({ startDate, endDate })
  }

  function aplicarFiltros() {
    let receitasFiltradas = [...receitas]

    // Aplicar filtro de período do dateRange
    const startDateStr = `${dateRange.startDate.getFullYear()}-${String(dateRange.startDate.getMonth() + 1).padStart(2, '0')}-${String(dateRange.startDate.getDate()).padStart(2, '0')}`
    const endDateStr = `${dateRange.endDate.getFullYear()}-${String(dateRange.endDate.getMonth() + 1).padStart(2, '0')}-${String(dateRange.endDate.getDate()).padStart(2, '0')}`
    
    receitasFiltradas = receitasFiltradas.filter(receita => {
      return receita.data_receita >= startDateStr && receita.data_receita <= endDateStr
    })

    // Filtro por categoria
    if (filtros.categoria) {
      receitasFiltradas = receitasFiltradas.filter(receita => 
        receita.categoria_receita?.id === filtros.categoria
      )
    }

    // Filtro por forma de pagamento
    if (filtros.formaPagamento) {
      receitasFiltradas = receitasFiltradas.filter(receita => 
        receita.forma_pagamento === filtros.formaPagamento
      )
    }



    setFilteredReceitas(receitasFiltradas)
  }

  function limparFiltros() {
    setFiltros({
      categoria: '',
      formaPagamento: ''
    })
  }

  function loadChartData() {
    if (filteredReceitas.length === 0) {
      setMonthlyData([])
      setDailyData([])
      return
    }

    // Dados mensais dos últimos 6 meses
    const monthlyDataArray: MonthlyData[] = []
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const monthReceitas = filteredReceitas.filter(r => r.data_receita.startsWith(monthKey))
        .reduce((sum, r) => sum + r.valor, 0)
      
      monthlyDataArray.push({
        mes: months[date.getMonth()],
        receitas: monthReceitas
      })
    }
    
    setMonthlyData(monthlyDataArray)

    // Dados diários dos últimos 7 dias
    const dailyDataArray: DailyData[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      const dayReceitas = filteredReceitas.filter(r => r.data_receita === dateKey)
        .reduce((sum, r) => sum + r.valor, 0)
      
      dailyDataArray.push({
        dia: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receitas: dayReceitas
      })
    }
    
    setDailyData(dailyDataArray)
  }

  function getCategoriesData() {
    const categoriesMap = new Map<string, number>()
    
    filteredReceitas.forEach(receita => {
      const categoriaNome = receita.categoria_receita?.nome || 'Sem categoria'
      const valorAtual = categoriesMap.get(categoriaNome) || 0
      categoriesMap.set(categoriaNome, valorAtual + receita.valor)
    })
    
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']
    
    return Array.from(categoriesMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).filter(item => item.value > 0)
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

      // Garantir que a data seja tratada corretamente
      const dataReceita = new Date(formData.data_receita + 'T00:00:00')
      const dataFormatada = dataReceita.toISOString().split('T')[0]

      const receitaData = {
        usuario_id: usuario.id,
        valor: parseFloat(formData.valor),
        data_receita: dataFormatada,
        forma_pagamento: formData.forma_pagamento,
        categoria_receita_id: formData.categoria_receita_id || null,
        observacoes: formData.observacoes || null
      }

      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingReceita.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert([receitaData])

        if (error) throw error
      }

      setFormData({
        valor: '',
        data_receita: '',
        forma_pagamento: 'dinheiro',
        categoria_receita_id: '',
        observacoes: ''
      })
      setShowForm(false)
      setEditingReceita(null)
      await loadReceitas(usuario.id)
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      alert('Erro ao salvar receita')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return

    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)

      if (error) throw error

      if (usuarioId) {
        await loadReceitas(usuarioId)
      }
    } catch (error) {
      console.error('Erro ao excluir receita:', error)
      alert('Erro ao excluir receita')
    }
  }

  function handleEdit(receita: Receita) {
    setEditingReceita(receita)
    setFormData({
      valor: receita.valor.toString(),
      data_receita: receita.data_receita,
      forma_pagamento: receita.forma_pagamento,
      categoria_receita_id: receita.categoria_receita?.id || '',
      observacoes: receita.observacoes || ''
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingReceita(null)
    setFormData({
      valor: '',
      data_receita: '',
      forma_pagamento: 'dinheiro',
      categoria_receita_id: '',
      observacoes: ''
    })
  }

  const totalReceitas = filteredReceitas.reduce((sum, receita) => sum + receita.valor, 0)

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
            Carregando receitas...
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
                Receitas
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '8px', 
                fontSize: '18px',
                margin: 0
              }}>
                Gerencie suas receitas
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
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 32px' }}>
        {/* Period Selector */}
        <PeriodSelector onPeriodChange={handlePeriodChange} />

        {/* Quick Action Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          marginBottom: '32px' 
        }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '16px 32px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#059669'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px -1px rgba(0, 0, 0, 0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Receita
          </button>
        </div>

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
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
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
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={e => setFormData({ ...formData, valor: e.target.value })}
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
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data_receita}
                  onChange={e => setFormData({ ...formData, data_receita: e.target.value })}
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
                  Forma de Pagamento
                </label>
                <select
                  value={formData.forma_pagamento}
                  onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })}
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
                  <option value="dinheiro">Dinheiro</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="pix">PIX</option>
                </select>
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
                <select
                  value={formData.categoria_receita_id}
                  onChange={e => setFormData({ ...formData, categoria_receita_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ minWidth: '0', width: '100%' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Observações
                </label>
                <textarea
                  placeholder="Observações opcionais..."
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
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
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  {editingReceita ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary Card */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '8px', 
          padding: '24px',
          border: '1px solid #374151',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                margin: '0 0 8px 0'
              }}>
                Resumo do Período
              </h2>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '16px',
                margin: 0
              }}>
                {filteredReceitas.length} receita{filteredReceitas.length !== 1 ? 's' : ''} registrada{filteredReceitas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '16px',
                margin: '0 0 4px 0'
              }}>
                Total do Período
              </p>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#10b981',
                margin: 0,
                whiteSpace: 'nowrap'
              }}>
                R$ {totalReceitas.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          {/* Monthly Chart */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '20px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              margin: '0 0 16px 0'
            }}>
              Evolução Mensal (Últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#d1d5db" fontSize={12} />
                <YAxis stroke="#d1d5db" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
                />
                <Legend fontSize={12} />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Chart */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '20px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              margin: '0 0 16px 0'
            }}>
              Evolução Diária (Últimos 7 dias)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dia" stroke="#d1d5db" fontSize={12} />
                <YAxis stroke="#d1d5db" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
                />
                <Legend fontSize={12} />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        {getCategoriesData().length > 0 && (
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '20px',
            border: '1px solid #374151',
            marginBottom: '32px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              margin: '0 0 16px 0'
            }}>
              Receitas por Categoria
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Pie Chart */}
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoriesData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoriesData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                      formatter={(value: number, name: string) => [`R$ ${value.toFixed(2).replace('.', ',')}`, name]}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Categories List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getCategoriesData().map((item) => (
                  <div key={item.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px', 
                    backgroundColor: '#374151', 
                    borderRadius: '8px',
                    border: `2px solid ${item.color}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: item.color,
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ 
                        color: '#ffffff', 
                        fontSize: '14px', 
                        fontWeight: '600' 
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ 
                      color: item.color, 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>
                      R$ {item.value.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Receitas List */}
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
              Lista de Receitas
            </h2>
          </div>

          {/* Filtros */}
          <div style={{ 
            padding: '24px', 
            borderBottom: '1px solid #374151',
            backgroundColor: '#1f2937'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Filtro por Categoria */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Categoria
                </label>
                <select
                  value={filtros.categoria}
                  onChange={e => setFiltros({ ...filtros, categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Forma de Pagamento */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Forma de Pagamento
                </label>
                <select
                  value={filtros.formaPagamento}
                  onChange={e => setFiltros({ ...filtros, formaPagamento: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Todas as formas</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="pix">PIX</option>
                </select>
              </div>


            </div>

            {/* Botão Limpar Filtros */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={limparFiltros}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {filteredReceitas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredReceitas.map((receita) => (
                  <div key={receita.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px', 
                    backgroundColor: '#374151', 
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ 
                          fontWeight: '600', 
                          color: '#ffffff',
                          margin: 0,
                          fontSize: '16px'
                        }}>
                          {receita.categoria_receita?.nome || 'Sem categoria'}
                        </h3>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap'
                        }}>
                          {receita.forma_pagamento}
                        </span>
                      </div>
                      <p style={{ 
                        color: '#d1d5db', 
                        fontSize: '14px',
                        margin: '0 0 8px 0'
                      }}>
                        {new Date(receita.data_receita + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      {receita.observacoes && (
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '14px',
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {receita.observacoes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', minWidth: '0' }}>
                      <p style={{ 
                        fontWeight: 'bold', 
                        color: '#10b981', 
                        fontSize: '18px',
                        margin: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        R$ {receita.valor.toFixed(2).replace('.', ',')}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEdit(receita)}
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
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(receita.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
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
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p style={{ color: '#d1d5db', fontSize: '18px', margin: 0 }}>
                  Nenhuma receita registrada no período
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