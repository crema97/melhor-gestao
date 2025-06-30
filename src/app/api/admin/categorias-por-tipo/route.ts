import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoNegocioId = searchParams.get('tipo')

    if (!tipoNegocioId) {
      return NextResponse.json({ error: 'Tipo de negócio é obrigatório' }, { status: 400 })
    }

    // Buscar categorias de receita vinculadas ao tipo
    const { data: receitas, error: errorReceitas } = await supabase
      .from('categorias_receita')
      .select('*')
      .eq('tipo_negocio_id', tipoNegocioId)

    if (errorReceitas) {
      console.error('Erro ao buscar receitas:', errorReceitas)
      return NextResponse.json({ error: 'Erro ao buscar categorias de receita' }, { status: 500 })
    }

    // Buscar categorias de despesa vinculadas ao tipo
    const { data: despesas, error: errorDespesas } = await supabase
      .from('categorias_despesa')
      .select('*')
      .eq('tipo_negocio_id', tipoNegocioId)

    if (errorDespesas) {
      console.error('Erro ao buscar despesas:', errorDespesas)
      return NextResponse.json({ error: 'Erro ao buscar categorias de despesa' }, { status: 500 })
    }

    return NextResponse.json({
      receitas: receitas || [],
      despesas: despesas || []
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 