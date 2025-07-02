-- =====================================================
-- DEBUG: SIMULAR CONSULTA DO DASHBOARD
-- =====================================================

-- Substitua 'USER_ID_AQUI' pelo user_id real do cliente que está testando
-- Para obter o user_id, execute primeiro a consulta abaixo

-- 1. OBTER USER_ID DO CLIENTE
-- Substitua 'EMAIL_DO_CLIENTE' pelo email real
SELECT 
    'DADOS DO USUÁRIO:' as tipo,
    u.id,
    u.user_id,
    u.nome,
    u.email,
    u.tipo_negocio_id
FROM usuarios u
WHERE u.email = 'EMAIL_DO_CLIENTE';  -- Substitua pelo email real

-- 2. SIMULAR CONSULTA DE DESPESAS (como o dashboard faz)
-- Substitua 'USER_ID_AQUI' pelo user_id obtido acima
SELECT 
    'SIMULAÇÃO DASHBOARD - DESPESAS:' as teste,
    uca.categoria_despesa_id,
    cd.nome as categoria,
    uca.ativo,
    uca.usuario_id
FROM usuario_categorias_ativas uca
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.usuario_id = 'USER_ID_AQUI'  -- Substitua pelo user_id real
  AND uca.ativo = true
  AND cd.ativo = true
ORDER BY cd.nome;

-- 3. SIMULAR CONSULTA DE RECEITAS (como o dashboard faz)
-- Substitua 'USER_ID_AQUI' pelo user_id obtido acima
SELECT 
    'SIMULAÇÃO DASHBOARD - RECEITAS:' as teste,
    uca.categoria_receita_id,
    cr.nome as categoria,
    uca.ativo,
    uca.usuario_id
FROM usuario_categorias_ativas uca
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.usuario_id = 'USER_ID_AQUI'  -- Substitua pelo user_id real
  AND uca.ativo = true
  AND cr.ativo = true
ORDER BY cr.nome;

-- 4. VERIFICAR SE HÁ PROBLEMAS DE RLS
SELECT 
    'VERIFICAÇÃO RLS:' as tipo,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('usuario_categorias_ativas', 'categorias_despesa', 'categorias_receita')
  AND schemaname = 'public';

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS:' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('usuario_categorias_ativas', 'categorias_despesa', 'categorias_receita')
  AND schemaname = 'public';

-- 6. TESTE DIRETO SEM RLS (como admin)
-- Substitua 'USER_ID_AQUI' pelo user_id obtido acima
SELECT 
    'TESTE DIRETO - TODAS AS CATEGORIAS:' as teste,
    uca.id,
    uca.usuario_id,
    uca.categoria_despesa_id,
    uca.categoria_receita_id,
    uca.ativo,
    COALESCE(cd.nome, cr.nome) as categoria,
    CASE 
        WHEN uca.categoria_despesa_id IS NOT NULL THEN 'DESPESA'
        WHEN uca.categoria_receita_id IS NOT NULL THEN 'RECEITA'
    END as tipo
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.usuario_id = 'USER_ID_AQUI'  -- Substitua pelo user_id real
ORDER BY tipo, categoria; 