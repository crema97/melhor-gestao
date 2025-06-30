-- Script para verificar e corrigir problemas de RLS na tabela usuario_categorias_ativas
-- Este script identifica e resolve problemas de permissão que podem impedir inserções

-- 1. Verificar se RLS está habilitado
SELECT 'Verificando se RLS está habilitado:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 2. Verificar políticas RLS existentes
SELECT 'Políticas RLS existentes:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- 3. Verificar permissões da tabela
SELECT 'Permissões da tabela:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'usuario_categorias_ativas';

-- 4. Verificar se o service role tem permissões
SELECT 'Verificando permissões do service role:' as info;
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname = 'service_role' OR rolname LIKE '%service%';

-- 5. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable read access for all users" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable all for service role" ON usuario_categorias_ativas;

-- 6. Criar política permissiva para service role
CREATE POLICY "Enable all for service role" ON usuario_categorias_ativas
FOR ALL USING (true) WITH CHECK (true);

-- 7. Verificar se a política foi criada
SELECT 'Política criada:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- 8. Garantir que o service role tem todas as permissões necessárias
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 9. Verificar se há triggers que podem estar interferindo
SELECT 'Verificando triggers na tabela:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuario_categorias_ativas';

-- 10. Verificar se há constraints que podem estar causando problemas
SELECT 'Verificando constraints:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuario_categorias_ativas'::regclass;

-- 11. Teste de inserção com service role (simulado)
-- Este teste verifica se a inserção funciona com as políticas atuais
DO $$
DECLARE
    usuario_test_id UUID;
    categoria_test_id UUID;
    insert_result RECORD;
BEGIN
    -- Pegar dados de teste
    SELECT user_id INTO usuario_test_id FROM usuarios LIMIT 1;
    SELECT id INTO categoria_test_id FROM categorias_receita WHERE ativo = true LIMIT 1;
    
    IF usuario_test_id IS NOT NULL AND categoria_test_id IS NOT NULL THEN
        -- Tentar inserção
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES (usuario_test_id, categoria_test_id, NULL, true)
        RETURNING * INTO insert_result;
        
        RAISE NOTICE 'Inserção bem-sucedida! ID: %', insert_result.id;
        
        -- Limpar o teste
        DELETE FROM usuario_categorias_ativas WHERE id = insert_result.id;
        RAISE NOTICE 'Registro de teste removido.';
    ELSE
        RAISE NOTICE 'Dados de teste não encontrados.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante teste de inserção: %', SQLERRM;
        RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;

-- 12. Verificar se há problemas de tipo de dados
SELECT 'Verificando tipos de dados das colunas:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 13. Verificar se há problemas de sequência (se houver coluna id)
SELECT 'Verificando sequências:' as info;
SELECT sequence_name, data_type, start_value, minimum_value, maximum_value
FROM information_schema.sequences 
WHERE sequence_schema = 'public' 
AND sequence_name LIKE '%usuario_categorias_ativas%';

-- 14. Verificar se há problemas de índices
SELECT 'Verificando índices:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'usuario_categorias_ativas';

-- 15. Verificar se há problemas de foreign keys
SELECT 'Verificando foreign keys:' as info;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'usuario_categorias_ativas';

-- 16. Verificar se há problemas de deadlock ou locks
SELECT 'Verificando locks ativos:' as info;
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

SELECT 'Verificação de RLS concluída!' as info; 