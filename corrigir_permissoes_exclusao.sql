-- Script para corrigir problemas de permissões na exclusão de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Garantir que o service_role tem todas as permissões necessárias
GRANT ALL PRIVILEGES ON TABLE usuarios TO service_role;
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO service_role;

-- 2. Garantir que o service_role pode usar as sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. Desabilitar RLS temporariamente para o service_role (se necessário)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_categorias_ativas DISABLE ROW LEVEL SECURITY;

-- 4. Ou criar políticas específicas para o service_role
-- Política para permitir que service_role acesse todos os usuários
DROP POLICY IF EXISTS "service_role_access_usuarios" ON usuarios;
CREATE POLICY "service_role_access_usuarios" ON usuarios
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política para permitir que service_role acesse todas as categorias
DROP POLICY IF EXISTS "service_role_access_categorias" ON usuario_categorias_ativas;
CREATE POLICY "service_role_access_categorias" ON usuario_categorias_ativas
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Verificar se há constraints que impedem exclusão
-- Se houver foreign keys, pode ser necessário configurar CASCADE DELETE

-- 6. Garantir que o service_role tem permissão para excluir do auth
-- (Isso é feito automaticamente pelo Supabase, mas vamos verificar)

-- 7. Verificar se há triggers que possam estar interferindo
-- Se houver triggers, pode ser necessário desabilitá-los temporariamente

-- 8. Testar se conseguimos listar usuários
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- 9. Testar se conseguimos buscar um usuário específico
-- (Substitua pelo email real que está dando problema)
-- SELECT * FROM usuarios WHERE email = 'email_do_usuario@exemplo.com';

-- 10. Verificar se conseguimos excluir categorias
SELECT COUNT(*) as total_categorias FROM usuario_categorias_ativas;

-- 11. Se tudo estiver funcionando, reabilitar RLS com políticas corretas
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE usuario_categorias_ativas ENABLE ROW LEVEL SECURITY;

-- 12. Criar políticas mais específicas se necessário
-- Política para usuários verem apenas seus próprios dados
DROP POLICY IF EXISTS "usuarios_see_own_data" ON usuarios;
CREATE POLICY "usuarios_see_own_data" ON usuarios
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política para admins verem todos os dados
DROP POLICY IF EXISTS "admins_see_all_usuarios" ON usuarios;
CREATE POLICY "admins_see_all_usuarios" ON usuarios
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- Política para categorias
DROP POLICY IF EXISTS "usuarios_see_own_categorias" ON usuario_categorias_ativas;
CREATE POLICY "usuarios_see_own_categorias" ON usuario_categorias_ativas
    FOR ALL
    TO authenticated
    USING (usuario_id = auth.uid());

-- Política para admins verem todas as categorias
DROP POLICY IF EXISTS "admins_see_all_categorias" ON usuario_categorias_ativas;
CREATE POLICY "admins_see_all_categorias" ON usuario_categorias_ativas
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    ); 