import { NextResponse } from 'next/server'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

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

    // Buscar categorias de receita (apenas ativas)
    const receitasResponse = await fetch(`${supabaseUrl}/rest/v1/categorias_receita?tipo_negocio_id=eq.${tipoNegocioId}&ativo=eq.true&select=id,nome,tipo_negocio_id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    // Buscar categorias de despesa (apenas ativas)
    const despesasResponse = await fetch(`${supabaseUrl}/rest/v1/categorias_despesa?tipo_negocio_id=eq.${tipoNegocioId}&ativo=eq.true&select=id,nome,tipo_negocio_id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    const receitas = await receitasResponse.json()
    const despesas = await despesasResponse.json()

    console.log('=== DEBUG API CATEGORIAS ===')
    console.log('Tipo de negócio ID:', tipoNegocioId)
    console.log('Status receitas:', receitasResponse.status)
    console.log('Status despesas:', despesasResponse.status)
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