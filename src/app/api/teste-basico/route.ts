import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('API básica chamada')
    
    return NextResponse.json({ 
      success: true, 
      message: 'API básica funcionando',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 