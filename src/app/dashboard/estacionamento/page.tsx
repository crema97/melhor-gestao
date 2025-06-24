'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import PeriodSelector from '@/components/PeriodSelector'

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

interface PaymentData {
  name: string
  value: number
  color: string
}

export default function EstacionamentoDashboard() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [paymentData, setPaymentData] = useState<PaymentData[]>([])
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (userId) {
      loadDashboardData(userId)
    }
  }, [userId, dateRange])

  async function checkUserAndLoadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Buscar dados do usuário
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!usuario) {
        router.push('/login')
        return
      }

      setUserId(usuario.id)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  async function loadDashboardData(usuarioId: string) {
    try {
      setLoading(true)

      // Buscar receitas do período
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

      // Buscar despesas do período
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

      loadChartData()
      loadPaymentData(receitasData || [])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
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

  function loadChartData() {
    // Dados mensais (últimos 6 meses)
    const monthlyData = []
    const hoje = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesStr = mes.toLocaleDateString('pt-BR', { month: 'short' })
      
      const receitasMes = receitas.filter(r => {
        const dataReceita = new Date(r.data_receita + 'T00:00:00')
        return dataReceita.getMonth() === mes.getMonth() && dataReceita.getFullYear() === mes.getFullYear()
      }).reduce((sum, r) => sum + r.valor, 0)
      
      const despesasMes = despesas.filter(d => {
        const dataDespesa = new Date(d.data_despesa + 'T00:00:00')
        return dataDespesa.getMonth() === mes.getMonth() && dataDespesa.getFullYear() === mes.getFullYear()
      }).reduce((sum, d) => sum + d.valor, 0)
      
      monthlyData.push({
        mes: mesStr,
        receitas: receitasMes,
        despesas: despesasMes,
        lucro: receitasMes - despesasMes
      })
    }
    
    setMonthlyData(monthlyData)

    // Dados diários (últimos 7 dias)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      const diaStr = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      
      const receitasDia = receitas.filter(r => {
        const dataReceita = new Date(r.data_receita + 'T00:00:00')
        return dataReceita.toDateString() === dia.toDateString()
      }).reduce((sum, r) => sum + r.valor, 0)
      
      const despesasDia = despesas.filter(d => {
        const dataDespesa = new Date(d.data_despesa + 'T00:00:00')
        return dataDespesa.toDateString() === dia.toDateString()
      }).reduce((sum, d) => sum + d.valor, 0)
      
      dailyData.push({
        dia: diaStr,
        receitas: receitasDia,
        despesas: despesasDia,
        lucro: receitasDia - despesasDia
      })
    }
    
    setDailyData(dailyData)
  }

  function loadPaymentData(receitasData: any[]) {
    const pagamentos = {
      dinheiro: 0,
      debito: 0,
      credito: 0,
      pix: 0
    }

    receitasData.forEach(receita => {
      pagamentos[receita.forma_pagamento as keyof typeof pagamentos] += receita.valor
    })

    const paymentData = [
      { name: 'Dinheiro', value: pagamentos.dinheiro, color: '#10b981' },
      { name: 'Débito', value: pagamentos.debito, color: '#3b82f6' },
      { name: 'Crédito', value: pagamentos.credito, color: '#8b5cf6' },
      { name: 'PIX', value: pagamentos.pix, color: '#f59e0b' }
    ].filter(item => item.value > 0)

    setPaymentData(paymentData)
  }

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0)
  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0)
  const lucro = totalReceitas - totalDespesas

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #374151',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#d1d5db' }}>Carregando dashboard...</p>
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
                Dashboard Estacionamento
              </h1>
              <p style={{ 
                color: '#d1d5db', 
                marginTop: '8px', 
                fontSize: '18px',
                margin: 0
              }}>
                Resumo geral do seu negócio
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link 
                href="/dashboard/estacionamento/receitas"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                + Nova Receita
              </Link>
              <Link 
                href="/dashboard/estacionamento/despesas"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                + Nova Despesa
              </Link>
              <Link
                href="/dashboard/estacionamento/anotacoes"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ca8a04',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
              >
                Anotações
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        {/* Period Selector */}
        <PeriodSelector onPeriodChange={handlePeriodChange} />

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px', 
          marginBottom: '48px' 
        }}>
          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
                padding: '16px', 
              backgroundColor: '#10b981', 
                borderRadius: '8px',
                marginRight: '24px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  Receitas do Período
                </p>
                <p style={{ 
                  fontSize: '30px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                    R$ {totalReceitas.toFixed(2).replace('.', ',')}
                  </p>
                </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
                padding: '16px', 
              backgroundColor: '#ef4444', 
                borderRadius: '8px',
                marginRight: '24px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  Despesas do Período
                </p>
                <p style={{ 
                  fontSize: '30px', 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  margin: 0
                }}>
                    R$ {totalDespesas.toFixed(2).replace('.', ',')}
                  </p>
                </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
                padding: '16px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '8px',
                marginRight: '24px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                <p style={{ color: '#d1d5db', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  Lucro do Período
                </p>
                  <p style={{ 
                  fontSize: '30px', 
                    fontWeight: 'bold', 
                  color: lucro >= 0 ? '#4ade80' : '#f87171',
                    margin: 0 
                  }}>
                    R$ {lucro.toFixed(2).replace('.', ',')}
                  </p>
                </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '32px', 
          marginBottom: '48px' 
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
              padding: '32px',
          border: '1px solid #374151',
          marginBottom: '48px'
            }}>
              <h3 style={{ 
            fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>
                Formas de Pagamento
              </h3>
          
          {paymentData.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '32px',
              alignItems: 'center'
            }}>
              {/* Pie Chart */}
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {paymentData.map((item) => (
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
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p style={{ color: '#d1d5db', fontSize: '18px', margin: 0 }}>
                Nenhum pagamento registrado no período
              </p>
          </div>
        )}
        </div>

        {/* Recent Transactions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
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
                  href="/dashboard/estacionamento/receitas" 
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
                  href="/dashboard/estacionamento/despesas" 
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