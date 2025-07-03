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
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({
    categoria: '',
    dataInicio: '',
    dataFim: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (usuarioId) {
      loadDespesas(usuarioId)
    }
  }, [usuarioId])

  useEffect(() => {
    if (despesas.length > 0) {
      loadChartData()
      loadCategoryData()
    }
  }, [despesas])

  useEffect(() => {
    // Aplicar filtro de período quando as despesas mudarem
    const filtered = despesas.filter(despesa => {
      const despesaDate = new Date(despesa.data_despesa + 'T00:00:00')
      const start = new Date(dateRange.startDate.getFullYear(), dateRange.startDate.getMonth(), dateRange.startDate.getDate())
      const end = new Date(dateRange.endDate.getFullYear(), dateRange.endDate.getMonth(), dateRange.endDate.getDate(), 23, 59, 59)
      return despesaDate >= start && despesaDate <= end
    })
    setFilteredDespesas(filtered)
  }, [despesas, dateRange])

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

  async function loadDespesas(usuarioId: string) {
    try {
      setLoading(true)
      
      // Buscar TODAS as despesas do usuário (sem filtrar por categorias ativas)
      const { data, error } = await supabase
        .from('despesas')
        .select(`
          id,
          valor,
          data_despesa,
          observacoes,
          categoria_despesa:categorias_despesa(id, nome)
        `)
        .eq('usuario_id', usuarioId)
        .order('data_despesa', { ascending: false })

      if (error) throw error
      
      console.log('Despesas carregadas:', data?.length || 0)
      console.log('Despesas:', data)
      
      setDespesas((data as unknown as Despesa[]) || [])
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategoriasAtivas(usuarioId: string) {
    try {
      const response = await fetch(`/api/usuario/categorias-ativas?usuario_id=${usuarioId}`)
      const data = await response.json()
      if (data.success) {
        setCategorias(data.categorias.despesas || [])
      } else {
        setCategorias([])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias ativas:', error)
      setCategorias([])
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

  function aplicarFiltros() {
    const filtered = despesas.filter(despesa => {
      const despesaDate = new Date(despesa.data_despesa + 'T00:00:00')
      
      if (filtros.categoria && despesa.categoria_despesa?.id !== filtros.categoria) {
        return false
      }
      
      if (filtros.dataInicio) {
        const startDate = new Date(filtros.dataInicio + 'T00:00:00')
        if (despesaDate < startDate) return false
      }
      
      if (filtros.dataFim) {
        const endDate = new Date(filtros.dataFim + 'T23:59:59')
        if (despesaDate > endDate) return false
      }
      
      return true
    })
    setFilteredDespesas(filtered)
  }

  function limparFiltros() {
    setFiltros({
      categoria: '',
      dataInicio: '',
      dataFim: ''
    })
    setFilteredDespesas(despesas)
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
        return d.data_despesa === dia.toISOString().split('T')[0]
      }).reduce((sum, d) => sum + d.valor, 0)
      
      dailyData.push({
        dia: diaStr,
        despesas: despesasDia
      })
    }
    
    setDailyData(dailyData)
  }

  function loadCategoryData() {
    const categoryMap = new Map<string, number>()
    
    filteredDespesas.forEach(despesa => {
      const categoryName = despesa.categoria_despesa?.nome || 'Sem categoria'
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + despesa.valor)
    })
    
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6']
    
    const data = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
    
    setCategoryData(data)
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
        valor: parseFloat(formData.valor),
        data_despesa: formData.data_despesa,
        categoria_despesa_id: formData.categoria_id || null,
        observacoes: formData.observacoes || null,
        usuario_id: usuario.id
      }

      if (editingId) {
        const { error } = await supabase
          .from('despesas')
          .update(despesaData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert([despesaData])

        if (error) throw error
      }

      setFormData({
        valor: '',
        data_despesa: new Date().toISOString().split('T')[0],
        categoria_id: '',
        observacoes: ''
      })
      setShowForm(false)
      setEditingId(null)

      await loadDespesas(usuario.id)
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
      alert('Erro ao salvar despesa')
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

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (usuario) {
          await loadDespesas(usuario.id)
        }
      }
    } catch (error) {
      console.error('Erro ao excluir despesa:', error)
      alert('Erro ao excluir despesa')
    }
  }

  function handleEdit(despesa: Despesa) {
    setEditingId(despesa.id)
    setFormData({
      valor: despesa.valor.toString(),
      data_despesa: despesa.data_despesa,
      categoria_id: despesa.categoria_despesa?.id || '',
      observacoes: despesa.observacoes || ''
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      valor: '',
      data_despesa: new Date().toISOString().split('T')[0],
      categoria_id: '',
      observacoes: ''
    })
  }

  const totalDespesas = filteredDespesas.reduce((sum, despesa) => sum + despesa.valor, 0)

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
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
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
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações opcionais..."
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
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
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
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
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#ef4444',
                margin: 0,
                whiteSpace: 'nowrap'
              }}>
                R$ {totalDespesas.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px', 
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
            <ResponsiveContainer width="100%" height={180}>
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
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
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
            <ResponsiveContainer width="100%" height={180}>
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
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        {categoryData.length > 0 && (
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
              Despesas por Categoria
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
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
                {categoryData.map((item) => (
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
                      fontWeight: 'bold' 
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

              {/* Filtro por Data de Início */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Data de Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
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

              {/* Filtro por Data de Fim */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#d1d5db', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '8px' 
                }}>
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
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
                          fontSize: '18px'
                        }}>
                          {despesa.categoria_despesa?.nome || 'Sem categoria'}
                        </h3>
                      </div>
                      <p style={{ 
                        color: '#d1d5db', 
                        fontSize: '14px',
                        margin: '0 0 8px 0'
                      }}>
                        {new Date(despesa.data_despesa + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      {despesa.observacoes && (
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '14px',
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {despesa.observacoes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', minWidth: '0' }}>
                      <p style={{ 
                        fontWeight: 'bold', 
                        color: '#ef4444', 
                        fontSize: '18px',
                        margin: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        R$ {despesa.valor.toFixed(2).replace('.', ',')}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEdit(despesa)}
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
                          onClick={() => handleDelete(despesa.id)}
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
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p style={{ color: '#d1d5db', fontSize: '18px', margin: 0 }}>
                  Nenhuma despesa registrada no período
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