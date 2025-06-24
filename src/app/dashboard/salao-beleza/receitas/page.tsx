'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PeriodSelector from '@/components/PeriodSelector'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

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

interface PaymentData {
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

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [filteredReceitas, setFilteredReceitas] = useState<Receita[]>([])
  const [categorias, setCategorias] = useState<CategoriaReceita[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null)
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
    dataInicio: '',
    dataFim: '',
    formaPagamento: ''
  })
  const router = useRouter()

  // Dados para os gráficos
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (usuarioId) {
      loadReceitas(usuarioId)
    }
  }, [dateRange, usuarioId])

  useEffect(() => {
    if (receitas.length > 0) {
      loadChartData()
    }
  }, [receitas])

  useEffect(() => {
    aplicarFiltros()
  }, [receitas, filtros])

  async function checkUserAndLoadData() {
    try {
      console.log('Iniciando checkUserAndLoadData (receitas salão)...')
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
      await loadCategorias(usuario.tipo_negocio_id)
      await loadReceitas(usuario.id)
      console.log('checkUserAndLoadData (receitas salão) concluído com sucesso')
      console.log('Definindo loading como false')
      setLoading(false)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      console.log('Erro - definindo loading como false')
      setLoading(false)
      router.push('/login')
    }
  }

  async function loadReceitas(usuarioId: string) {
    try {
      console.log('Iniciando loadReceitas para usuarioId:', usuarioId)
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          categoria_receita:categorias_receita(id, nome)
        `)
        .eq('usuario_id', usuarioId)
        .order('data_receita', { ascending: false })

      if (error) {
        console.error('Erro ao carregar receitas:', error)
        throw error
      }

      console.log('Receitas carregadas:', data?.length || 0, 'receitas')
      console.log('Receitas:', data)
      setReceitas(data || [])
      setFilteredReceitas(data || [])
      console.log('loadReceitas concluído com sucesso')
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    }
  }

  async function loadCategorias(tipoNegocioId: string) {
    try {
      console.log('Carregando categorias de receita para tipo_negocio_id:', tipoNegocioId)
      const { data, error } = await supabase
        .from('categorias_receita')
        .select('*')
        .eq('tipo_negocio_id', tipoNegocioId)
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Erro ao carregar categorias de receita:', error)
        throw error
      }
      
      console.log('Categorias de receita carregadas:', data?.length || 0, 'categorias')
      console.log('Categorias de receita:', data)
      setCategorias(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias de receita:', error)
    }
  }

  function handlePeriodChange(startDate: Date, endDate: Date) {
    const filtered = receitas.filter(receita => {
      const receitaDate = new Date(receita.data_receita + 'T00:00:00')
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
      return receitaDate >= start && receitaDate <= end
    })
    setFilteredReceitas(filtered)
  }

  function loadChartData() {
    if (receitas.length === 0) {
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
      
      const monthReceitas = receitas.filter(r => r.data_receita.startsWith(monthKey))
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
      const dateKey = date.toISOString().split('T')[0]
      
      const dayReceitas = receitas.filter(r => r.data_receita === dateKey)
        .reduce((sum, r) => sum + r.valor, 0)
      
      dailyDataArray.push({
        dia: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
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

  const totalReceitas = filteredReceitas.reduce((sum, receita) => sum + receita.valor, 0)

  function getPaymentMethodsData() {
    const paymentData = [
      { name: 'Dinheiro', value: 0, color: '#10b981' },
      { name: 'Débito', value: 0, color: '#3b82f6' },
      { name: 'Crédito', value: 0, color: '#8b5cf6' },
      { name: 'PIX', value: 0, color: '#f59e0b' }
    ]
    
    filteredReceitas.forEach(receita => {
      const index = paymentData.findIndex(item => 
        item.name.toLowerCase() === receita.forma_pagamento.toLowerCase()
      )
      if (index !== -1) {
        paymentData[index].value += receita.valor
      }
    })
    
    return paymentData.filter(item => item.value > 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!usuarioId) return

    try {
      const receitaData = {
        usuario_id: usuarioId,
        valor: parseFloat(formData.valor),
        data_receita: formData.data_receita,
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
          .insert(receitaData)

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
      await loadReceitas(usuarioId)
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

      await loadReceitas(usuarioId!)
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

  function aplicarFiltros() {
    let receitasFiltradas = [...receitas]

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

    // Filtro por data de início
    if (filtros.dataInicio) {
      receitasFiltradas = receitasFiltradas.filter(receita => 
        receita.data_receita >= filtros.dataInicio
      )
    }

    // Filtro por data de fim
    if (filtros.dataFim) {
      receitasFiltradas = receitasFiltradas.filter(receita => 
        receita.data_receita <= filtros.dataFim
      )
    }

    setFilteredReceitas(receitasFiltradas)
  }

  function limparFiltros() {
    setFiltros({
      categoria: '',
      dataInicio: '',
      dataFim: '',
      formaPagamento: ''
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
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#10b981',
                margin: 0
              }}>
                R$ {totalReceitas.toFixed(2).replace('.', ',')}
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
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Evolução Mensal (Últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#d1d5db" fontSize={12} />
                <YAxis stroke="#d1d5db" fontSize={12} />
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
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Chart */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Evolução Diária (Últimos 7 dias)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dia" stroke="#d1d5db" fontSize={12} />
                <YAxis stroke="#d1d5db" fontSize={12} />
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
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        {getPaymentMethodsData().length > 0 && (
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #374151',
            marginBottom: '32px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Formas de Pagamento
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              alignItems: 'center'
            }}>
              {/* Pie Chart */}
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPaymentMethodsData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPaymentMethodsData().map((entry, index) => (
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

              {/* Payment Methods List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getPaymentMethodsData().map((item) => (
                  <div key={item.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px', 
                    backgroundColor: '#374151', 
                    borderRadius: '8px',
                    border: `2px solid ${item.color}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* Categories Chart */}
        {getCategoriesData().length > 0 && (
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #374151',
            marginBottom: '32px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#ffffff',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              Receitas por Categoria
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              alignItems: 'center'
            }}>
              {/* Pie Chart */}
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoriesData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
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
                        color: '#ffffff'
                      }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                {editingReceita ? 'Editar Receita' : 'Nova Receita'}
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
                      backgroundColor: '#10B981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {editingReceita ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Receitas List */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          border: '1px solid #374151',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: '0' }}>
              Lista de Receitas
            </h3>
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

          {filteredReceitas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: '16px' }}>
                Nenhuma receita encontrada para o período selecionado.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                      Pagamento
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
                  {filteredReceitas.map((receita) => (
                    <tr key={receita.id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '16px', color: '#ffffff', fontSize: '14px' }}>
                        {new Date(receita.data_receita + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '16px', color: '#10B981', fontSize: '14px', fontWeight: '600' }}>
                        R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px', color: '#ffffff', fontSize: '14px' }}>
                        {receita.categoria_receita?.nome || '-'}
                      </td>
                      <td style={{ padding: '16px', color: '#ffffff', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: 
                            receita.forma_pagamento === 'dinheiro' ? '#10B981' :
                            receita.forma_pagamento === 'debito' ? '#3B82F6' :
                            receita.forma_pagamento === 'credito' ? '#8B5CF6' : '#F59E0B',
                          color: '#ffffff'
                        }}>
                          {receita.forma_pagamento.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#9CA3AF', fontSize: '14px', maxWidth: '200px' }}>
                        {receita.observacoes || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(receita)}
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
                            onClick={() => handleDelete(receita.id)}
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