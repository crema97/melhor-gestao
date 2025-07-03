import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

const supabaseUrl = 'https://yfiygrsowmctczlnrdky.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!)

export async function POST(request: NextRequest) {
  try {
    const { email, novaSenha } = await request.json()

    // Verificar se todos os campos estão presentes
    if (!email || !novaSenha) {
      return NextResponse.json(
        { error: 'Email e nova senha são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Buscar o user_id pelo email
    const { data: usuario, error: fetchError } = await supabaseAdmin
      .from('usuarios')
      .select('user_id')
      .eq('email', email)
      .single()

    if (fetchError || !usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // 2. Atualizar a senha no auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      usuario.user_id,
      { password: novaSenha }
    )

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha: ' + updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso!'
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 