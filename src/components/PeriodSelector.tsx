'use client'

import { useState } from 'react'

interface PeriodSelectorProps {
  onPeriodChange: (startDate: Date, endDate: Date) => void
  initialPeriod?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export default function PeriodSelector({ onPeriodChange, initialPeriod = 'month' }: PeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const getDateRange = (period: string) => {
    const today = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (period) {
      case 'today':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        break
      case 'week':
        const dayOfWeek = today.getDay()
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysToSubtract)
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - dayOfWeek), 23, 59, 59)
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), quarter * 3, 1)
        endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59)
        break
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1)
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59)
        break
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate)
          endDate = new Date(customEndDate + 'T23:59:59')
        }
        break
    }

    return { startDate, endDate }
  }

  const handlePeriodChange = (period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom') => {
    setSelectedPeriod(period)
    if (period !== 'custom') {
      const { startDate, endDate } = getDateRange(period)
      onPeriodChange(startDate, endDate)
    }
  }

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const { startDate, endDate } = getDateRange('custom')
      onPeriodChange(startDate, endDate)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR')
  }

  const getCurrentRangeText = () => {
    const { startDate, endDate } = getDateRange(selectedPeriod)
    if (selectedPeriod === 'custom') {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #374151',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { value: 'today', label: 'Hoje' },
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Ano' },
            { value: 'custom', label: 'Personalizado' }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom')}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedPeriod === period.value ? '#8b5cf6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => selectedPeriod !== period.value && (e.currentTarget.style.backgroundColor = '#4b5563')}
              onMouseOut={(e) => selectedPeriod !== period.value && (e.currentTarget.style.backgroundColor = '#374151')}
            >
              {period.label}
            </button>
          ))}
        </div>

        {selectedPeriod === 'custom' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px'
              }}
            />
            <span style={{ color: '#d1d5db', fontSize: '12px' }}>até</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px'
              }}
            />
            <button
              onClick={handleCustomDateChange}
              disabled={!customStartDate || !customEndDate}
              style={{
                padding: '6px 12px',
                backgroundColor: (!customStartDate || !customEndDate) ? '#6b7280' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: (!customStartDate || !customEndDate) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => (customStartDate && customEndDate) && (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseOut={(e) => (customStartDate && customEndDate) && (e.currentTarget.style.backgroundColor = '#10b981')}
            >
              Aplicar
            </button>
          </div>
        )}

        <div style={{ 
          color: '#d1d5db', 
          fontSize: '12px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {getCurrentRangeText()}
        </div>
      </div>
    </div>
  )
} 