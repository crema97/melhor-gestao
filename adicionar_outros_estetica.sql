-- Script para adicionar categoria "Outros" na receita da Estética
-- Execute este script no SQL Editor do Supabase

-- Adicionar categoria "Outros" para Estética
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true);

-- Verificar se foi adicionada corretamente
SELECT 
    'CATEGORIAS RECEITA ESTÉTICA:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY cr.nome; 