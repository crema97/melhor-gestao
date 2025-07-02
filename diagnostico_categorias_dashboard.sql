-- =====================================================
-- DIAGNÓSTICO: CATEGORIAS NÃO APARECEM NO DASHBOARD
-- =====================================================

-- =====================================================
-- 1. VERIFICAR USUÁRIO ESPECÍFICO
-- =====================================================
-- Substitua 'EMAIL_DO_CLIENTE' pelo email real do cliente
SELECT 
    u.id,
    u.user_id,
    u.nome,
    u.email,
    u.tipo_negocio_id,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE u.email = 'EMAIL_DO_CLIENTE';  -- Substitua pelo email real

-- =====================================================
-- 2. VERIFICAR CATEGORIAS ATIVAS DO USUÁRIO
-- =====================================================
-- Substitua 'EMAIL_DO_CLIENTE' pelo email real do cliente
SELECT 
    'CATEGORIAS DE DESPESA ATIVAS:' as tipo,
    uca.id,
    uca.usuario_id,
    uca.categoria_despesa_id,
    cd.nome as categoria_despesa,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cd.nome;

SELECT 
    'CATEGORIAS DE RECEITA ATIVAS:' as tipo,
    uca.id,
    uca.usuario_id,
    uca.categoria_receita_id,
    cr.nome as categoria_receita,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cr.nome;

-- =====================================================
-- 3. VERIFICAR SE AS CATEGORIAS ESTÃO ATIVAS NA TABELA PRINCIPAL
-- =====================================================
SELECT 
    'CATEGORIAS DE DESPESA DISPONÍVEIS:' as tipo,
    cd.id,
    cd.nome,
    cd.ativo,
    cd.tipo_negocio_id
FROM categorias_despesa cd
WHERE cd.tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
ORDER BY cd.nome;

SELECT 
    'CATEGORIAS DE RECEITA DISPONÍVEIS:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    cr.tipo_negocio_id
FROM categorias_receita cr
WHERE cr.tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
ORDER BY cr.nome;

-- =====================================================
-- 4. VERIFICAR SE HÁ PROBLEMAS DE RLS (ROW LEVEL SECURITY)
-- =====================================================
-- Verificar se as tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('usuario_categorias_ativas', 'categorias_despesa', 'categorias_receita')
  AND schemaname = 'public';

-- =====================================================
-- 5. TESTE DE CONSULTA SIMULANDO O DASHBOARD
-- =====================================================
-- Simular a consulta que o dashboard faz
-- Substitua 'USER_ID_AQUI' pelo user_id real do usuário
SELECT 
    'SIMULAÇÃO DASHBOARD - DESPESAS:' as teste,
    uca.categoria_despesa_id,
    cd.nome as categoria,
    uca.ativo
FROM usuario_categorias_ativas uca
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.usuario_id = 'USER_ID_AQUI'  -- Substitua pelo user_id real
  AND uca.ativo = true
  AND cd.ativo = true
ORDER BY cd.nome;

SELECT 
    'SIMULAÇÃO DASHBOARD - RECEITAS:' as teste,
    uca.categoria_receita_id,
    cr.nome as categoria,
    uca.ativo
FROM usuario_categorias_ativas uca
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.usuario_id = 'USER_ID_AQUI'  -- Substitua pelo user_id real
  AND uca.ativo = true
  AND cr.ativo = true
ORDER BY cr.nome;

-- =====================================================
-- 6. VERIFICAR SE HÁ CATEGORIAS INATIVAS
-- =====================================================
-- Verificar se há categorias marcadas como inativas
SELECT 
    'CATEGORIAS INATIVAS:' as tipo,
    uca.categoria_despesa_id,
    cd.nome as categoria,
    uca.ativo
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND uca.ativo = false
ORDER BY cd.nome; 