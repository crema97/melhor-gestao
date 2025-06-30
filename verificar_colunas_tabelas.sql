-- SCRIPT SIMPLES PARA VER TODAS AS COLUNAS
-- Execute este script no SQL Editor do Supabase e me envie os resultados

-- 1. Todas as colunas da tabela usuarios
SELECT '=== COLUNAS DA TABELA USUARIOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. Todas as colunas da tabela usuario_categorias_ativas
SELECT '=== COLUNAS DA TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 3. Verificar se a tabela usuario_categorias_ativas existe
SELECT '=== VERIFICAR SE TABELA EXISTE ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'usuario_categorias_ativas'; 