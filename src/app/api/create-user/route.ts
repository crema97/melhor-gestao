import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { 
      nome, 
      email, 
      senha, 
      nome_negocio, 
      tipo_negocio_id, 
      plano = 'mensal',
      categoriasSelecionadas = { receitas: [], despesas: [] }
    } = await request.json()

    console.log('=== CRIAÇÃO DE USUÁRIO ===')
    console.log('Categorias selecionadas:', categoriasSelecionadas)

    // Verificar campos obrigatórios
    if (!nome || !email || !senha || !nome_negocio || !tipo_negocio_id) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Calcular data de vencimento
    const hoje = new Date()
    const dataVencimento = new Date()
    
    switch (plano) {
      case 'mensal':
        dataVencimento.setMonth(hoje.getMonth() + 1)
        break
      case 'trimestral':
        dataVencimento.setMonth(hoje.getMonth() + 3)
        break
      case 'anual':
        dataVencimento.setFullYear(hoje.getFullYear() + 1)
        break
      default:
        dataVencimento.setMonth(hoje.getMonth() + 1)
    }

    // 1. Criar usuário no auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true
    })

    if (authError) {
      console.error('Erro ao criar usuário no auth:', authError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + authError.message },
        { status: 400 }
      )
    }

    console.log('✅ Usuário criado no auth com ID:', authUser.user.id)

    // 2. Salvar dados na tabela usuarios
    const { data: usuarioInserido, error: insertError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        user_id: authUser.user.id,
        nome,
        email,
        nome_negocio,
        tipo_negocio_id,
        is_admin: false,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status_pagamento: 'ativo',
        plano: plano
      })
      .select('id, user_id, nome, email')
      .single()

    if (insertError) {
      console.error('Erro ao salvar na tabela usuarios:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar dados do cliente: ' + insertError.message },
        { status: 400 }
      )
    }

    console.log('✅ Usuário salvo na tabela usuarios com ID:', usuarioInserido.id)
    console.log('User ID do Auth:', usuarioInserido.user_id)

    // 3. Salvar categorias usando o ID correto da tabela usuarios
    let categoriasSalvas = 0
    let categoriasErros = 0

    if (categoriasSelecionadas.receitas?.length > 0 || categoriasSelecionadas.despesas?.length > 0) {
      console.log('3. Salvando categorias usando usuario_id:', usuarioInserido.id)
      
      // Preparar dados para inserção
      const categoriasParaInserir: Array<{
        usuario_id: string
        categoria_receita_id: string | null
        categoria_despesa_id: string | null
        ativo: boolean
      }> = []

      // Adicionar categorias de receita
      if (categoriasSelecionadas.receitas && categoriasSelecionadas.receitas.length > 0) {
        categoriasSelecionadas.receitas.forEach((categoriaId: string) => {
          categoriasParaInserir.push({
            usuario_id: usuarioInserido.id, // Usar o ID da tabela usuarios, não do Auth
            categoria_receita_id: categoriaId,
            categoria_despesa_id: null,
            ativo: true
          })
        })
      }

      // Adicionar categorias de despesa
      if (categoriasSelecionadas.despesas && categoriasSelecionadas.despesas.length > 0) {
        categoriasSelecionadas.despesas.forEach((categoriaId: string) => {
          categoriasParaInserir.push({
            usuario_id: usuarioInserido.id, // Usar o ID da tabela usuarios, não do Auth
            categoria_receita_id: null,
            categoria_despesa_id: categoriaId,
            ativo: true
          })
        })
      }

      console.log('Total de categorias para inserir:', categoriasParaInserir.length)

      // Inserir categorias uma por vez
      for (let i = 0; i < categoriasParaInserir.length; i++) {
        const categoria = categoriasParaInserir[i]
        console.log(`Inserindo categoria ${i + 1}:`, categoria)

        try {
          const { data, error } = await supabaseAdmin
            .from('usuario_categorias_ativas')
            .insert(categoria)
            .select()

          if (error) {
            console.error(`❌ Erro ao inserir categoria ${i + 1}:`, error)
            categoriasErros++
          } else {
            console.log(`✅ Categoria ${i + 1} inserida com sucesso`)
            categoriasSalvas++
          }
        } catch (err) {
          console.error(`❌ Exceção ao inserir categoria ${i + 1}:`, err)
          categoriasErros++
        }
      }

      console.log(`Resultado: ${categoriasSalvas} sucessos, ${categoriasErros} erros`)
    } else {
      console.log('3. Nenhuma categoria selecionada')
    }

    return NextResponse.json({
      success: true,
      message: `Cliente cadastrado com sucesso! (${categoriasSalvas} categorias salvas)`,
      user: authUser.user,
      usuario_id: usuarioInserido.id, // Retornar o ID correto para uso futuro
      vencimento: dataVencimento.toISOString().split('T')[0],
      categorias_salvas: categoriasSalvas,
      categorias_erros: categoriasErros
    })

  } catch (error) {
    console.error('❌ Erro geral na criação de usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 