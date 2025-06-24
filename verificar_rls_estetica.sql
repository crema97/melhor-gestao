-- Script para verificar as políticas RLS das tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar políticas RLS da tabela categorias_receita
SELECT 
    'CATEGORIAS_RECEITA RLS:' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'categorias_receita';

-- 2. Verificar políticas RLS da tabela categorias_despesa
SELECT 
    'CATEGORIAS_DESPESA RLS:' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'categorias_despesa';

-- 3. Verificar se RLS está habilitado nas tabelas
SELECT 
    'RLS STATUS:' as tipo,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('categorias_receita', 'categorias_despesa', 'receitas', 'despesas');

-- 4. Testar consulta direta nas categorias
SELECT 
    'TESTE CONSULTA:' as tipo,
    COUNT(*) as total_categorias_receita
FROM categorias_receita 
WHERE tipo_negocio_id = 'de8e8986-ee3d-4473-a09e-c81abb071de4';

SELECT 
    'TESTE CONSULTA:' as tipo,
    COUNT(*) as total_categorias_despesa
FROM categorias_despesa 
WHERE tipo_negocio_id = 'de8e8986-ee3d-4473-a09e-c81abb071de4'; 