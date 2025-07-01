-- Script para verificar dados de um usuário específico
-- ID do usuário: c3463786-0666-498c-a910-1ac1c799398b

-- 1. Verificar dados do usuário
SELECT 
    u.id,
    u.nome,
    u.email,
    u.nome_negocio,
    u.tipo_negocio_id,
    tn.nome as tipo_negocio,
    u.created_at,
    u.updated_at
FROM usuarios u
LEFT JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE u.id = 'c3463786-0666-498c-a910-1ac1c799398b';

-- 2. Verificar receitas do usuário
SELECT 
    r.id,
    r.valor,
    r.data_receita,
    r.forma_pagamento,
    r.observacoes,
    r.usuario_id,
    cr.nome as categoria_receita,
    r.created_at
FROM receitas r
LEFT JOIN categorias_receita cr ON r.categoria_receita_id = cr.id
WHERE r.usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
ORDER BY r.data_receita DESC;

-- 3. Verificar despesas do usuário
SELECT 
    d.id,
    d.valor,
    d.data_despesa,
    d.observacoes,
    d.usuario_id,
    cd.nome as categoria_despesa,
    d.created_at
FROM despesas d
LEFT JOIN categorias_despesa cd ON d.categoria_despesa_id = cd.id
WHERE d.usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
ORDER BY d.data_despesa DESC;

-- 4. Contar totais do usuário
SELECT 
    'Receitas' as tipo,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'

UNION ALL

SELECT 
    'Despesas' as tipo,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b';

-- 5. Verificar se há dados de outros usuários (possível problema de RLS)
SELECT 
    'Receitas de outros usuários' as tipo,
    COUNT(*) as total
FROM receitas 
WHERE usuario_id != 'c3463786-0666-498c-a910-1ac1c799398b'

UNION ALL

SELECT 
    'Despesas de outros usuários' as tipo,
    COUNT(*) as total
FROM despesas 
WHERE usuario_id != 'c3463786-0666-498c-a910-1ac1c799398b';

-- 6. Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('receitas', 'despesas', 'usuarios')
ORDER BY tablename, policyname;

-- 7. Verificar se o usuário tem permissões corretas
SELECT 
    u.id,
    u.nome,
    u.email,
    auth.uid() as current_user_id,
    CASE 
        WHEN u.user_id = auth.uid() THEN 'SIM - Usuário correto'
        ELSE 'NÃO - Usuário incorreto'
    END as usuario_correto
FROM usuarios u
WHERE u.id = 'c3463786-0666-498c-a910-1ac1c799398b';

-- 8. Verificar dados dos últimos 6 meses (para os gráficos)
SELECT 
    'Receitas últimos 6 meses' as tipo,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_receita >= (CURRENT_DATE - INTERVAL '6 months')

UNION ALL

SELECT 
    'Despesas últimos 6 meses' as tipo,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_despesa >= (CURRENT_DATE - INTERVAL '6 months');

-- 9. Verificar dados dos últimos 7 dias (para os gráficos)
SELECT 
    'Receitas últimos 7 dias' as tipo,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_receita >= (CURRENT_DATE - INTERVAL '7 days')

UNION ALL

SELECT 
    'Despesas últimos 7 dias' as tipo,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_despesa >= (CURRENT_DATE - INTERVAL '7 days'); 