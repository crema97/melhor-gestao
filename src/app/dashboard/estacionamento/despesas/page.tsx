'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import PeriodSelector from '@/components/PeriodSelector'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CategoriaDespesa {
  id: string
  nome: string
}

interface Despesa {
  id: string
  valor: number
  data_despesa: string
  observacoes?: string
  categoria_despesa: {
    id: string
    nome: string
  } | null
}

interface MonthlyData {
  mes: string
  despesas: number
}

interface DailyData {
  dia: string
  despesas: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [filteredDespesas, setFilteredDespesas] = useState<Despesa[]>([])
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    valor: '',
    data_despesa: new Date().toISOString().split('T')[0],
    categoria_id: '',
    observacoes: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  })
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (despesas.length > 0) {
      loadChartData()
      loadCategoryData()
    }
  }, [despesas])

  useEffect(() => {
    if (filteredDespesas.length > 0) {
      loadChartData()
      loadCategoryData()
    }
  }, [filteredDespesas])

  useEffect(() => {
    const loadDataForPeriod = async () => {
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
    }
    
    loadDataForPeriod()
  }, [dateRange])

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

      await loadData(usuario.id)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  async function loadData(usuarioId: string) {
    try {
      setLoading(true)

      // Primeiro, buscar o tipo de negócio do usuário
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('tipo_negocio_id')
        .eq('id', usuarioId)
        .single()

      // Carregar categorias de despesa específicas do tipo de negócio
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_despesa')
        .select('*')
        .eq('ativo', true)
        .eq('tipo_negocio_id', usuario?.tipo_negocio_id)
        .order('nome')

      // Carregar despesas com filtro de período
      const { data: despesasData } = await supabase
        .from('despesas')
        .select(`
          id,
          valor,
          data_despesa,
          observacoes,
          categoria_despesa:categorias_despesa(nome)
        `)
        .eq('usuario_id', usuarioId)
        .gte('data_despesa', dateRange.startDate.toISOString().split('T')[0])
        .lte('data_despesa', dateRange.endDate.toISOString().split('T')[0])
        .order('data_despesa', { ascending: false })

      setCategorias(categoriasData || [])
      setDespesas((despesasData as unknown as Despesa[]) || [])
      setFilteredDespesas((despesasData as unknown as Despesa[]) || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePeriodChange(startDate: Date, endDate: Date) {
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    const filtered = despesas.filter(despesa => {
      return despesa.data_despesa >= startStr && despesa.data_despesa <= endStr
    })
    setFilteredDespesas(filtered)
  }

  function loadChartData() {
    // Dados mensais (últimos 6 meses)
    const monthlyData = []
    const hoje = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesStr = mes.toLocaleDateString('pt-BR', { month: 'short' })
      
      const despesasMes = filteredDespesas.filter(d => {
        const dataDespesa = new Date(d.data_despesa + 'T00:00:00')
        return dataDespesa.getMonth() === mes.getMonth() && dataDespesa.getFullYear() === mes.getFullYear()
      }).reduce((sum, d) => sum + d.valor, 0)
      
      monthlyData.push({
        mes: mesStr,
        despesas: despesasMes
      })
    }
    
    setMonthlyData(monthlyData)

    // Dados diários (últimos 7 dias)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      const diaStr = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      
      const despesasDia = filteredDespesas.filter(d => {
        const dataDespesa = new Date(d.data_despesa + 'T00:00:00')
        return dataDespesa.toDateString() === dia.toDateString()
      }).reduce((sum, d) => sum + d.valor, 0)
      
      dailyData.push({
        dia: diaStr,
        despesas: despesasDia
      })
    }
    
    setDailyData(dailyData)
  }

  function loadCategoryData() {
    const categorias: { [key: string]: number } = {}
    
    filteredDespesas.forEach(despesa => {
      const categoriaNome = despesa.categoria_despesa?.nome || 'Sem categoria'
      categorias[categoriaNome] = (categorias[categoriaNome] || 0) + despesa.valor
    })

    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899']

    const categoryData = Object.entries(categorias).map(([name, value], index) => ({
      name,
      value: value as number,
      color: colors[index % colors.length]
    })).filter(item => item.value > 0)

    setCategoryData(categoryData)
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

      const despesaData = {
        usuario_id: usuario.id,
        valor: parseFloat(formData.valor),
        data_despesa: formData.data_despesa,
        categoria_despesa_id: formData.categoria_id,
        observacoes: formData.observacoes || null
      }

      if (editingId) {
        // Editar despesa existente
        const { error } = await supabase
          .from('despesas')
          .update(despesaData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Criar nova despesa
        const { error } = await supabase
          .from('despesas')
          .insert([despesaData])

        if (error) throw error
      }

      // Recarregar dados
      await loadData(usuario.id)
      
      // Limpar formulário
      setFormData({
        valor: '',
        data_despesa: new Date().toISOString().split('T')[0],
        categoria_id: '',
        observacoes: ''
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
      alert('Erro ao salvar despesa. Tente novamente.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return

    try {
      const { error } = await supabase
        .from('despesas')
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
      console.error('Erro ao excluir despesa:', error)
      alert('Erro ao excluir despesa. Tente novamente.')
    }
  }

  function handleEdit(despesa: Despesa) {
    setFormData({
      valor: despesa.valor.toString(),
      data_despesa: despesa.data_despesa,
      categoria_id: '',
      observacoes: despesa.observacoes || ''
    })
    setEditingId(despesa.id)
    setShowForm(true)
  }

  function handleCancel() {
    setFormData({
      valor: '',
      data_despesa: new Date().toISOString().split('T')[0],
      categoria_id: '',
      observacoes: ''
    })
    setShowForm(false)
    setEditingId(null)
  }

  const totalDespesas = filteredDespesas.reduce((sum, d) => sum + d.valor, 0)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #374151',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#d1d5db' }}>Carregando despesas...</p>
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
                Despesas
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '8px', 
                fontSize: '18px',
                margin: 0
              }}>
                Gerencie suas despesas
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
              backgroundColor: '#ef4444',
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
              e.currentTarget.style.backgroundColor = '#dc2626'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px -1px rgba(0, 0, 0, 0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Despesa
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
                {editingId ? 'Editar Despesa' : 'Nova Despesa'}
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
                  value={formData.data_despesa}
                  onChange={e => setFormData({ ...formData, data_despesa: e.target.value })}
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
                <select
                  value={formData.categoria_id}
                  onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
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
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
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
                  Observações (opcional)
                </label>
                <textarea
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
                  placeholder="Observações sobre a despesa..."
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
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  {editingId ? 'Atualizar' : 'Salvar'}
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
                {filteredDespesas.length} despesa{filteredDespesas.length !== 1 ? 's' : ''} registrada{filteredDespesas.length !== 1 ? 's' : ''}
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
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#ef4444',
                margin: 0
              }}>
                R$ {totalDespesas.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '32px', 
          marginBottom: '32px' 
        }}>
          {/* Monthly Chart */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Evolução Mensal (Últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
                />
                <Legend />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Chart */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Evolução Diária (Últimos 7 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dia" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
                />
                <Legend />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        {categoryData.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '32px', 
            marginBottom: '32px' 
          }}>
            {/* Pie Chart */}
            <div style={{ 
              backgroundColor: '#1f2937', 
              borderRadius: '8px', 
              padding: '32px',
              border: '1px solid #374151'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>
                Despesas por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Categories List */}
            <div style={{ 
              backgroundColor: '#1f2937', 
              borderRadius: '8px', 
              padding: '32px',
              border: '1px solid #374151'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>
                Detalhamento por Categoria
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {categoryData.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#374151',
                    borderRadius: '8px',
                    border: '1px solid #4b5563'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: item.color,
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ color: '#ffffff', fontWeight: '500' }}>{item.name}</span>
                    </div>
                    <span style={{ 
                      color: '#ef4444', 
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      R$ {item.value.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
                </div>
            </div>
          </div>
        )}

        {/* Despesas List */}
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
              Lista de Despesas
            </h2>
          </div>
          
          <div style={{ padding: '24px' }}>
            {filteredDespesas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredDespesas.map((despesa) => (
                  <div key={despesa.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: '#374151',
                    borderRadius: '8px',
                    border: '1px solid #4b5563'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                          <p style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#ffffff',
                            margin: '0 0 4px 0'
                          }}>
                            {despesa.categoria_despesa?.nome || 'Sem categoria'}
                          </p>
                          <p style={{ 
                            fontSize: '14px', 
                            color: '#9ca3af',
                            margin: '0 0 4px 0'
                          }}>
                            {new Date(despesa.data_despesa + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          {despesa.observacoes && (
                            <p style={{ 
                              fontSize: '14px', 
                              color: '#6b7280',
                              margin: 0
                            }}>
                              {despesa.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <p style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#ef4444',
                        margin: 0
                      }}>
                        R$ {despesa.valor.toFixed(2).replace('.', ',')}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(despesa)}
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
                        onClick={() => handleDelete(despesa.id)}
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
                    </div>
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
                  Nenhuma despesa registrada no período selecionado
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  Registrar Primeira Despesa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 