import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoNegocioId = searchParams.get('tipo')

    console.log('API direta chamada com tipo:', tipoNegocioId)

    if (!tipoNegocioId) {
      return NextResponse.json({ error: 'Tipo de negócio é obrigatório' }, { status: 400 })
    }

    // Buscar categorias de receita usando cliente Supabase
    console.log('Buscando categorias de receita...')
    const { data: receitas, error: errorReceitas } = await supabaseAdmin
      .from('categorias_receita')
      .select('id, nome, tipo_negocio_id')
      .eq('tipo_negocio_id', tipoNegocioId)
      .eq('ativo', true)

    if (errorReceitas) {
      console.error('Erro ao buscar receitas:', errorReceitas)
      return NextResponse.json({ 
        error: 'Erro ao buscar categorias de receita',
        details: errorReceitas.message
      }, { status: 500 })
    }

    // Buscar categorias de despesa usando cliente Supabase
    console.log('Buscando categorias de despesa...')
    const { data: despesas, error: errorDespesas } = await supabaseAdmin
      .from('categorias_despesa')
      .select('id, nome, tipo_negocio_id')
      .eq('tipo_negocio_id', tipoNegocioId)
      .eq('ativo', true)

    if (errorDespesas) {
      console.error('Erro ao buscar despesas:', errorDespesas)
      return NextResponse.json({ 
        error: 'Erro ao buscar categorias de despesa',
        details: errorDespesas.message
      }, { status: 500 })
    }

    console.log('=== DEBUG API DIRETA ===')
    console.log('Tipo de negócio ID:', tipoNegocioId)
    console.log('Receitas encontradas:', receitas)
    console.log('Despesas encontradas:', despesas)
    console.log('Total receitas:', receitas?.length || 0)
    console.log('Total despesas:', despesas?.length || 0)
    console.log('=== FIM DEBUG ===')

    return NextResponse.json({
      receitas: receitas || [],
      despesas: despesas || [],
      total_receitas: receitas?.length || 0,
      total_despesas: despesas?.length || 0
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 