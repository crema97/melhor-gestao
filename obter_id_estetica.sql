-- Script para obter o ID da Estética
-- Execute este script no SQL Editor do Supabase

-- Obter o ID da Estética
SELECT 
    'ID_DA_ESTETICA' as placeholder,
    id as id_real,
    nome
FROM tipos_negocio 
WHERE nome = 'Estética';

-- Verificar se existe
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Estética encontrada'
        ELSE 'Estética NÃO encontrada'
    END as status
FROM tipos_negocio 
WHERE nome = 'Estética'; 