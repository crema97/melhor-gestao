-- Script para verificar as categorias da Estética
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o tipo de negócio Estética existe
SELECT 'TIPO DE NEGÓCIO:' as tipo, id, nome FROM tipos_negocio WHERE nome = 'Estética';

-- 2. Verificar categorias de receita da Estética
SELECT 
    'CATEGORIA RECEITA:' as tipo,
    COUNT(*) as total_categorias,
    STRING_AGG(nome, ', ') as categorias
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética';

-- 3. Verificar categorias de despesa da Estética
SELECT 
    'CATEGORIA DESPESA:' as tipo,
    COUNT(*) as total_categorias,
    STRING_AGG(nome, ', ') as categorias
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética';

-- 4. Listar todas as categorias de receita da Estética
SELECT 
    'DETALHES RECEITA:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    cr.tipo_negocio_id
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY cr.nome;

-- 5. Listar todas as categorias de despesa da Estética
SELECT 
    'DETALHES DESPESA:' as tipo,
    cd.id,
    cd.nome,
    cd.ativo,
    cd.tipo_negocio_id
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY cd.nome; 