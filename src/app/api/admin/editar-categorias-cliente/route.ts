import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

// GET - Buscar categorias atuais do cliente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuario_id')

    console.log('API editar-categorias-cliente GET chamada com usuario_id:', usuarioId)

    if (!usuarioId) {
      console.log('Erro: ID do usuário não fornecido')
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // 1. Primeiro, verificar se o usuarioId é o ID da tabela usuarios ou user_id do Auth
    console.log('1. Verificando tipo de ID recebido...')
    let idCorreto = usuarioId

    // Tentar buscar na tabela usuarios pelo ID (se for o ID da tabela)
    const { data: usuarioPorId, error: errorPorId } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, nome, tipo_negocio_id')
      .eq('id', usuarioId)
      .single()

    if (errorPorId) {
      console.log('ID não encontrado na tabela usuarios, tentando buscar por user_id...')
      
      // Se não encontrou pelo ID, tentar buscar pelo user_id (Auth ID)
      const { data: usuarioPorUserId, error: errorPorUserId } = await supabaseAdmin
        .from('usuarios')
        .select('id, user_id, nome, tipo_negocio_id')
        .eq('user_id', usuarioId)
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

    console.log('2. Usando ID correto para operações:', idCorreto)

    // Buscar dados do usuário para saber o tipo de negócio
    console.log('3. Buscando dados do usuário...')
    const { data: usuario, error: errorUsuario } = await supabaseAdmin
      .from('usuarios')
      .select('tipo_negocio_id')
      .eq('id', idCorreto)
      .single()

    if (errorUsuario) {
      console.error('Erro ao buscar usuário:', errorUsuario)
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!usuario) {
      console.log('Usuário não encontrado na tabela usuarios')
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('Usuário encontrado, tipo_negocio_id:', usuario.tipo_negocio_id)

    // Buscar categorias disponíveis para o tipo de negócio
    console.log('4. Buscando categorias de receita...')
    const { data: categoriasDisponiveis, error: errorCategorias } = await supabaseAdmin
      .from('categorias_receita')
      .select('id, nome')
      .eq('tipo_negocio_id', usuario.tipo_negocio_id)

    if (errorCategorias) {
      console.error('Erro ao buscar categorias de receita:', errorCategorias)
    } else {
      console.log('Categorias de receita encontradas:', categoriasDisponiveis?.length || 0)
    }

    console.log('5. Buscando categorias de despesa...')
    const { data: despesasDisponiveis, error: errorDespesas } = await supabaseAdmin
      .from('categorias_despesa')
      .select('id, nome')
      .eq('tipo_negocio_id', usuario.tipo_negocio_id)

    if (errorDespesas) {
      console.error('Erro ao buscar categorias de despesa:', errorDespesas)
    } else {
      console.log('Categorias de despesa encontradas:', despesasDisponiveis?.length || 0)
    }

    // Buscar categorias atualmente ativas do usuário
    console.log('6. Buscando categorias ativas do usuário...')
    const { data: categoriasAtivas, error: errorAtivas } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .select('categoria_receita_id, categoria_despesa_id')
      .eq('usuario_id', idCorreto) // Usar o ID correto
      .eq('ativo', true)

    if (errorAtivas) {
      console.error('Erro ao buscar categorias ativas:', errorAtivas)
    } else {
      console.log('Categorias ativas encontradas:', categoriasAtivas?.length || 0)
      console.log('Categorias ativas:', categoriasAtivas)
    }

    if (errorCategorias || errorDespesas || errorAtivas) {
      console.error('Erro em uma das consultas:', { errorCategorias, errorDespesas, errorAtivas })
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    // Separar categorias ativas
    const receitasAtivas = categoriasAtivas
      ?.filter(cat => cat.categoria_receita_id)
      .map(cat => cat.categoria_receita_id) || []

    const despesasAtivas = categoriasAtivas
      ?.filter(cat => cat.categoria_despesa_id)
      .map(cat => cat.categoria_despesa_id) || []

    console.log('Receitas ativas:', receitasAtivas)
    console.log('Despesas ativas:', despesasAtivas)

    const response = {
      categoriasDisponiveis: {
        receitas: categoriasDisponiveis || [],
        despesas: despesasDisponiveis || []
      },
      categoriasAtivas: {
        receitas: receitasAtivas,
        despesas: despesasAtivas
      },
      usuario_id_usado: idCorreto
    }

    console.log('Resposta final:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro geral na API editar-categorias-cliente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Atualizar categorias do cliente
export async function POST(request: Request) {
  try {
    const { usuarioId, categoriasSelecionadas } = await request.json()

    if (!usuarioId || !categoriasSelecionadas) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // 1. Primeiro, verificar se o usuarioId é o ID da tabela usuarios ou user_id do Auth
    console.log('1. Verificando tipo de ID recebido...')
    let idCorreto = usuarioId

    // Tentar buscar na tabela usuarios pelo ID (se for o ID da tabela)
    const { data: usuarioPorId, error: errorPorId } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, nome')
      .eq('id', usuarioId)
      .single()

    if (errorPorId) {
      console.log('ID não encontrado na tabela usuarios, tentando buscar por user_id...')
      
      // Se não encontrou pelo ID, tentar buscar pelo user_id (Auth ID)
      const { data: usuarioPorUserId, error: errorPorUserId } = await supabaseAdmin
        .from('usuarios')
        .select('id, user_id, nome')
        .eq('user_id', usuarioId)
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

    console.log('2. Usando ID correto para operações:', idCorreto)

    // APAGAR TODAS AS CATEGORIAS ATUAIS DO USUÁRIO (nova estratégia)
    console.log('3. APAGANDO todas as categorias atuais...')
    const { error: deleteError } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .delete()
      .eq('usuario_id', idCorreto)

    if (deleteError) {
      console.error('Erro ao apagar categorias existentes:', deleteError)
      return NextResponse.json({ error: 'Erro ao limpar categorias existentes' }, { status: 500 })
    } else {
      console.log('✅ Todas as categorias existentes foram APAGADAS')
    }

    // Preparar novas categorias para inserir
    const categoriasParaSalvar: Array<{
      usuario_id: string
      categoria_receita_id: string | null
      categoria_despesa_id: string | null
      ativo: boolean
    }> = []

    // Adicionar categorias de receita selecionadas
    if (categoriasSelecionadas.receitas && categoriasSelecionadas.receitas.length > 0) {
      console.log('4a. Preparando categorias de receita:', categoriasSelecionadas.receitas)
      categoriasSelecionadas.receitas.forEach((categoriaId: string) => {
        categoriasParaSalvar.push({
          usuario_id: idCorreto, // Usar o ID correto
          categoria_receita_id: categoriaId,
          categoria_despesa_id: null,
          ativo: true
        })
      })
    }

    // Adicionar categorias de despesa selecionadas
    if (categoriasSelecionadas.despesas && categoriasSelecionadas.despesas.length > 0) {
      console.log('4b. Preparando categorias de despesa:', categoriasSelecionadas.despesas)
      categoriasSelecionadas.despesas.forEach((categoriaId: string) => {
        categoriasParaSalvar.push({
          usuario_id: idCorreto, // Usar o ID correto
          categoria_receita_id: null,
          categoria_despesa_id: categoriaId,
          ativo: true
        })
      })
    }

    // Inserir novas categorias se houver alguma selecionada
    if (categoriasParaSalvar.length > 0) {
      console.log('5. Inserindo novas categorias...')
      const { error: insertError } = await supabaseAdmin
        .from('usuario_categorias_ativas')
        .insert(categoriasParaSalvar)

      if (insertError) {
        console.error('Erro ao salvar categorias:', insertError)
        return NextResponse.json({ error: 'Erro ao salvar categorias' }, { status: 500 })
      }
      
      console.log(`✅ ${categoriasParaSalvar.length} categorias inseridas com sucesso`)
    } else {
      console.log('⚠️ Nenhuma categoria selecionada para inserir')
    }

    // Verificar resultado final
    console.log('6. Verificando categorias finais...')
    const { data: categoriasFinais, error: errorVerificacao } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .select('*')
      .eq('usuario_id', idCorreto)
      .eq('ativo', true)

    if (errorVerificacao) {
      console.error('Erro ao verificar categorias finais:', errorVerificacao)
    } else {
      console.log('Categorias finais no banco:', categoriasFinais?.length || 0)
    }

    return NextResponse.json({
      success: true,
      message: 'Categorias atualizadas com sucesso! (estratégia: apagar e recriar)',
      categorias_inseridas: categoriasParaSalvar.length,
      categorias_finais: categoriasFinais?.length || 0,
      usuario_id_usado: idCorreto
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 