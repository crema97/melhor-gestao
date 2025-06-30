-- SCRIPT PARA TESTAR SALVAMENTO DE CATEGORIAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há dados na tabela usuario_categorias_ativas
SELECT '=== VERIFICAR DADOS NA TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 2. Verificar dados detalhados (se houver)
SELECT '=== DADOS DETALHADOS ===' as info;
SELECT 
    uca.id,
    uca.usuario_id,
    uca.categoria_receita_id,
    uca.categoria_despesa_id,
    uca.ativo,
    u.nome as nome_usuario,
    u.email as email_usuario,
    cr.nome as categoria_receita,
    cd.nome as categoria_despesa
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.user_id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
ORDER BY uca.id DESC
LIMIT 10;

-- 3. Verificar usuários recentes
SELECT '=== USUÁRIOS RECENTES ===' as info;
SELECT 
    user_id,
    nome,
    email,
    nome_negocio,
    tipo_negocio_id
FROM usuarios
ORDER BY user_id DESC
LIMIT 5;

-- 4. Verificar se há categorias disponíveis
SELECT '=== CATEGORIAS DISPONÍVEIS ===' as info;

SELECT 'Categorias de receita:' as tipo;
SELECT id, nome, tipo_negocio_id FROM categorias_receita LIMIT 5;

SELECT 'Categorias de despesa:' as tipo;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa LIMIT 5;

-- 5. Testar inserção manual (substitua pelos IDs reais)
-- Descomente e substitua pelos IDs reais para testar:
/*
-- Primeiro, pegue um user_id de um usuário recente
SELECT user_id, nome, email FROM usuarios ORDER BY user_id DESC LIMIT 1;

-- Depois, pegue alguns IDs de categorias
SELECT id, nome FROM categorias_receita LIMIT 3;
SELECT id, nome FROM categorias_despesa LIMIT 3;

-- Agora teste a inserção (substitua pelos IDs reais):
INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
VALUES 
    ('user_id_aqui', 'categoria_receita_id_aqui', NULL, true),
    ('user_id_aqui', NULL, 'categoria_despesa_id_aqui', true);
*/

-- 6. Verificar permissões da tabela
SELECT '=== PERMISSÕES DA TABELA ===' as info;
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'usuario_categorias_ativas';

-- 7. Verificar se RLS está desabilitado
SELECT '=== RLS STATUS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 8. Verificar foreign keys
SELECT '=== FOREIGN KEYS ===' as info;
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'usuario_categorias_ativas'; 