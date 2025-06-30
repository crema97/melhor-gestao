import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    console.log('API delete-user chamada com email:', email)

    if (!email) {
      return NextResponse.json({ error: 'Email do usuário é obrigatório' }, { status: 400 })
    }

    // 1. Primeiro, verificar se conseguimos acessar a tabela usuarios
    console.log('Verificando acesso à tabela usuarios...')
    const { data: todosUsuarios, error: errorLista } = await supabaseAdmin
      .from('usuarios')
      .select('user_id, nome, email')
      .limit(5)

    if (errorLista) {
      console.error('Erro ao listar usuários:', errorLista)
      return NextResponse.json({ 
        error: 'Erro de permissão ao acessar tabela usuarios: ' + errorLista.message 
      }, { status: 500 })
    }

    console.log('Acesso à tabela usuarios OK. Usuários encontrados:', todosUsuarios?.length || 0)

    // 2. Buscar o usuário específico
    console.log('Buscando usuário específico com email:', email)
    let { data: usuario, error: errorBusca } = await supabaseAdmin
      .from('usuarios')
      .select('user_id, nome, email, is_admin')
      .eq('email', email)
      .single()

    if (errorBusca) {
      console.error('Erro ao buscar usuário:', errorBusca)
      console.error('Detalhes do erro:', {
        message: errorBusca.message,
        details: errorBusca.details,
        hint: errorBusca.hint,
        code: errorBusca.code
      })
      
      // Tentar buscar sem .single() para ver se há resultados
      const { data: usuariosEncontrados, error: errorBuscaMultipla } = await supabaseAdmin
        .from('usuarios')
        .select('user_id, nome, email, is_admin')
        .eq('email', email)

      if (errorBuscaMultipla) {
        console.error('Erro na busca múltipla:', errorBuscaMultipla)
        return NextResponse.json({ 
          error: 'Erro ao buscar usuário: ' + errorBusca.message 
        }, { status: 500 })
      }

      console.log('Resultados da busca múltipla:', usuariosEncontrados)
      
      if (!usuariosEncontrados || usuariosEncontrados.length === 0) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      } else {
        usuario = usuariosEncontrados[0]
        console.log('Usuário encontrado via busca múltipla:', usuario)
      }
    }

    if (!usuario) {
      console.log('Usuário não encontrado após busca')
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('Usuário encontrado:', usuario)

    // Verificar se é um admin (não permitir excluir admins)
    if (usuario.is_admin) {
      console.log('Tentativa de excluir admin bloqueada')
      return NextResponse.json({ error: 'Não é possível excluir usuários administradores' }, { status: 403 })
    }

    // 3. Verificar se há categorias ativas
    console.log('Verificando categorias ativas do usuário...')
    const { data: categoriasAtivas, error: errorCategoriasBusca } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .select('id, categoria_receita_id, categoria_despesa_id')
      .eq('usuario_id', usuario.user_id)
      .eq('ativo', true)

    if (errorCategoriasBusca) {
      console.error('Erro ao buscar categorias:', errorCategoriasBusca)
    } else {
      console.log('Categorias ativas encontradas:', categoriasAtivas?.length || 0)
    }

    // 4. Excluir categorias ativas do usuário
    console.log('Excluindo categorias ativas do usuário...')
    const { error: errorCategorias } = await supabaseAdmin
      .from('usuario_categorias_ativas')
      .delete()
      .eq('usuario_id', usuario.user_id)

    if (errorCategorias) {
      console.error('Erro ao excluir categorias:', errorCategorias)
      // Não retorna erro aqui, continua com a exclusão do usuário
    } else {
      console.log('Categorias excluídas com sucesso')
    }

    // 5. Excluir o usuário da tabela usuarios
    console.log('Excluindo usuário da tabela usuarios...')
    const { error: errorUsuario } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('email', email)

    if (errorUsuario) {
      console.error('Erro ao excluir usuário:', errorUsuario)
      return NextResponse.json({ 
        error: 'Erro ao excluir usuário: ' + errorUsuario.message 
      }, { status: 500 })
    }

    console.log('Usuário excluído da tabela usuarios com sucesso')

    // 6. Excluir o usuário do auth (opcional - pode ser feito separadamente)
    console.log('Excluindo usuário do auth...')
    const { error: errorAuth } = await supabaseAdmin.auth.admin.deleteUser(usuario.user_id)

    if (errorAuth) {
      console.error('Erro ao excluir usuário do auth:', errorAuth)
      // Não retorna erro aqui, pois o usuário já foi excluído da tabela
    } else {
      console.log('Usuário excluído do auth com sucesso')
    }

    return NextResponse.json({
      success: true,
      message: `Usuário "${usuario.nome}" excluído com sucesso!`
    })

  } catch (error) {
    console.error('Erro geral na API delete-user:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 