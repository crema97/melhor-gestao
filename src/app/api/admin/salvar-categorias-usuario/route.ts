import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface CategoriaParaInserir {
  usuario_id: string
  categoria_receita_id: string | null
  categoria_despesa_id: string | null
  ativo: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, categorias } = await request.json()

    console.log('=== SALVANDO CATEGORIAS DO USUÁRIO ===')
    console.log('Usuario ID recebido:', usuario_id)
    console.log('Categorias recebidas:', categorias)

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

    console.log('2. Usando ID correto para operações:', idCorreto)

    // 2. Limpar categorias existentes do usuário
    console.log('3. Limpando categorias existentes...')
    const { error: deleteError } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .delete()
      .eq('usuario_id', idCorreto)

    if (deleteError) {
      console.error('Erro ao limpar categorias existentes:', deleteError)
      // Não retorna erro, continua tentando inserir
    } else {
      console.log('✅ Categorias existentes removidas')
    }

    // 3. Preparar dados para inserção
    const categoriasParaInserir: CategoriaParaInserir[] = []

    // Adicionar categorias de receita
    if (categorias.receitas && categorias.receitas.length > 0) {
      console.log('4a. Preparando categorias de receita:', categorias.receitas)
      categorias.receitas.forEach((categoriaId: string) => {
        categoriasParaInserir.push({
          usuario_id: idCorreto, // Usar o ID correto
          categoria_receita_id: categoriaId,
          categoria_despesa_id: null,
          ativo: true
        })
      })
    }

    // Adicionar categorias de despesa
    if (categorias.despesas && categorias.despesas.length > 0) {
      console.log('4b. Preparando categorias de despesa:', categorias.despesas)
      categorias.despesas.forEach((categoriaId: string) => {
        categoriasParaInserir.push({
          usuario_id: idCorreto, // Usar o ID correto
          categoria_receita_id: null,
          categoria_despesa_id: categoriaId,
          ativo: true
        })
      })
    }

    console.log('5. Total de categorias para inserir:', categoriasParaInserir.length)

    if (categoriasParaInserir.length === 0) {
      console.log('⚠️ Nenhuma categoria para inserir')
      return NextResponse.json({
        success: true,
        message: 'Nenhuma categoria selecionada',
        categorias_salvas: 0
      })
    }

    // 4. Inserir categorias uma por vez para garantir que todas sejam salvas
    console.log('6. Inserindo categorias uma por vez...')
    let sucessos = 0
    let erros = 0
    const errosDetalhados: Array<{ categoria: CategoriaParaInserir, erro: string }> = []

    for (let i = 0; i < categoriasParaInserir.length; i++) {
      const categoria = categoriasParaInserir[i]
      console.log(`Inserindo categoria ${i + 1}/${categoriasParaInserir.length}:`, categoria)

      try {
        const { data, error } = await supabaseAdmin
          .from('usuario_categorias_ativas')
          .insert(categoria)
          .select()

        if (error) {
          console.error(`❌ Erro ao inserir categoria ${i + 1}:`, error)
          erros++
          errosDetalhados.push({
            categoria: categoria,
            erro: error.message
          })
        } else {
          console.log(`✅ Categoria ${i + 1} inserida com sucesso:`, data)
          sucessos++
        }
      } catch (err) {
        console.error(`❌ Exceção ao inserir categoria ${i + 1}:`, err)
        erros++
        errosDetalhados.push({
          categoria: categoria,
          erro: (err as Error).message
        })
      }
    }

    console.log(`7. Resultado final: ${sucessos} sucessos, ${erros} erros`)

    // 5. Verificar se as categorias foram realmente salvas
    console.log('8. Verificando categorias salvas...')
    const { data: categoriasSalvas, error: errorVerificacao } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .select('*')
      .eq('usuario_id', idCorreto)
      .eq('ativo', true)

    if (errorVerificacao) {
      console.error('Erro ao verificar categorias salvas:', errorVerificacao)
    } else {
      console.log('Categorias encontradas no banco:', categoriasSalvas?.length || 0)
    }

    return NextResponse.json({
      success: true,
      message: `Categorias salvas: ${sucessos} sucessos, ${erros} erros`,
      categorias_salvas: sucessos,
      categorias_erros: erros,
      erros_detalhados: errosDetalhados,
      categorias_verificadas: categoriasSalvas?.length || 0,
      usuario_id_usado: idCorreto
    })

  } catch (error) {
    console.error('❌ Erro geral na API de salvar categorias:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor: ' + (error as Error).message 
    }, { status: 500 })
  }
} 