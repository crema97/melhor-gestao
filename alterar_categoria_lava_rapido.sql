-- Script para alterar categoria de receita do Lava Rápido
-- Alterar "Lavagem Completa" para "Lavagem com Cera"

-- Primeiro, vamos verificar o ID do tipo de negócio Lava Rápido
SELECT id, nome FROM tipos_negocio WHERE nome = 'Lava Rápido';

-- Agora vamos atualizar a categoria específica
UPDATE categorias_receita 
SET nome = 'Lavagem com Cera'
WHERE nome = 'Lavagem Completa' 
AND tipo_negocio_id = (
    SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido'
);

-- Verificar se a alteração foi feita
SELECT 
    cr.nome as categoria,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Lava Rápido'
ORDER BY cr.nome; 