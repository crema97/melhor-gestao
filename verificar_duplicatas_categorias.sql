-- VERIFICAR E CORRIGIR DUPLICATAS NA TABELA USUARIO_CATEGORIAS_ATIVAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar duplicatas antes da correção
SELECT '=== DUPLICATAS ANTES DA CORREÇÃO ===' as info;

SELECT 
    usuario_id,
    categoria_receita_id,
    categoria_despesa_id,
    COUNT(*) as quantidade_duplicatas
FROM usuario_categorias_ativas
WHERE ativo = true
GROUP BY usuario_id, categoria_receita_id, categoria_despesa_id
HAVING COUNT(*) > 1
ORDER BY quantidade_duplicatas DESC;

-- 2. Verificar total de registros antes
SELECT '=== TOTAL DE REGISTROS ANTES ===' as info;
SELECT 
    'Total de registros' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas
WHERE ativo = true
UNION ALL
SELECT 
    'Registros únicos' as tipo,
    COUNT(DISTINCT (usuario_id, categoria_receita_id, categoria_despesa_id))
FROM usuario_categorias_ativas
WHERE ativo = true;

-- 3. Mostrar exemplos de duplicatas
SELECT '=== EXEMPLOS DE DUPLICATAS ===' as info;
WITH duplicatas AS (
    SELECT 
        usuario_id,
        categoria_receita_id,
        categoria_despesa_id,
        COUNT(*) as quantidade
    FROM usuario_categorias_ativas
    WHERE ativo = true
    GROUP BY usuario_id, categoria_receita_id, categoria_despesa_id
    HAVING COUNT(*) > 1
)
SELECT 
    d.usuario_id,
    d.categoria_receita_id,
    d.categoria_despesa_id,
    d.quantidade,
    u.nome as nome_usuario,
    cr.nome as categoria_receita,
    cd.nome as categoria_despesa
FROM duplicatas d
LEFT JOIN usuarios u ON d.usuario_id = u.id
LEFT JOIN categorias_receita cr ON d.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON d.categoria_despesa_id = cd.id
ORDER BY d.quantidade DESC
LIMIT 10;

-- 4. CORREÇÃO: Remover duplicatas mantendo apenas um registro de cada
SELECT '=== INICIANDO CORREÇÃO ===' as info;

-- Criar tabela temporária com registros únicos
CREATE TEMP TABLE temp_categorias_unicas AS
SELECT DISTINCT ON (usuario_id, categoria_receita_id, categoria_despesa_id)
    id,
    usuario_id,
    categoria_receita_id,
    categoria_despesa_id,
    ativo,
    created_at
FROM usuario_categorias_ativas
WHERE ativo = true
ORDER BY usuario_id, categoria_receita_id, categoria_despesa_id, created_at DESC;

-- Desativar todos os registros duplicados
UPDATE usuario_categorias_ativas 
SET ativo = false
WHERE id NOT IN (SELECT id FROM temp_categorias_unicas)
AND ativo = true;

-- 5. Verificar resultado após correção
SELECT '=== RESULTADO APÓS CORREÇÃO ===' as info;

SELECT 
    usuario_id,
    categoria_receita_id,
    categoria_despesa_id,
    COUNT(*) as quantidade_duplicatas
FROM usuario_categorias_ativas
WHERE ativo = true
GROUP BY usuario_id, categoria_receita_id, categoria_despesa_id
HAVING COUNT(*) > 1
ORDER BY quantidade_duplicatas DESC;

-- 6. Verificar total de registros após
SELECT '=== TOTAL DE REGISTROS APÓS ===' as info;
SELECT 
    'Total de registros ativos' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas
WHERE ativo = true
UNION ALL
SELECT 
    'Registros únicos' as tipo,
    COUNT(DISTINCT (usuario_id, categoria_receita_id, categoria_despesa_id))
FROM usuario_categorias_ativas
WHERE ativo = true;

-- 7. Resumo final por usuário
SELECT '=== RESUMO FINAL POR USUÁRIO ===' as info;
SELECT 
    u.nome,
    u.email,
    COUNT(uca.id) as total_categorias_ativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY total_categorias_ativas DESC;

-- 8. Limpar tabela temporária
DROP TABLE IF EXISTS temp_categorias_unicas;

SELECT '=== CORREÇÃO CONCLUÍDA ===' as info;
SELECT 'As duplicatas foram removidas!' as resultado; 