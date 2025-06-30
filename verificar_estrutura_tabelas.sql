-- SCRIPT PARA VERIFICAR ESTRUTURA DAS TABELAS
-- Execute este script no SQL Editor do Supabase e me envie os resultados

-- 1. Estrutura da tabela usuarios
SELECT '=== TABELA USUARIOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. Estrutura da tabela categorias_receita
SELECT '=== TABELA CATEGORIAS_RECEITA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'categorias_receita'
ORDER BY ordinal_position;

-- 3. Estrutura da tabela categorias_despesa
SELECT '=== TABELA CATEGORIAS_DESPESA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'categorias_despesa'
ORDER BY ordinal_position;

-- 4. Verificar se a tabela usuario_categorias_ativas existe
SELECT '=== VERIFICAR SE TABELA USUARIO_CATEGORIAS_ATIVAS EXISTE ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'usuario_categorias_ativas';

-- 5. Se existir, mostrar estrutura da tabela usuario_categorias_ativas
SELECT '=== ESTRUTURA TABELA USUARIO_CATEGORIAS_ATIVAS (se existir) ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 6. Verificar constraints da tabela usuarios
SELECT '=== CONSTRAINTS DA TABELA USUARIOS ===' as info;
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'usuarios';

-- 7. Verificar foreign keys da tabela usuarios
SELECT '=== FOREIGN KEYS DA TABELA USUARIOS ===' as info;
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
AND tc.table_name = 'usuarios';

-- 8. Verificar primary keys
SELECT '=== PRIMARY KEYS ===' as info;
SELECT
    tc.table_name,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY' 
AND tc.table_name IN ('usuarios', 'categorias_receita', 'categorias_despesa', 'usuario_categorias_ativas');

-- 9. Verificar alguns dados de exemplo
SELECT '=== DADOS DE EXEMPLO ===' as info;

SELECT 'Usuários (primeiros 3):' as info;
SELECT user_id, nome, email FROM usuarios LIMIT 3;

SELECT 'Categorias de receita (primeiras 3):' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita LIMIT 3;

SELECT 'Categorias de despesa (primeiras 3):' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa LIMIT 3;

-- 10. Verificar se há dados na tabela usuario_categorias_ativas
SELECT '=== DADOS NA TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 11. Verificar tipos de dados UUID
SELECT '=== VERIFICAR SE COLUNAS SÃO UUID ===' as info;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('usuarios', 'categorias_receita', 'categorias_despesa', 'usuario_categorias_ativas')
AND column_name IN ('user_id', 'id', 'usuario_id', 'categoria_receita_id', 'categoria_despesa_id')
ORDER BY table_name, column_name; 