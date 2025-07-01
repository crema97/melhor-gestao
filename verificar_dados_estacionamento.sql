-- Script para verificar dados do estacionamento
-- Execute este script para diagnosticar por que os gráficos estão mostrando dados incorretos

-- 1. Verificar usuários do tipo estacionamento
SELECT 
    u.id,
    u.nome,
    u.email,
    u.nome_negocio,
    u.tipo_negocio_id,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome ILIKE '%estacionamento%'
ORDER BY u.created_at DESC;

-- 2. Verificar receitas para usuários de estacionamento
SELECT 
    r.id,
    r.valor,
    r.data_receita,
    r.forma_pagamento,
    r.observacoes,
    r.usuario_id,
    u.nome as nome_usuario,
    u.nome_negocio,
    cr.nome as categoria_receita
FROM receitas r
JOIN usuarios u ON r.usuario_id = u.id
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
LEFT JOIN categorias_receita cr ON r.categoria_receita_id = cr.id
WHERE tn.nome ILIKE '%estacionamento%'
ORDER BY r.data_receita DESC;

-- 3. Verificar despesas para usuários de estacionamento
SELECT 
    d.id,
    d.valor,
    d.data_despesa,
    d.observacoes,
    d.usuario_id,
    u.nome as nome_usuario,
    u.nome_negocio,
    cd.nome as categoria_despesa
FROM despesas d
JOIN usuarios u ON d.usuario_id = u.id
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
LEFT JOIN categorias_despesa cd ON d.categoria_despesa_id = cd.id
WHERE tn.nome ILIKE '%estacionamento%'
ORDER BY d.data_despesa DESC;

-- 4. Contar total de receitas e despesas por usuário de estacionamento
SELECT 
    u.id,
    u.nome,
    u.nome_negocio,
    COUNT(r.id) as total_receitas,
    COALESCE(SUM(r.valor), 0) as valor_total_receitas,
    COUNT(d.id) as total_despesas,
    COALESCE(SUM(d.valor), 0) as valor_total_despesas
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
LEFT JOIN receitas r ON u.id = r.usuario_id
LEFT JOIN despesas d ON u.id = d.usuario_id
WHERE tn.nome ILIKE '%estacionamento%'
GROUP BY u.id, u.nome, u.nome_negocio
ORDER BY u.created_at DESC;

-- 5. Verificar se há dados de outros tipos de negócio que possam estar interferindo
SELECT 
    tn.nome as tipo_negocio,
    COUNT(u.id) as total_usuarios,
    COUNT(r.id) as total_receitas,
    COUNT(d.id) as total_despesas
FROM tipos_negocio tn
LEFT JOIN usuarios u ON tn.id = u.tipo_negocio_id
LEFT JOIN receitas r ON u.id = r.usuario_id
LEFT JOIN despesas d ON u.id = d.usuario_id
GROUP BY tn.id, tn.nome
ORDER BY total_receitas DESC, total_despesas DESC;

-- 6. Verificar se há dados órfãos (sem usuário válido)
SELECT 
    'Receitas órfãs' as tipo,
    COUNT(*) as total
FROM receitas r
LEFT JOIN usuarios u ON r.usuario_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Despesas órfãs' as tipo,
    COUNT(*) as total
FROM despesas d
LEFT JOIN usuarios u ON d.usuario_id = u.id
WHERE u.id IS NULL;

-- 7. Verificar RLS (Row Level Security) nas tabelas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('receitas', 'despesas', 'usuarios')
ORDER BY tablename, policyname; 