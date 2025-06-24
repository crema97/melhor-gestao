-- Script para verificar a estrutura da tabela categorias_despesa
-- Execute este script primeiro para ver a estrutura da tabela

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categorias_despesa'
ORDER BY ordinal_position;

-- Verificar dados existentes (se houver)
SELECT * FROM categorias_despesa LIMIT 5;

-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'categorias_despesa'; 