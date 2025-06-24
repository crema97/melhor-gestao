'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PeriodSelector from '@/components/PeriodSelector'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface Receita {
  id: string
  valor: number
  data_receita: string
  forma_pagamento: string
  observacoes?: string
  categoria_receita: {
    nome: string
  } | null
}

interface Despesa {
  id: string
  valor: number
  data_despesa: string
  observacoes?: string
  categoria_despesa: {
    nome: string
  } | null
}

interface MonthlyData {
  mes: string
  receitas: number
  despesas: number
  lucro: number
}

interface DailyData {
  dia: string
  receitas: number
  despesas: number
  lucro: number
}

export default function BarbeariaDashboard() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [usuarioId, setUsuarioId] = useState<string>('')
  const [stats, setStats] = useState({
    receitasMes: 0,
    despesasMes: 0,
    lucro: 0,
    pagamentos: {
      dinheiro: 0,
      debito: 0,
      credito: 0,
      pix: 0
    }
  })
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)
  })
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (usuarioId) {
      loadDashboardData(usuarioId)
    }
  }, [dateRange, usuarioId])

  useEffect(() => {
    if (receitas.length > 0 || despesas.length > 0) {
      loadChartData()
    }
  }, [receitas, despesas])

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
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  async function loadDashboardData(usuarioId: string) {
    try {
      setLoading(true)

      const { data: receitasData } = await supabase
        .from('receitas')
        .select(`
          id,
          valor,
          data_receita,
          forma_pagamento,
          observacoes,
          categoria_receita:categorias_receita(nome)
        `)
        .eq('usuario_id', usuarioId)
        .gte('data_receita', dateRange.startDate.toISOString().split('T')[0])
        .lte('data_receita', dateRange.endDate.toISOString().split('T')[0])
        .order('data_receita', { ascending: false })

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

      setReceitas((receitasData as unknown as Receita[]) || [])
      setDespesas((despesasData as unknown as Despesa[]) || [])

      const receitasMes = receitasData?.reduce((sum, r) => sum + r.valor, 0) || 0
      const despesasMes = despesasData?.reduce((sum, d) => sum + d.valor, 0) || 0
      const lucro = receitasMes - despesasMes

      const pagamentos = {
        dinheiro: 0,
        debito: 0,
        credito: 0,
        pix: 0
      }

      receitasData?.forEach(receita => {
        pagamentos[receita.forma_pagamento as keyof typeof pagamentos] += receita.valor
      })

      setStats({
        receitasMes,
        despesasMes,
        lucro,
        pagamentos
      })

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  function loadChartData() {
    if (receitas.length === 0 && despesas.length === 0) {
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
      
      const monthDespesas = despesas.filter(d => d.data_despesa.startsWith(monthKey))
        .reduce((sum, d) => sum + d.valor, 0)
      
      monthlyDataArray.push({
        mes: months[date.getMonth()],
        receitas: monthReceitas,
        despesas: monthDespesas,
        lucro: monthReceitas - monthDespesas
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
      
      const dayDespesas = despesas.filter(d => d.data_despesa === dateKey)
        .reduce((sum, d) => sum + d.valor, 0)
      
      dailyDataArray.push({
        dia: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receitas: dayReceitas,
        despesas: dayDespesas,
        lucro: dayReceitas - dayDespesas
      })
    }
    
    setDailyData(dailyDataArray)
  }

  function getPaymentMethodsData() {
    const paymentData = [
      { name: 'Dinheiro', value: stats.pagamentos.dinheiro, color: '#10b981' },
      { name: 'Débito', value: stats.pagamentos.debito, color: '#3b82f6' },
      { name: 'Crédito', value: stats.pagamentos.credito, color: '#8b5cf6' },
      { name: 'PIX', value: stats.pagamentos.pix, color: '#f59e0b' }
    ]
    
    return paymentData.filter(item => item.value > 0)
  }

  function handlePeriodChange(startDate: Date, endDate: Date) {
    setDateRange({ startDate, endDate })
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
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
                Dashboard Barbearia
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '4px', 
                fontSize: '14px',
                margin: 0
              }}>
                Resumo geral do seu negócio
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link 
                href="/dashboard/barbearia/receitas"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                + Receita
              </Link>
              <Link 
                href="/dashboard/barbearia/despesas"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                + Despesa
              </Link>
              <Link
                href="/dashboard/barbearia/anotacoes"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#ca8a04',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
              >
                Anotações
              </Link>
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
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Period Selector */}
        <PeriodSelector onPeriodChange={handlePeriodChange} />

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#10b981', 
                borderRadius: '8px',
                marginRight: '16px'
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                  Receitas do Período
                </p>
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                  R$ {stats.receitasMes.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#ef4444', 
                borderRadius: '8px',
                marginRight: '16px'
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                  Despesas do Período
                </p>
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                  R$ {stats.despesasMes.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '12px', 
                backgroundColor: stats.lucro >= 0 ? '#10b981' : '#ef4444', 
                borderRadius: '8px',
                marginRight: '16px'
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                  Lucro do Período
                </p>
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: stats.lucro >= 0 ? '#10b981' : '#ef4444',
                  margin: 0
                }}>
                  R$ {stats.lucro.toFixed(2).replace('.', ',')}
                </p>
              </div>
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
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
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
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          borderRadius: '8px', 
          padding: '20px',
          border: '1px solid #374151',
          marginBottom: '32px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Formas de Pagamento
          </h3>
          
          {getPaymentMethodsData().length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* Pie Chart */}
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPaymentMethodsData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
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
                        color: '#ffffff',
                        fontSize: '12px'
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
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p style={{ color: '#d1d5db', fontSize: '14px', margin: 0 }}>
                Nenhuma receita registrada
              </p>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
                Adicione receitas para ver as formas de pagamento
              </p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '32px' 
        }}>
          {/* Recent Receitas */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                  Últimas Receitas
                </h3>
                <Link 
                  href="/dashboard/barbearia/receitas" 
                  style={{ 
                    color: '#4ade80', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Ver todas →
                </Link>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {receitas.slice(0, 5).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {receitas.slice(0, 5).map((receita) => (
                    <div key={receita.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px', 
                      backgroundColor: '#374151', 
                      borderRadius: '8px' 
                    }}>
                      <div>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#ffffff',
                          margin: '0 0 4px 0'
                        }}>
                          {receita.categoria_receita?.nome}
                        </p>
                        <p style={{ 
                          color: '#d1d5db', 
                          fontSize: '14px',
                          margin: 0
                        }}>
                          {new Date(receita.data_receita).toLocaleDateString('pt-BR')} • {receita.forma_pagamento}
                        </p>
                      </div>
                      <p style={{ 
                        fontWeight: 'bold', 
                        color: '#4ade80', 
                        fontSize: '20px',
                        margin: 0
                      }}>
                        R$ {receita.valor.toFixed(2).replace('.', ',')}
                      </p>
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

          {/* Recent Despesas */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                  Últimas Despesas
                </h3>
                <Link 
                  href="/dashboard/barbearia/despesas" 
                  style={{ 
                    color: '#f87171', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Ver todas →
                </Link>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {despesas.slice(0, 5).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {despesas.slice(0, 5).map((despesa) => (
                    <div key={despesa.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px', 
                      backgroundColor: '#374151', 
                      borderRadius: '8px' 
                    }}>
                      <div>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#ffffff',
                          margin: '0 0 4px 0'
                        }}>
                          {despesa.categoria_despesa?.nome}
                        </p>
                        <p style={{ 
                          color: '#d1d5db', 
                          fontSize: '14px',
                          margin: 0
                        }}>
                          {new Date(despesa.data_despesa).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p style={{ 
                        fontWeight: 'bold', 
                        color: '#f87171', 
                        fontSize: '20px',
                        margin: 0
                      }}>
                        R$ {despesa.valor.toFixed(2).replace('.', ',')}
                      </p>
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