import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('API de teste chamada')
    
    // Teste simples: buscar tipos de negócio
    const { data, error } = await supabaseAdmin
      .from('tipos_negocio')
      .select('id, nome')
      .limit(5)

    console.log('Dados encontrados:', data)
    console.log('Erro:', error)

    if (error) {
      console.error('Erro no Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'API funcionando corretamente'
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 