-- TESTAR DASHBOARD CATEGORIAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados do usuário
SELECT '=== DADOS DO USUÁRIO ===' as info;
SELECT id, user_id, nome, email, tipo_negocio_id FROM usuarios LIMIT 3;

-- 2. Verificar categorias ativas do usuário
SELECT '=== CATEGORIAS ATIVAS DO USUÁRIO ===' as info;
SELECT 
    uca.id,
    uca.usuario_id,
    uca.categoria_receita_id,
    uca.categoria_despesa_id,
    uca.ativo,
    u.nome as nome_usuario,
    cr.nome as categoria_receita,
    cd.nome as categoria_despesa
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.ativo = true
ORDER BY u.nome, cr.nome, cd.nome;

-- 3. Verificar receitas do usuário
SELECT '=== RECEITAS DO USUÁRIO ===' as info;
SELECT 
    r.id,
    r.usuario_id,
    r.valor,
    r.data_receita,
    r.categoria_receita_id,
    cr.nome as categoria_receita,
    u.nome as nome_usuario
FROM receitas r
LEFT JOIN categorias_receita cr ON r.categoria_receita_id = cr.id
LEFT JOIN usuarios u ON r.usuario_id = u.id
ORDER BY r.data_receita DESC
LIMIT 10;

-- 4. Verificar despesas do usuário
SELECT '=== DESPESAS DO USUÁRIO ===' as info;
SELECT 
    d.id,
    d.usuario_id,
    d.valor,
    d.data_despesa,
    d.categoria_despesa_id,
    cd.nome as categoria_despesa,
    u.nome as nome_usuario
FROM despesas d
LEFT JOIN categorias_despesa cd ON d.categoria_despesa_id = cd.id
LEFT JOIN usuarios u ON d.usuario_id = u.id
ORDER BY d.data_despesa DESC
LIMIT 10;

-- 5. Testar a API de categorias ativas (substitua pelo ID do usuário)
SELECT '=== TESTE DA API ===' as info;
SELECT 'Para testar a API, faça uma requisição para:' as instrucao;
SELECT 'GET /api/usuario/categorias-ativas?usuario_id=ID_DO_USUARIO' as endpoint;

-- 6. Verificar se há receitas/despesas sem categoria
SELECT '=== RECEITAS SEM CATEGORIA ===' as info;
SELECT COUNT(*) as total_receitas_sem_categoria
FROM receitas 
WHERE categoria_receita_id IS NULL;

SELECT '=== DESPESAS SEM CATEGORIA ===' as info;
SELECT COUNT(*) as total_despesas_sem_categoria
FROM despesas 
WHERE categoria_despesa_id IS NULL;

-- 7. Resumo por usuário
SELECT '=== RESUMO POR USUÁRIO ===' as info;
SELECT 
    u.nome,
    u.email,
    COUNT(DISTINCT uca.id) as total_categorias_ativas,
    COUNT(DISTINCT r.id) as total_receitas,
    COUNT(DISTINCT d.id) as total_despesas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
LEFT JOIN receitas r ON u.id = r.usuario_id
LEFT JOIN despesas d ON u.id = d.usuario_id
GROUP BY u.id, u.nome, u.email
ORDER BY u.nome;

SELECT '=== SCRIPT CONCLUÍDO ===' as info;
SELECT 'Agora teste o dashboard do cliente!' as proximo_passo; 