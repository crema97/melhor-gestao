import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario_id = searchParams.get('usuario_id')

    console.log('=== BUSCANDO CATEGORIAS ATIVAS ===')
    console.log('Usuario ID recebido:', usuario_id)

    if (!usuario_id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // 1. Primeiro, verificar se o usuario_id é o ID da tabela usuarios ou user_id do Auth
    console.log('1. Verificando tipo de ID recebido...')
    let idCorreto = usuario_id

    // Tentar buscar na tabela usuarios pelo ID (se for o ID da tabela)
    const { data: usuarioPorId, error: errorPorId } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, nome')
      .eq('id', usuario_id)
      .single()

    if (errorPorId) {
      console.log('ID não encontrado na tabela usuarios, tentando buscar por user_id...')
      
      // Se não encontrou pelo ID, tentar buscar pelo user_id (Auth ID)
      const { data: usuarioPorUserId, error: errorPorUserId } = await supabaseAdmin
        .from('usuarios')
        .select('id, user_id, nome')
        .eq('user_id', usuario_id)
        .single()

      if (errorPorUserId) {
        console.error('Erro ao buscar usuário por user_id:', errorPorUserId)
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      }

      if (usuarioPorUserId) {
        idCorreto = usuarioPorUserId.id
        console.log('✅ Usuário encontrado por user_id. ID correto:', idCorreto)
      }
    } else {
      console.log('✅ ID já é o correto da tabela usuarios:', idCorreto)
    }

    console.log('2. Usando ID correto para buscar categorias:', idCorreto)

    // Buscar categorias ativas do usuário
    const { data: categoriasAtivas, error } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .select('*')
      .eq('usuario_id', idCorreto) // Usar o ID correto
      .eq('ativo', true)

    if (error) {
      console.error('Erro ao buscar categorias ativas:', error)
      return NextResponse.json({ 
        error: 'Erro ao buscar categorias: ' + error.message 
      }, { status: 500 })
    }

    console.log('Categorias encontradas:', categoriasAtivas?.length || 0)

    // Separar IDs de receitas e despesas
    const receitasIds = categoriasAtivas
      ?.filter(cat => cat.categoria_receita_id)
      .map(cat => cat.categoria_receita_id)
      .filter(Boolean) || []

    const despesasIds = categoriasAtivas
      ?.filter(cat => cat.categoria_despesa_id)
      .map(cat => cat.categoria_despesa_id)
      .filter(Boolean) || []

    // Buscar detalhes das categorias
    const { data: receitas } = await supabaseAdmin
      .from('categorias_receita')
      .select('id, nome, tipo_negocio_id')
      .in('id', receitasIds)

    const { data: despesas } = await supabaseAdmin
      .from('categorias_despesa')
      .select('id, nome, tipo_negocio_id')
      .in('id', despesasIds)

    const categoriasOrganizadas = {
      receitas: receitas || [],
      despesas: despesas || []
    }

    console.log('Categorias organizadas:', {
      receitas: categoriasOrganizadas.receitas.length,
      despesas: categoriasOrganizadas.despesas.length
    })

    return NextResponse.json({
      success: true,
      categorias: categoriasOrganizadas,
      total: categoriasAtivas?.length || 0,
      usuario_id_usado: idCorreto
    })

  } catch (error) {
    console.error('❌ Erro geral na API de categorias ativas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor: ' + (error as Error).message 
    }, { status: 500 })
  }
} 