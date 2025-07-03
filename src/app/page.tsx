'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ 
        backgroundColor: '#1f2937', 
        borderRadius: '12px',
        padding: '48px 32px',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid #374151',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: '0 0 16px 0'
          }}>
            Melhor Gestão
          </h1>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '18px',
            margin: '0 0 32px 0'
          }}>
            Sistema de Gestão para Negócios
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#5ce1e6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4dd1d6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5ce1e6'}
          >
            Acessar Sistema
          </button>
        </div>
      </div>
    </div>
  )
}
