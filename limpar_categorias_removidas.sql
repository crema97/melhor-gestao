-- =====================================================
-- LIMPAR CATEGORIAS REMOVIDAS DA TABELA USUARIO_CATEGORIAS_ATIVAS
-- =====================================================
-- Execute este script quando remover categorias da tabela categorias_despesa
-- mas elas ainda aparecem no formulário de cadastro

-- =====================================================
-- 1. VERIFICAR CATEGORIAS ÓRFÃS (QUE NÃO EXISTEM MAIS)
-- =====================================================
SELECT 
    uca.id,
    uca.usuario_id,
    u.nome as nome_usuario,
    uca.categoria_despesa_id,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
LEFT JOIN usuarios u ON uca.usuario_id = u.user_id
WHERE uca.categoria_despesa_id IS NOT NULL
  AND cd.id IS NULL  -- Categoria não existe mais
  AND uca.ativo = true
ORDER BY u.nome;

-- =====================================================
-- 2. VERIFICAR CATEGORIAS DE RECEITA ÓRFÃS TAMBÉM
-- =====================================================
SELECT 
    uca.id,
    uca.usuario_id,
    u.nome as nome_usuario,
    uca.categoria_receita_id,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN usuarios u ON uca.usuario_id = u.user_id
WHERE uca.categoria_receita_id IS NOT NULL
  AND cr.id IS NULL  -- Categoria não existe mais
  AND uca.ativo = true
ORDER BY u.nome;

-- =====================================================
-- 3. REMOVER CATEGORIAS DE DESPESA ÓRFÃS
-- =====================================================
DELETE FROM usuario_categorias_ativas 
WHERE categoria_despesa_id IS NOT NULL
  AND categoria_despesa_id NOT IN (SELECT id FROM categorias_despesa);

-- =====================================================
-- 4. REMOVER CATEGORIAS DE RECEITA ÓRFÃS
-- =====================================================
DELETE FROM usuario_categorias_ativas 
WHERE categoria_receita_id IS NOT NULL
  AND categoria_receita_id NOT IN (SELECT id FROM categorias_receita);

-- =====================================================
-- 5. VERIFICAR RESULTADO APÓS LIMPEZA
-- =====================================================
SELECT 
    'CATEGORIAS DE DESPESA ATIVAS:' as tipo,
    COUNT(*) as total
FROM usuario_categorias_ativas uca
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.ativo = true
UNION ALL
SELECT 
    'CATEGORIAS DE RECEITA ATIVAS:' as tipo,
    COUNT(*) as total
FROM usuario_categorias_ativas uca
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.ativo = true;

-- =====================================================
-- 6. VERIFICAR CATEGORIAS POR USUÁRIO
-- =====================================================
SELECT 
    u.nome as nome_usuario,
    u.email,
    COUNT(CASE WHEN uca.categoria_despesa_id IS NOT NULL THEN 1 END) as categorias_despesa,
    COUNT(CASE WHEN uca.categoria_receita_id IS NOT NULL THEN 1 END) as categorias_receita
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY u.nome; 