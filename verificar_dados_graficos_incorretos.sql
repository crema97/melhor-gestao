-- Script para verificar dados incorretos que podem estar causando problemas nos gráficos
-- ID do usuário: c3463786-0666-498c-a910-1ac1c799398b

-- 1. Verificar se há dados órfãos (sem usuário válido)
SELECT 
    'Receitas órfãs' as tipo,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id NOT IN (SELECT id FROM usuarios)

UNION ALL

SELECT 
    'Despesas órfãs' as tipo,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id NOT IN (SELECT id FROM usuarios);

-- 2. Verificar dados com valores negativos ou zero
SELECT 
    'Receitas com valores negativos' as tipo,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE valor < 0

UNION ALL

SELECT 
    'Despesas com valores negativos' as tipo,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE valor < 0;

-- 3. Verificar dados com datas inválidas
SELECT 
    'Receitas com datas inválidas' as tipo,
    COUNT(*) as total
FROM receitas 
WHERE data_receita IS NULL OR data_receita = ''

UNION ALL

SELECT 
    'Despesas com datas inválidas' as tipo,
    COUNT(*) as total
FROM despesas 
WHERE data_despesa IS NULL OR data_despesa = '';

-- 4. Verificar dados com categorias inválidas
SELECT 
    'Receitas com categorias inválidas' as tipo,
    COUNT(*) as total
FROM receitas 
WHERE categoria_receita_id NOT IN (SELECT id FROM categorias_receita)

UNION ALL

SELECT 
    'Despesas com categorias inválidas' as tipo,
    COUNT(*) as total
FROM despesas 
WHERE categoria_despesa_id NOT IN (SELECT id FROM categorias_despesa);

-- 5. Verificar dados duplicados
SELECT 
    'Receitas duplicadas' as tipo,
    COUNT(*) - COUNT(DISTINCT usuario_id || valor || data_receita || forma_pagamento || COALESCE(observacoes, '')) as total
FROM receitas

UNION ALL

SELECT 
    'Despesas duplicadas' as tipo,
    COUNT(*) - COUNT(DISTINCT usuario_id || valor || data_despesa || COALESCE(observacoes, '')) as total
FROM despesas;

-- 6. Verificar dados do usuário específico com detalhes
SELECT 
    'Receitas do usuário' as tipo,
    id,
    valor,
    data_receita,
    forma_pagamento,
    observacoes,
    created_at
FROM receitas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
ORDER BY created_at DESC;

SELECT 
    'Despesas do usuário' as tipo,
    id,
    valor,
    data_despesa,
    observacoes,
    created_at
FROM despesas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
ORDER BY created_at DESC;

-- 7. Verificar se há dados de outros usuários sendo acessados
SELECT 
    'Receitas de outros usuários' as tipo,
    usuario_id,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id != 'c3463786-0666-498c-a910-1ac1c799398b'
GROUP BY usuario_id
ORDER BY total DESC;

SELECT 
    'Despesas de outros usuários' as tipo,
    usuario_id,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id != 'c3463786-0666-498c-a910-1ac1c799398b'
GROUP BY usuario_id
ORDER BY total DESC;

-- 8. Verificar dados dos últimos 6 meses (para gráfico mensal)
SELECT 
    'Receitas últimos 6 meses' as tipo,
    DATE_TRUNC('month', data_receita::date) as mes,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_receita >= (CURRENT_DATE - INTERVAL '6 months')
GROUP BY DATE_TRUNC('month', data_receita::date)
ORDER BY mes;

SELECT 
    'Despesas últimos 6 meses' as tipo,
    DATE_TRUNC('month', data_despesa::date) as mes,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_despesa >= (CURRENT_DATE - INTERVAL '6 months')
GROUP BY DATE_TRUNC('month', data_despesa::date)
ORDER BY mes;

-- 9. Verificar dados dos últimos 7 dias (para gráfico diário)
SELECT 
    'Receitas últimos 7 dias' as tipo,
    data_receita as dia,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_receita >= (CURRENT_DATE - INTERVAL '7 days')
GROUP BY data_receita
ORDER BY data_receita;

SELECT 
    'Despesas últimos 7 dias' as tipo,
    data_despesa as dia,
    COUNT(*) as total_registros,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas 
WHERE usuario_id = 'c3463786-0666-498c-a910-1ac1c799398b'
  AND data_despesa >= (CURRENT_DATE - INTERVAL '7 days')
GROUP BY data_despesa
ORDER BY data_despesa; 