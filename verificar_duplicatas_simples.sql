-- VERIFICAR DUPLICATAS NA TABELA USUARIO_CATEGORIAS_ATIVAS (APENAS CONSULTA)
-- Execute este script no SQL Editor do Supabase para verificar se há duplicatas

-- 1. Verificar se há duplicatas
SELECT '=== VERIFICANDO DUPLICATAS ===' as info;

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

-- 2. Mostrar detalhes das duplicatas encontradas
SELECT '=== DETALHES DAS DUPLICATAS ===' as info;

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
    u.email as email_usuario,
    cr.nome as categoria_receita,
    cd.nome as categoria_despesa
FROM duplicatas d
LEFT JOIN usuarios u ON d.usuario_id = u.id
LEFT JOIN categorias_receita cr ON d.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON d.categoria_despesa_id = cd.id
ORDER BY d.quantidade DESC;

-- 3. Mostrar todos os registros duplicados com IDs
SELECT '=== TODOS OS REGISTROS DUPLICADOS ===' as info;

WITH duplicatas AS (
    SELECT 
        usuario_id,
        categoria_receita_id,
        categoria_despesa_id
    FROM usuario_categorias_ativas
    WHERE ativo = true
    GROUP BY usuario_id, categoria_receita_id, categoria_despesa_id
    HAVING COUNT(*) > 1
)
SELECT 
    uca.id,
    uca.usuario_id,
    uca.categoria_receita_id,
    uca.categoria_despesa_id,
    uca.ativo,
    uca.created_at,
    u.nome as nome_usuario,
    cr.nome as categoria_receita,
    cd.nome as categoria_despesa
FROM usuario_categorias_ativas uca
INNER JOIN duplicatas d ON 
    uca.usuario_id = d.usuario_id AND 
    uca.categoria_receita_id = d.categoria_receita_id AND 
    uca.categoria_despesa_id = d.categoria_despesa_id
LEFT JOIN usuarios u ON uca.usuario_id = u.id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.ativo = true
ORDER BY uca.usuario_id, uca.categoria_receita_id, uca.categoria_despesa_id, uca.created_at;

-- 4. Resumo estatístico
SELECT '=== RESUMO ESTATÍSTICO ===' as info;

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
WHERE ativo = true
UNION ALL
SELECT 
    'Registros duplicados' as tipo,
    COUNT(*) - COUNT(DISTINCT (usuario_id, categoria_receita_id, categoria_despesa_id))
FROM usuario_categorias_ativas
WHERE ativo = true; 