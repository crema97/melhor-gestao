import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Primeiro, buscar o usuário pelo email
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('user_id')
      .eq('email', email)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Deletar o usuário do Auth do Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(usuario.user_id)

    if (authError) {
      console.error('Erro ao deletar usuário do Auth:', authError)
      return NextResponse.json({ error: 'Erro ao deletar usuário do sistema de autenticação' }, { status: 500 })
    }

    // Deletar o usuário da tabela usuarios
    const { error: deleteError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('email', email)

    if (deleteError) {
      console.error('Erro ao deletar usuário da tabela:', deleteError)
      return NextResponse.json({ error: 'Erro ao deletar dados do usuário' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Usuário deletado com sucesso' })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 