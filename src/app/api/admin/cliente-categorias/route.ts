import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuario_id')

    if (!usuarioId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Buscar categorias ativas do usuário
    const { data: categoriasAtivas, error } = await supabase
      .from('usuario_categorias_ativas')
      .select(`
        *,
        categoria_receita:categorias_receita(id, nome),
        categoria_despesa:categorias_despesa(id, nome)
      `)
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)

    if (error) {
      console.error('Erro ao buscar categorias ativas:', error)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    // Separar receitas e despesas
    const receitas = categoriasAtivas
      ?.filter(cat => cat.categoria_receita)
      .map(cat => cat.categoria_receita) || []

    const despesas = categoriasAtivas
      ?.filter(cat => cat.categoria_despesa)
      .map(cat => cat.categoria_despesa) || []

    return NextResponse.json({
      receitas,
      despesas
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 