-- Script para verificar a estrutura da tabela anotacoes
-- Execute este script no SQL Editor do Supabase

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'anotacoes'
ORDER BY ordinal_position;

-- Verificar dados existentes (se houver)
SELECT * FROM anotacoes LIMIT 5; 