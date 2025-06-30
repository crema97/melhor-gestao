import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yfiygrsowmctczlnrdky.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!)

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, nome_negocio, tipo_negocio_id, plano = 'mensal', categoriasSelecionadas = [] } = await request.json()

    // Verificar se todos os campos estão presentes
    if (!nome || !email || !senha || !nome_negocio || !tipo_negocio_id) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Calcular data de vencimento baseada no plano
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

    // 2. Salvar dados na tabela usuarios com informações de mensalidade
    const { data: usuario, error: insertError } = await supabaseAdmin
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
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao salvar na tabela usuarios:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar dados do cliente: ' + insertError.message },
        { status: 400 }
      )
    }

    // 3. Salvar categorias selecionadas na tabela usuario_categorias_ativas
    if (categoriasSelecionadas.length > 0) {
      const categoriasParaSalvar = categoriasSelecionadas.map((cat: any) => ({
        usuario_id: usuario.id,
        categoria_receita_id: cat.receita_id || null,
        categoria_despesa_id: cat.despesa_id || null,
        ativo: true
      }))

      const { error: categoriasError } = await supabaseAdmin
        .from('usuario_categorias_ativas')
        .insert(categoriasParaSalvar)

      if (categoriasError) {
        console.error('Erro ao salvar categorias:', categoriasError)
        // Não retorna erro aqui, pois o usuário já foi criado
        console.warn('Usuário criado, mas categorias não foram salvas')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente cadastrado com sucesso!',
      user: authUser.user,
      vencimento: dataVencimento.toISOString().split('T')[0]
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 