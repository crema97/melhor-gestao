-- Script para verificar usuários da Estética
-- Execute este script no SQL Editor do Supabase

-- Verificar todos os usuários e seus tipos de negócio
SELECT 
    u.nome,
    u.email,
    u.nome_negocio,
    tn.nome as tipo_negocio,
    u.tipo_negocio_id
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
ORDER BY u.nome;

-- Verificar especificamente usuários da Estética
SELECT 
    u.nome,
    u.email,
    u.nome_negocio,
    tn.nome as tipo_negocio,
    u.tipo_negocio_id
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY u.nome; 