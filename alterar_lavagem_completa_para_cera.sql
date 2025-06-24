-- Script para alterar todas as categorias "Lavagem Completa" para "Lavagem com Cera"
-- Mantendo os tamanhos de carro (Carro Grande, Carro Médio, Carro Pequeno, Pickup)

UPDATE categorias_receita 
SET nome = 'Lavagem com Cera - Carro Grande'
WHERE nome = 'Lavagem Completa - Carro Grande';

UPDATE categorias_receita 
SET nome = 'Lavagem com Cera - Carro Médio'
WHERE nome = 'Lavagem Completa - Carro Médio';

UPDATE categorias_receita 
SET nome = 'Lavagem com Cera - Carro Pequeno'
WHERE nome = 'Lavagem Completa - Carro Pequeno';

UPDATE categorias_receita 
SET nome = 'Lavagem com Cera - Pickup'
WHERE nome = 'Lavagem Completa - Pickup';

-- Verificar se as alterações foram feitas
SELECT 
    cr.nome as categoria,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Lava Rápido'
ORDER BY cr.nome; 