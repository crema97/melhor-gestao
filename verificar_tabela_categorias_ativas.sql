-- Script para verificar a tabela usuario_categorias_ativas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'usuario_categorias_ativas';

-- 3. Verificar foreign keys
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'usuario_categorias_ativas';

-- 4. Verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- 5. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 6. Verificar permissões do service_role
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'usuario_categorias_ativas' 
AND grantee = 'service_role';

-- 7. Verificar dados existentes na tabela
SELECT 
    id,
    usuario_id,
    categoria_receita_id,
    categoria_despesa_id,
    ativo,
    created_at,
    updated_at
FROM usuario_categorias_ativas
ORDER BY created_at DESC
LIMIT 10;

-- 8. Contar total de registros
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 9. Verificar se há registros com dados inválidos
SELECT 
    COUNT(*) as registros_sem_usuario,
    COUNT(CASE WHEN categoria_receita_id IS NULL AND categoria_despesa_id IS NULL THEN 1 END) as registros_sem_categoria
FROM usuario_categorias_ativas;

-- 10. Verificar se há usuários na tabela usuarios
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- 11. Verificar se há categorias nas tabelas de categorias
SELECT 
    'categorias_receita' as tabela,
    COUNT(*) as total
FROM categorias_receita
UNION ALL
SELECT 
    'categorias_despesa' as tabela,
    COUNT(*) as total
FROM categorias_despesa;

-- 12. Testar inserção manual (substitua pelos IDs reais)
-- SELECT * FROM usuarios LIMIT 1; -- Para obter um user_id válido
-- SELECT * FROM categorias_receita LIMIT 1; -- Para obter um categoria_receita_id válido
-- SELECT * FROM categorias_despesa LIMIT 1; -- Para obter um categoria_despesa_id válido

-- Exemplo de inserção manual (descomente e substitua pelos IDs reais):
-- INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
-- VALUES ('user_id_aqui', 'categoria_receita_id_aqui', NULL, true);

-- 13. Verificar se há triggers que possam estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuario_categorias_ativas'; 