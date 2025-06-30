-- Verificar todos os tipos de negócio
SELECT 'Tipos de Negócio:' as info;
SELECT id, nome FROM tipos_negocio;

-- Verificar todas as categorias de receita
SELECT 'Todas as Categorias de Receita:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita;

-- Verificar se existem categorias de receita para cada tipo de negócio
SELECT 'Contagem de categorias de receita por tipo:' as info;
SELECT 
  tn.nome as tipo_negocio,
  COUNT(cr.id) as total_categorias_receita
FROM tipos_negocio tn
LEFT JOIN categorias_receita cr ON tn.id = cr.tipo_negocio_id
GROUP BY tn.id, tn.nome
ORDER BY tn.nome; 