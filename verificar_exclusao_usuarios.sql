-- Script para verificar problemas de exclusão de usuários
-- Execute este script para identificar por que a exclusão não está funcionando

-- 1. Verificar se há usuários na tabela
SELECT 'VERIFICANDO USUÁRIOS:' as info;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT user_id, nome, email, is_admin FROM usuarios LIMIT 5;

-- 2. Verificar se há categorias ativas para usuários
SELECT 'VERIFICANDO CATEGORIAS ATIVAS:' as info;
SELECT COUNT(*) as total_categorias_ativas FROM usuario_categorias_ativas;
SELECT COUNT(DISTINCT usuario_id) as usuarios_com_categorias FROM usuario_categorias_ativas;

-- 3. Verificar RLS na tabela usuarios
SELECT 'RLS NA TABELA USUARIOS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 4. Verificar políticas RLS na tabela usuarios
SELECT 'POLÍTICAS RLS NA TABELA USUARIOS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 5. Verificar permissões da tabela usuarios
SELECT 'PERMISSÕES DA TABELA USUARIOS:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'usuarios';

-- 6. Verificar RLS na tabela usuario_categorias_ativas
SELECT 'RLS NA TABELA USUARIO_CATEGORIAS_ATIVAS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 7. Verificar políticas RLS na tabela usuario_categorias_ativas
SELECT 'POLÍTICAS RLS NA TABELA USUARIO_CATEGORIAS_ATIVAS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- 8. Verificar permissões da tabela usuario_categorias_ativas
SELECT 'PERMISSÕES DA TABELA USUARIO_CATEGORIAS_ATIVAS:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'usuario_categorias_ativas';

-- 9. Verificar se o service role tem permissões
SELECT 'PERMISSÕES DO SERVICE ROLE:' as info;
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname = 'service_role';

-- 10. Verificar constraints que podem impedir exclusão
SELECT 'CONSTRAINTS NA TABELA USUARIOS:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuarios'::regclass;

SELECT 'CONSTRAINTS NA TABELA USUARIO_CATEGORIAS_ATIVAS:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuario_categorias_ativas'::regclass;

-- 11. Teste de exclusão manual (comentado para segurança)
SELECT 'TESTE DE EXCLUSÃO MANUAL:' as info;
-- Descomente as linhas abaixo para testar exclusão manual
/*
DO $$
DECLARE
    usuario_test_email TEXT;
    usuario_test_id UUID;
    categorias_count INTEGER;
BEGIN
    -- Pegar o primeiro usuário não-admin
    SELECT email, user_id INTO usuario_test_email, usuario_test_id 
    FROM usuarios 
    WHERE is_admin = false 
    LIMIT 1;
    
    IF usuario_test_email IS NOT NULL THEN
        RAISE NOTICE 'Testando exclusão do usuário: % (ID: %)', usuario_test_email, usuario_test_id;
        
        -- Verificar quantas categorias o usuário tem
        SELECT COUNT(*) INTO categorias_count 
        FROM usuario_categorias_ativas 
        WHERE usuario_id = usuario_test_id;
        
        RAISE NOTICE 'Usuário tem % categorias ativas', categorias_count;
        
        -- Excluir categorias primeiro
        DELETE FROM usuario_categorias_ativas WHERE usuario_id = usuario_test_id;
        RAISE NOTICE 'Categorias excluídas';
        
        -- Excluir usuário
        DELETE FROM usuarios WHERE email = usuario_test_email;
        RAISE NOTICE 'Usuário excluído';
        
    ELSE
        RAISE NOTICE 'Nenhum usuário não-admin encontrado para teste';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante teste de exclusão: % - %', SQLSTATE, SQLERRM;
END $$;
*/

-- 12. Verificar se há triggers que podem estar interferindo
SELECT 'TRIGGERS NA TABELA USUARIOS:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios';

SELECT 'TRIGGERS NA TABELA USUARIO_CATEGORIAS_ATIVAS:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuario_categorias_ativas';

-- 13. Verificar se há locks ativos
SELECT 'VERIFICANDO LOCKS ATIVOS:' as info;
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity 
WHERE datname = current_database()
AND state = 'active'
AND (query LIKE '%usuarios%' OR query LIKE '%usuario_categorias_ativas%');

-- 14. Verificar estatísticas finais
SELECT 'ESTATÍSTICAS FINAIS:' as info;
SELECT 
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM usuario_categorias_ativas) as total_categorias_ativas,
    (SELECT COUNT(*) FROM usuarios WHERE is_admin = false) as usuarios_nao_admin;

SELECT 'VERIFICAÇÃO DE EXCLUSÃO CONCLUÍDA!' as info; 