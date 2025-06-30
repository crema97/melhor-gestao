-- VERIFICAR ESTRUTURA DETALHADA DAS TABELAS
-- Execute este script no SQL Editor do Supabase

-- 1. Estrutura da tabela usuarios
SELECT '=== TABELA USUARIOS ===' as info;
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN kcu.constraint_name IS NOT NULL THEN kcu.constraint_name
        ELSE 'N/A'
    END as constraint_info
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.column_name = kcu.column_name 
    AND c.table_name = kcu.table_name
WHERE c.table_name = 'usuarios'
ORDER BY c.ordinal_position;

-- 2. Estrutura da tabela usuario_categorias_ativas
SELECT '=== TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN kcu.constraint_name IS NOT NULL THEN kcu.constraint_name
        ELSE 'N/A'
    END as constraint_info
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.column_name = kcu.column_name 
    AND c.table_name = kcu.table_name
WHERE c.table_name = 'usuario_categorias_ativas'
ORDER BY c.ordinal_position;

-- 3. Verificar foreign keys da tabela usuario_categorias_ativas
SELECT '=== FOREIGN KEYS USUARIO_CATEGORIAS_ATIVAS ===' as info;
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

-- 4. Verificar dados de exemplo nas tabelas
SELECT '=== DADOS DE EXEMPLO - USUARIOS ===' as info;
SELECT id, user_id, nome, email, tipo_negocio_id FROM usuarios LIMIT 3;

SELECT '=== DADOS DE EXEMPLO - USUARIO_CATEGORIAS_ATIVAS ===' as info;
SELECT * FROM usuario_categorias_ativas LIMIT 3;

-- 5. Verificar se há dados na tabela de categorias
SELECT '=== CONTAGEM DE DADOS ===' as info;
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
    'usuario_categorias_ativas' as tabela,
    COUNT(*) as total_registros
FROM usuario_categorias_ativas;

-- 6. Verificar tipos de dados das colunas de ID
SELECT '=== TIPOS DE DADOS DAS COLUNAS ID ===' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE column_name IN ('id', 'user_id', 'usuario_id') 
AND table_name IN ('usuarios', 'usuario_categorias_ativas')
ORDER BY table_name, column_name;

SELECT '=== SCRIPT CONCLUÍDO ===' as info; 