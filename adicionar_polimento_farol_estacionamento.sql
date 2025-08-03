-- Script para adicionar "Polimento de Farol" como categoria de receita para o Estacionamento
-- Execute este script no SQL Editor do Supabase

-- ID do tipo de negócio Estacionamento: e9f13adb-5f8c-4a26-b7c0-447397f276e2

-- 1. Adicionar "Polimento de Farol" como categoria de receita para ESTACIONAMENTO
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Polimento de Farol', 'e9f13adb-5f8c-4a26-b7c0-447397f276e2', true);

-- 2. Verificar se a categoria foi inserida corretamente
SELECT 
    'CATEGORIA ADICIONADA:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE cr.nome = 'Polimento de Farol' 
  AND tn.nome = 'Estacionamento';

-- 3. Verificar todas as categorias de receita do Estacionamento (incluindo a nova)
SELECT 
    'TODAS AS CATEGORIAS DE RECEITA - ESTACIONAMENTO:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento' AND cr.ativo = true
ORDER BY cr.nome;

-- 4. Contar total de categorias de receita do Estacionamento
SELECT 
    COUNT(*) as total_categorias_receita_estacionamento
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento' AND cr.ativo = true; 