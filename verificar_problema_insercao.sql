-- Script para verificar especificamente o problema de inserção na tabela usuario_categorias_ativas
-- Execute este script para identificar por que as categorias não estão sendo salvas

-- 1. Verificar se a tabela existe
SELECT 'VERIFICANDO EXISTÊNCIA DA TABELA:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas';

-- 2. Verificar estrutura da tabela
SELECT 'ESTRUTURA DA TABELA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 'RLS HABILITADO:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 4. Verificar políticas RLS
SELECT 'POLÍTICAS RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- 5. Verificar permissões da tabela
SELECT 'PERMISSÕES DA TABELA:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'usuario_categorias_ativas';

-- 6. Verificar se o service role tem permissões
SELECT 'PERMISSÕES DO SERVICE ROLE:' as info;
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname = 'service_role';

-- 7. Verificar constraints
SELECT 'CONSTRAINTS:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuario_categorias_ativas'::regclass;

-- 8. Verificar se há dados na tabela
SELECT 'DADOS NA TABELA:' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 9. Verificar se há dados para teste
SELECT 'DADOS PARA TESTE:' as info;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_categorias_receita FROM categorias_receita WHERE ativo = true;
SELECT COUNT(*) as total_categorias_despesa FROM categorias_despesa WHERE ativo = true;

-- 10. Teste de inserção com tratamento de erro detalhado
SELECT 'TESTE DE INSERÇÃO DETALHADO:' as info;
DO $$
DECLARE
    usuario_test_id UUID;
    categoria_receita_test_id UUID;
    categoria_despesa_test_id UUID;
    insert_result RECORD;
    error_message TEXT;
    error_detail TEXT;
    error_hint TEXT;
    error_context TEXT;
BEGIN
    -- Pegar dados de teste
    SELECT user_id INTO usuario_test_id FROM usuarios LIMIT 1;
    SELECT id INTO categoria_receita_test_id FROM categorias_receita WHERE ativo = true LIMIT 1;
    SELECT id INTO categoria_despesa_test_id FROM categorias_despesa WHERE ativo = true LIMIT 1;
    
    RAISE NOTICE 'Dados de teste:';
    RAISE NOTICE '  Usuário: %', usuario_test_id;
    RAISE NOTICE '  Categoria Receita: %', categoria_receita_test_id;
    RAISE NOTICE '  Categoria Despesa: %', categoria_despesa_test_id;
    
    -- Teste de inserção
    IF usuario_test_id IS NOT NULL AND categoria_receita_test_id IS NOT NULL THEN
        BEGIN
            INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
            VALUES (usuario_test_id, categoria_receita_test_id, NULL, true)
            RETURNING * INTO insert_result;
            
            RAISE NOTICE 'Inserção bem-sucedida! ID: %', insert_result.id;
        EXCEPTION
            WHEN OTHERS THEN
                GET STACKED DIAGNOSTICS 
                    error_message = MESSAGE_TEXT,
                    error_detail = PG_EXCEPTION_DETAIL,
                    error_hint = PG_EXCEPTION_HINT,
                    error_context = PG_EXCEPTION_CONTEXT;
                
                RAISE NOTICE 'Erro na inserção:';
                RAISE NOTICE '  Mensagem: %', error_message;
                RAISE NOTICE '  Detalhes: %', error_detail;
                RAISE NOTICE '  Dica: %', error_hint;
                RAISE NOTICE '  Contexto: %', error_context;
        END;
    ELSE
        RAISE NOTICE 'Dados de teste não encontrados!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS 
            error_message = MESSAGE_TEXT,
            error_detail = PG_EXCEPTION_DETAIL,
            error_hint = PG_EXCEPTION_HINT,
            error_context = PG_EXCEPTION_CONTEXT;
        
        RAISE NOTICE 'Erro geral:';
        RAISE NOTICE '  Mensagem: %', error_message;
        RAISE NOTICE '  Detalhes: %', error_detail;
        RAISE NOTICE '  Dica: %', error_hint;
        RAISE NOTICE '  Contexto: %', error_context;
END $$;

-- 11. Verificar se a inserção funcionou
SELECT 'VERIFICANDO SE A INSERÇÃO FUNCIONOU:' as info;
SELECT 
    uca.id,
    uca.usuario_id,
    u.nome as nome_usuario,
    uca.categoria_receita_id,
    cr.nome as nome_categoria_receita,
    uca.categoria_despesa_id,
    cd.nome as nome_categoria_despesa,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.user_id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
ORDER BY uca.created_at DESC
LIMIT 5;

-- 12. Verificar logs de erro (se houver)
SELECT 'VERIFICANDO LOGS DE ERRO:' as info;
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
AND query LIKE '%usuario_categorias_ativas%';

-- 13. Verificar se há problemas de deadlock
SELECT 'VERIFICANDO LOCKS:' as info;
SELECT 
    locktype,
    database,
    relation::regclass,
    mode,
    granted
FROM pg_locks 
WHERE relation::regclass::text LIKE '%usuario_categorias_ativas%';

SELECT 'VERIFICAÇÃO DE PROBLEMA DE INSERÇÃO CONCLUÍDA!' as info; 