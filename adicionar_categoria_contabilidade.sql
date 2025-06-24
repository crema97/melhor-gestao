-- Script para adicionar categoria "Contabilidade" para todos os tipos de negócio
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar os tipos de negócio existentes
SELECT 'TIPOS DE NEGÓCIO EXISTENTES:' as info, id, nome FROM tipos_negocio ORDER BY nome;

-- 2. Adicionar categoria "Contabilidade" para BARBEARIA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Contabilidade', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia'), true);

-- 3. Adicionar categoria "Contabilidade" para ESTACIONAMENTO
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Contabilidade', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true);

-- 4. Adicionar categoria "Contabilidade" para LAVA RÁPIDO
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Contabilidade', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido'), true);

-- 5. Adicionar categoria "Contabilidade" para ESTÉTICA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Contabilidade', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true);

-- 6. Adicionar categoria "Contabilidade" para SALÃO DE BELEZA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Contabilidade', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true);

-- 7. Verificar se as categorias foram adicionadas corretamente
SELECT 
    'CATEGORIAS DE DESPESA - CONTABILIDADE:' as info,
    cd.nome as categoria,
    tn.nome as tipo_negocio,
    cd.ativo
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE cd.nome = 'Contabilidade'
ORDER BY tn.nome;

-- 8. Contar total de categorias por tipo de negócio
SELECT 
    tn.nome as tipo_negocio,
    COUNT(*) as total_categorias_despesa
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE cd.ativo = true
GROUP BY tn.nome
ORDER BY tn.nome; 