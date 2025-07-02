-- =====================================================
-- VERIFICAR NOME CORRETO DA TABELA DE CATEGORIAS
-- =====================================================

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS DO BANCO
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 2. PROCURAR TABELAS QUE CONTÊM "CATEGORIA"
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name ILIKE '%categoria%'
ORDER BY table_name;

-- =====================================================
-- 3. PROCURAR TABELAS QUE CONTÊM "CATEGORY"
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name ILIKE '%category%'
ORDER BY table_name;

-- =====================================================
-- 4. VERIFICAR ESTRUTURA DAS TABELAS ENCONTRADAS
-- =====================================================
-- Execute este comando substituindo 'NOME_DA_TABELA' pelo nome encontrado acima
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'NOME_DA_TABELA' 
-- ORDER BY ordinal_position; 