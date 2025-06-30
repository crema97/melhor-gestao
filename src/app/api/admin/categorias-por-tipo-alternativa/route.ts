import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoNegocioId = searchParams.get('tipo')

    console.log('API alternativa chamada com tipo:', tipoNegocioId)

    if (!tipoNegocioId) {
      return NextResponse.json({ error: 'Tipo de negócio é obrigatório' }, { status: 400 })
    }

    const supabaseUrl = 'https://yfiygrsowmctczlnrdky.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaXlncnNvd21jdGN6bG5yZGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIyMTU3NCwiZXhwIjoyMDY1Nzk3NTc0fQ.3s4_ewJgBBZ2V3GqEvWzDxz-5mnPHTUmfnOB3kManJc'

    // Buscar categorias de receita
    const receitasResponse = await fetch(`${supabaseUrl}/rest/v1/categorias_receita?tipo_negocio_id=eq.${tipoNegocioId}&select=id,nome,tipo_negocio_id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    // Buscar categorias de despesa
    const despesasResponse = await fetch(`${supabaseUrl}/rest/v1/categorias_despesa?tipo_negocio_id=eq.${tipoNegocioId}&select=id,nome,tipo_negocio_id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    const receitas = await receitasResponse.json()
    const despesas = await despesasResponse.json()

    console.log('Receitas encontradas:', receitas)
    console.log('Despesas encontradas:', despesas)

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