-- Verificar se as categorias do Salão de Beleza foram adicionadas corretamente

-- 1. Verificar o ID do tipo de negócio "Salão de Beleza"
SELECT id, nome FROM tipos_negocio WHERE nome = 'Salão de Beleza';

-- 2. Verificar categorias de receita do Salão de Beleza
SELECT 
    cr.id,
    cr.nome,
    cr.tipo_negocio_id,
    cr.ativo,
    tn.nome as tipo_negocio_nome
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Salão de Beleza'
ORDER BY cr.nome;

-- 3. Verificar categorias de despesa do Salão de Beleza
SELECT 
    cd.id,
    cd.nome,
    cd.tipo_negocio_id,
    cd.ativo,
    tn.nome as tipo_negocio_nome
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE tn.nome = 'Salão de Beleza'
ORDER BY cd.nome;

-- 4. Contar total de categorias por tipo
SELECT 
    'Receitas' as tipo,
    COUNT(*) as total_categorias
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Salão de Beleza' AND cr.ativo = true

UNION ALL

SELECT 
    'Despesas' as tipo,
    COUNT(*) as total_categorias
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE tn.nome = 'Salão de Beleza' AND cd.ativo = true; 