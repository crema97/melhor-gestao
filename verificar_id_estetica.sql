-- Script para verificar o ID da Estética
-- Execute este script no SQL Editor do Supabase

-- Verificar todos os tipos de negócio
SELECT id, nome FROM tipos_negocio ORDER BY nome;

-- Verificar especificamente a Estética
SELECT id, nome FROM tipos_negocio WHERE nome = 'Estética';

-- Verificar se as categorias foram criadas corretamente
SELECT 
    cr.nome as categoria_receita,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY cr.nome; 