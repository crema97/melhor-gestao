-- SCRIPT PARA VERIFICAR PRIMARY KEYS E CONSTRAINTS
-- Execute este script no SQL Editor do Supabase e me envie os resultados

-- 1. Verificar todas as constraints da tabela usuarios
SELECT '=== TODAS AS CONSTRAINTS DA TABELA USUARIOS ===' as info;
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'usuarios'
ORDER BY constraint_type, constraint_name;

-- 2. Verificar primary keys de todas as tabelas
SELECT '=== PRIMARY KEYS DE TODAS AS TABELAS ===' as info;
SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY' 
AND tc.table_name IN ('usuarios', 'categorias_receita', 'categorias_despesa')
ORDER BY tc.table_name;

-- 3. Verificar unique constraints da tabela usuarios
SELECT '=== UNIQUE CONSTRAINTS DA TABELA USUARIOS ===' as info;
SELECT
    tc.constraint_name,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
AND tc.table_name = 'usuarios'
ORDER BY kcu.column_name;

-- 4. Verificar estrutura completa da tabela usuarios
SELECT '=== ESTRUTURA COMPLETA DA TABELA USUARIOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 5. Verificar se há índices únicos
SELECT '=== ÍNDICES ÚNICOS DA TABELA USUARIOS ===' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'usuarios'
AND indexdef LIKE '%UNIQUE%';

-- 6. Verificar se há constraints de chave única
SELECT '=== CONSTRAINTS DE CHAVE ÚNICA ===' as info;
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'usuarios'::regclass
ORDER BY contype, conname;

-- 7. Verificar dados de exemplo da tabela usuarios
SELECT '=== DADOS DE EXEMPLO DA TABELA USUARIOS ===' as info;
SELECT 
    id,
    user_id,
    nome,
    email
FROM usuarios 
LIMIT 3; 