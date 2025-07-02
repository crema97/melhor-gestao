-- =====================================================
-- ADICIONAR CATEGORIA DE DESPESA: MATERIAIS LAVA RÁPIDO
-- =====================================================
-- Tabela: categorias_despesa
-- Tipo de Negócio: Estacionamento (e9f13adb-5f8c-4a26-b7c0-447397f276e2)

-- =====================================================
-- 1. VERIFICAR SE A CATEGORIA JÁ EXISTE
-- =====================================================
SELECT 
    id,
    nome,
    tipo_negocio_id
FROM categorias_despesa 
WHERE nome ILIKE '%materiais%' 
   OR nome ILIKE '%lava%' 
   OR nome ILIKE '%rápido%'
   OR nome ILIKE '%rapido%';

-- =====================================================
-- 2. ADICIONAR CATEGORIA DE DESPESA
-- =====================================================
INSERT INTO categorias_despesa (
    id,
    nome,
    tipo_negocio_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Materiais lava rápido',
    'e9f13adb-5f8c-4a26-b7c0-447397f276e2',
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
    created_at
FROM categorias_despesa 
WHERE tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
  AND nome = 'Materiais lava rápido';

-- =====================================================
-- 4. VERIFICAR TODAS AS CATEGORIAS DE DESPESA DO ESTACIONAMENTO
-- =====================================================
SELECT 
    id,
    nome,
    created_at
FROM categorias_despesa 
WHERE tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
ORDER BY nome; 