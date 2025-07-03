import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoNegocioId = searchParams.get('tipo')

    console.log('API categorias-por-tipo chamada com tipo:', tipoNegocioId)

    if (!tipoNegocioId) {
      return NextResponse.json({ error: 'Tipo de negócio é obrigatório' }, { status: 400 })
    }

    // Teste primeiro: verificar se conseguimos conectar ao Supabase
    console.log('Testando conexão com Supabase...')
    
    // Buscar categorias de receita vinculadas ao tipo
    console.log('Buscando categorias de receita...')
    const { data: receitas, error: errorReceitas } = await supabaseAdmin
      .from('categorias_receita')
      .select('id, nome, tipo_negocio_id')
      .eq('tipo_negocio_id', tipoNegocioId)

    console.log('Receitas encontradas:', receitas)
    console.log('Erro receitas:', errorReceitas)

    if (errorReceitas) {
      console.error('Erro ao buscar receitas:', errorReceitas)
      return NextResponse.json({ 
        error: 'Erro ao buscar categorias de receita',
        details: errorReceitas.message
      }, { status: 500 })
    }

    // Buscar categorias de despesa vinculadas ao tipo
    console.log('Buscando categorias de despesa...')
    const { data: despesas, error: errorDespesas } = await supabaseAdmin
      .from('categorias_despesa')
      .select('id, nome, tipo_negocio_id')
      .eq('tipo_negocio_id', tipoNegocioId)

    console.log('Despesas encontradas:', despesas)
    console.log('Erro despesas:', errorDespesas)

    if (errorDespesas) {
      console.error('Erro ao buscar despesas:', errorDespesas)
      return NextResponse.json({ 
        error: 'Erro ao buscar categorias de despesa',
        details: errorDespesas.message
      }, { status: 500 })
    }

    const response = {
      receitas: receitas || [],
      despesas: despesas || [],
      total_receitas: receitas?.length || 0,
      total_despesas: despesas?.length || 0
    }

    console.log('Resposta final:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 