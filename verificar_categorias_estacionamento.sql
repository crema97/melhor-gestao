-- =====================================================
-- VERIFICAR CATEGORIAS ESTACIONAMENTO
-- =====================================================

-- 1. VERIFICAR TODOS OS USUÁRIOS DE ESTACIONAMENTO
SELECT 
    'USUÁRIOS ESTACIONAMENTO:' as tipo,
    u.id,
    u.user_id,
    u.nome,
    u.email,
    u.tipo_negocio_id,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento'
ORDER BY u.nome;

-- 2. VERIFICAR CATEGORIAS DE DESPESA DISPONÍVEIS PARA ESTACIONAMENTO
SELECT 
    'CATEGORIAS DESPESA ESTACIONAMENTO:' as tipo,
    cd.id,
    cd.nome,
    cd.ativo,
    cd.tipo_negocio_id
FROM categorias_despesa cd
WHERE cd.tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
ORDER BY cd.nome;

-- 3. VERIFICAR CATEGORIAS DE RECEITA DISPONÍVEIS PARA ESTACIONAMENTO
SELECT 
    'CATEGORIAS RECEITA ESTACIONAMENTO:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    cr.tipo_negocio_id
FROM categorias_receita cr
WHERE cr.tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
ORDER BY cr.nome;

-- 4. VERIFICAR ASSOCIAÇÕES DE CATEGORIAS PARA CADA USUÁRIO
-- Substitua 'EMAIL_DO_USUARIO' pelo email real do usuário que está testando
SELECT 
    'ASSOCIAÇÕES CATEGORIAS DESPESA:' as tipo,
    u.nome as usuario,
    u.email,
    uca.usuario_id,
    uca.categoria_despesa_id,
    cd.nome as categoria,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE u.email = 'EMAIL_DO_USUARIO'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cd.nome;

SELECT 
    'ASSOCIAÇÕES CATEGORIAS RECEITA:' as tipo,
    u.nome as usuario,
    u.email,
    uca.usuario_id,
    uca.categoria_receita_id,
    cr.nome as categoria,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE u.email = 'EMAIL_DO_USUARIO'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cr.nome;

-- 5. VERIFICAR SE HÁ CATEGORIAS INATIVAS
SELECT 
    'CATEGORIAS INATIVAS:' as tipo,
    u.nome as usuario,
    u.email,
    CASE 
        WHEN uca.categoria_despesa_id IS NOT NULL THEN 'DESPESA'
        WHEN uca.categoria_receita_id IS NOT NULL THEN 'RECEITA'
    END as tipo_categoria,
    COALESCE(cd.nome, cr.nome) as categoria,
    uca.ativo
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE u.email = 'EMAIL_DO_USUARIO'  -- Substitua pelo email real
  AND uca.ativo = false
ORDER BY tipo_categoria, categoria;

-- 6. CONTAR CATEGORIAS POR USUÁRIO
SELECT 
    'RESUMO CATEGORIAS POR USUÁRIO:' as tipo,
    u.nome as usuario,
    u.email,
    COUNT(CASE WHEN uca.categoria_despesa_id IS NOT NULL AND uca.ativo = true THEN 1 END) as despesas_ativas,
    COUNT(CASE WHEN uca.categoria_receita_id IS NOT NULL AND uca.ativo = true THEN 1 END) as receitas_ativas,
    COUNT(CASE WHEN uca.ativo = false THEN 1 END) as categorias_inativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON uca.usuario_id = u.user_id
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento'
GROUP BY u.id, u.nome, u.email
ORDER BY u.nome; 