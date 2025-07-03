'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PeriodSelector from '@/components/PeriodSelector'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([
    { dia: 'Seg', despesas: 0 },
    { dia: 'Ter', despesas: 0 },
    { dia: 'Qua', despesas: 0 },
    { dia: 'Qui', despesas: 0 },
    { dia: 'Sex', despesas: 0 },
    { dia: 'Sab', despesas: 0 },
    { dia: 'Dom', despesas: 0 }
  ])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [formData, setFormData] = useState({
    valor: '',
    data_despesa: '',
    categoria_despesa_id: '',
    observacoes: ''
  })
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)
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
  }, [dateRange, usuarioId])

  useEffect(() => {
    if (despesas.length > 0) {
      loadChartData()
      loadCategoryData()
    }
  }, [despesas])

  async function checkUserAndLoadData() {
    try {
      console.log('Iniciando checkUserAndLoadData (despesas)...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('Usuário não autenticado, redirecionando...')
        router.push('/login')
        return
      }

      console.log('Usuário autenticado:', user.email)
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!usuario) {
        console.log('Usuário não encontrado na tabela usuarios, redirecionando...')
        router.push('/login')
        return
      }

      console.log('Usuário encontrado:', usuario.nome)
      console.log('Tipo de negócio ID:', usuario.tipo_negocio_id)
      
      setUsuarioId(usuario.id)
      await loadCategoriasAtivas(usuario.id)
      console.log('checkUserAndLoadData (despesas) concluído com sucesso')
      console.log('Definindo loading como false')
      setLoading(false)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      console.log('Erro - definindo loading como false')
      setLoading(false)
      router.push('/login')
    }
  }

  async function loadDespesas(usuarioId: string) {
    try {
      console.log('Iniciando loadDespesas para usuarioId:', usuarioId)
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

      if (error) {
        console.error('Erro ao carregar despesas:', error)
        throw error
      }

      console.log('Despesas carregadas:', data?.length || 0, 'despesas')
      console.log('Despesas:', data)
      
      // Transformar os dados para o formato correto
      const despesasFormatadas = (data || []).map((item: any) => ({
        id: item.id,
        valor: item.valor,
        data_despesa: item.data_despesa,
        observacoes: item.observacoes,
        categoria_despesa: Array.isArray(item.categoria_despesa) 
          ? item.categoria_despesa[0] || null 
          : item.categoria_despesa
      })) as Despesa[]
      
      setDespesas(despesasFormatadas)
      setFilteredDespesas(despesasFormatadas)
      console.log('loadDespesas concluído com sucesso')
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategoriasAtivas(usuarioId: string) {
    try {
      console.log('Carregando categorias ativas para usuarioId:', usuarioId)
      const response = await fetch(`/api/usuario/categorias-ativas?usuario_id=${usuarioId}`)
      const data = await response.json()
      if (data.success) {
        setCategorias(data.categorias.despesas || [])
        console.log('Categorias ativas carregadas:', data.categorias.despesas?.length || 0, 'categorias')
      } else {
        setCategorias([])
        console.log('Nenhuma categoria ativa encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar categorias ativas:', error)
      setCategorias([])
    }
  }

  function handlePeriodChange(startDate: Date, endDate: Date) {
    const filtered = despesas.filter(despesa => {
      const despesaDate = new Date(despesa.data_despesa + 'T00:00:00')
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
      return despesaDate >= start && despesaDate <= end
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!usuarioId) return

    try {
      // Garantir que a data seja tratada corretamente
      const dataDespesa = new Date(formData.data_despesa + 'T00:00:00')
      const dataFormatada = dataDespesa.toISOString().split('T')[0]

      const despesaData = {
        usuario_id: usuarioId,
        valor: parseFloat(formData.valor),
        data_despesa: dataFormatada,
        categoria_despesa_id: formData.categoria_despesa_id || null,
        observacoes: formData.observacoes || null
      }

      if (editingDespesa) {
        const { error } = await supabase
          .from('despesas')
          .update(despesaData)
          .eq('id', editingDespesa.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert([despesaData])

        if (error) throw error
      }

      setFormData({
        valor: '',
        data_despesa: '',
        categoria_despesa_id: '',
        observacoes: ''
      })
      setShowForm(false)
      setEditingDespesa(null)
      await loadDespesas(usuarioId)
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

      await loadDespesas(usuarioId!)
    } catch (error) {
      console.error('Erro ao excluir despesa:', error)
      alert('Erro ao excluir despesa')
    }
  }

  function handleEdit(despesa: Despesa) {
    setEditingDespesa(despesa)
    setFormData({
      valor: despesa.valor.toString(),
      data_despesa: despesa.data_despesa,
      categoria_despesa_id: despesa.categoria_despesa?.id || '',
      observacoes: despesa.observacoes || ''
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingDespesa(null)
    setFormData({
      valor: '',
      data_despesa: '',
      categoria_despesa_id: '',
      observacoes: ''
    })
  }

  function loadChartData() {
    if (despesas.length === 0) {
      return
    }

    // Dados mensais dos últimos 6 meses
    const monthlyDataArray = [...monthlyData]
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const monthDespesas = despesas.filter(d => d.data_despesa.startsWith(monthKey))
        .reduce((sum, d) => sum + d.valor, 0)
      
      monthlyDataArray[i] = {
        mes: months[date.getMonth()],
        despesas: monthDespesas
      }
    }
    
    setMonthlyData(monthlyDataArray)

    // Dados diários dos últimos 7 dias
    const dailyDataArray = [...dailyData]
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      
      const dayDespesas = despesas.filter(d => d.data_despesa === dateKey)
        .reduce((sum, d) => sum + d.valor, 0)
      
      dailyDataArray[i] = {
        dia: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        despesas: dayDespesas
      }
    }
    
    setDailyData(dailyDataArray)
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
            Carregando despesas...
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
                href="/dashboard/estetica"
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

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {/* Monthly Chart */}
          <div style={{
            backgroundColor: '#1F2937',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              Despesas Mensais (Últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Despesas']}
                />
                <Bar dataKey="despesas" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Chart */}
          <div style={{
            backgroundColor: '#1F2937',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              Despesas Diárias (Últimos 7 dias)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dia" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Despesas']}
                />
                <Bar dataKey="despesas" fill="#EF4444" />
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
              gridTemplateColumns: '1fr 1fr', 
              gap: '32px',
              alignItems: 'center'
            }}>
              {/* Pie Chart */}
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
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
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Categories List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {categoryData.map((item) => (
                  <div key={item.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#374151',
                    borderRadius: '8px',
                    border: `2px solid ${item.color}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: item.color,
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ 
                        color: '#ffffff', 
                        fontSize: '16px', 
                        fontWeight: '600' 
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ 
                      color: item.color, 
                      fontSize: '18px', 
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

        {/* Form Modal */}
        {showForm && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1F2937',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #374151',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
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

                <div>
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
                    value={formData.categoria_despesa_id}
                    onChange={e => setFormData({ ...formData, categoria_despesa_id: e.target.value })}
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

                <div>
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
                      backgroundColor: '#EF4444',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {editingDespesa ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Despesas List */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
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

          {filteredDespesas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: '16px' }}>
                Nenhuma despesa encontrada para o período selecionado.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#374151' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                      Data
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                      Valor
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                      Categoria
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                      Observações
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDespesas.map((despesa) => (
                    <tr key={despesa.id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '16px', color: '#ffffff', fontSize: '14px' }}>
                        {new Date(despesa.data_despesa + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '16px', color: '#EF4444', fontSize: '14px', fontWeight: '600' }}>
                        R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px', color: '#ffffff', fontSize: '14px' }}>
                        {despesa.categoria_despesa?.nome || '-'}
                      </td>
                      <td style={{ padding: '16px', color: '#9CA3AF', fontSize: '14px', maxWidth: '200px' }}>
                        {despesa.observacoes || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(despesa)}
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
                            onClick={() => handleDelete(despesa.id)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 