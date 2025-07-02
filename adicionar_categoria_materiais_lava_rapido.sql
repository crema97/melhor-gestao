-- =====================================================
-- ADICIONAR CATEGORIA DE DESPESA: MATERIAIS LAVA RÁPIDO
-- =====================================================
-- Tipo de Negócio: Estacionamento
-- Categoria: Despesa
-- Nome: Materiais lava rápido

-- =====================================================
-- 1. VERIFICAR SE A CATEGORIA JÁ EXISTE
-- =====================================================
SELECT 
    id,
    nome,
    tipo_negocio_id,
    tipo
FROM categorias 
WHERE nome ILIKE '%materiais%' 
   OR nome ILIKE '%lava%' 
   OR nome ILIKE '%rápido%'
   OR nome ILIKE '%rapido%';

-- =====================================================
-- 2. ADICIONAR CATEGORIA DE DESPESA
-- =====================================================
INSERT INTO categorias (
    id,
    nome,
    tipo_negocio_id,
    tipo,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Materiais lava rápido',
    'e9f13adb-5f8c-4a26-b7c0-447397f276e2',
    'despesa',
    NOW(),
    NOW()
);

-- =====================================================
-- 3. VERIFICAR SE FOI ADICIONADA CORRETAMENTE
-- =====================================================
SELECT 
    id,
    nome,
    tipo_negocio_id,
    tipo,
    created_at
FROM categorias 
WHERE tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
  AND tipo = 'despesa'
ORDER BY nome;

-- =====================================================
-- 4. VERIFICAR TODAS AS CATEGORIAS DE DESPESA DO ESTACIONAMENTO
-- =====================================================
SELECT 
    c.id,
    c.nome,
    c.tipo,
    tn.nome as tipo_negocio
FROM categorias c
JOIN tipos_negocio tn ON c.tipo_negocio_id = tn.id
WHERE c.tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
  AND c.tipo = 'despesa'
ORDER BY c.nome; 