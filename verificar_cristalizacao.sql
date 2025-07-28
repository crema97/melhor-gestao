-- Verificar se "Cristalização da pintura" foi inserida corretamente
SELECT 
    'VERIFICANDO CATEGORIA:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    cr.tipo_negocio_id,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE cr.nome = 'Cristalização da pintura'
  AND tn.nome = 'Estacionamento';

-- Verificar todas as categorias de receita do estacionamento (apenas ativas)
SELECT 
    'TODAS CATEGORIAS ATIVAS ESTACIONAMENTO:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    cr.tipo_negocio_id
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento'
  AND cr.ativo = true
ORDER BY cr.nome;

-- Teste direto da API - simular a consulta que a API faz
SELECT 
    'TESTE API:' as tipo,
    cr.id,
    cr.nome,
    cr.tipo_negocio_id
FROM categorias_receita cr
WHERE cr.tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
  AND cr.ativo = true
ORDER BY cr.nome; 