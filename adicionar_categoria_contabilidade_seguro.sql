-- Script SEGURO para adicionar categoria "Contabilidade" para todos os tipos de negócio
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a categoria "Contabilidade" já existe para cada tipo de negócio
SELECT 
    'VERIFICANDO CATEGORIAS EXISTENTES:' as info,
    tn.nome as tipo_negocio,
    CASE 
        WHEN cd.nome IS NOT NULL THEN 'JÁ EXISTE'
        ELSE 'NÃO EXISTE'
    END as status_contabilidade
FROM tipos_negocio tn
LEFT JOIN categorias_despesa cd ON cd.tipo_negocio_id = tn.id AND cd.nome = 'Contabilidade'
ORDER BY tn.nome;

-- 2. Adicionar categoria "Contabilidade" apenas onde não existe
-- BARBEARIA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo)
SELECT 'Contabilidade', tn.id, true
FROM tipos_negocio tn
WHERE tn.nome = 'Barbearia'
AND NOT EXISTS (
    SELECT 1 FROM categorias_despesa cd 
    WHERE cd.tipo_negocio_id = tn.id AND cd.nome = 'Contabilidade'
);

-- ESTACIONAMENTO
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo)
SELECT 'Contabilidade', tn.id, true
FROM tipos_negocio tn
WHERE tn.nome = 'Estacionamento'
AND NOT EXISTS (
    SELECT 1 FROM categorias_despesa cd 
    WHERE cd.tipo_negocio_id = tn.id AND cd.nome = 'Contabilidade'
);

-- LAVA RÁPIDO
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo)
SELECT 'Contabilidade', tn.id, true
FROM tipos_negocio tn
WHERE tn.nome = 'Lava Rápido'
AND NOT EXISTS (
    SELECT 1 FROM categorias_despesa cd 
    WHERE cd.tipo_negocio_id = tn.id AND cd.nome = 'Contabilidade'
);

-- ESTÉTICA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo)
SELECT 'Contabilidade', tn.id, true
FROM tipos_negocio tn
WHERE tn.nome = 'Estética'
AND NOT EXISTS (
    SELECT 1 FROM categorias_despesa cd 
    WHERE cd.tipo_negocio_id = tn.id AND cd.nome = 'Contabilidade'
);

-- SALÃO DE BELEZA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo)
SELECT 'Contabilidade', tn.id, true
FROM tipos_negocio tn
WHERE tn.nome = 'Salão de Beleza'
AND NOT EXISTS (
    SELECT 1 FROM categorias_despesa cd 
    WHERE cd.tipo_negocio_id = tn.id AND cd.nome = 'Contabilidade'
);

-- 3. Verificar resultado final
SELECT 
    'RESULTADO FINAL - CATEGORIAS DE DESPESA:' as info,
    tn.nome as tipo_negocio,
    cd.nome as categoria,
    cd.ativo
FROM tipos_negocio tn
LEFT JOIN categorias_despesa cd ON cd.tipo_negocio_id = tn.id
WHERE cd.nome = 'Contabilidade' OR cd.nome IS NULL
ORDER BY tn.nome, cd.nome;

-- 4. Contar total de categorias por tipo de negócio
SELECT 
    tn.nome as tipo_negocio,
    COUNT(cd.id) as total_categorias_despesa
FROM tipos_negocio tn
LEFT JOIN categorias_despesa cd ON cd.tipo_negocio_id = tn.id AND cd.ativo = true
GROUP BY tn.nome
ORDER BY tn.nome; 