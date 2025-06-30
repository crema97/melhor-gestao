-- APAGAR DUPLICATAS DA TABELA USUARIO_CATEGORIAS_ATIVAS
-- Execute este script no SQL Editor do Supabase para REMOVER COMPLETAMENTE as duplicatas

-- 1. Verificar duplicatas antes da remoção
SELECT '=== DUPLICATAS ANTES DA REMOÇÃO ===' as info;

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

-- 3. APAGAR DUPLICATAS - MANTENDO APENAS UM REGISTRO DE CADA
SELECT '=== INICIANDO REMOÇÃO DE DUPLICATAS ===' as info;

-- Deletar registros duplicados, mantendo apenas o mais recente de cada
DELETE FROM usuario_categorias_ativas 
WHERE id IN (
    SELECT id FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY usuario_id, categoria_receita_id, categoria_despesa_id 
                ORDER BY created_at DESC
            ) as rn
        FROM usuario_categorias_ativas
        WHERE ativo = true
    ) ranked
    WHERE rn > 1
);

-- 4. Verificar resultado após remoção
SELECT '=== RESULTADO APÓS REMOÇÃO ===' as info;

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

-- 5. Verificar total de registros após
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

-- 6. Resumo final por usuário
SELECT '=== RESUMO FINAL POR USUÁRIO ===' as info;
SELECT 
    u.nome,
    u.email,
    COUNT(uca.id) as total_categorias_ativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY total_categorias_ativas DESC;

-- 7. Verificar integridade dos dados
SELECT '=== VERIFICAÇÃO DE INTEGRIDADE ===' as info;

-- Verificar se todos os registros restantes têm foreign keys válidas
SELECT 
    'Registros com usuario_id inválido' as problema,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.id
WHERE uca.ativo = true AND u.id IS NULL
UNION ALL
SELECT 
    'Registros com categoria_receita_id inválido' as problema,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.ativo = true AND uca.categoria_receita_id IS NOT NULL AND cr.id IS NULL
UNION ALL
SELECT 
    'Registros com categoria_despesa_id inválido' as problema,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.ativo = true AND uca.categoria_despesa_id IS NOT NULL AND cd.id IS NULL;

SELECT '=== REMOÇÃO CONCLUÍDA ===' as info;
SELECT 'As duplicatas foram APAGADAS completamente!' as resultado; 