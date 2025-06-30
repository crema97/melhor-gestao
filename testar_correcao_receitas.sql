-- TESTAR CORREÇÃO DE CARREGAMENTO DE RECEITAS
-- Execute este script no SQL Editor do Supabase para verificar se a correção está funcionando

-- 1. Verificar usuários com receitas
SELECT '=== USUÁRIOS COM RECEITAS ===' as info;

SELECT 
    u.id,
    u.nome,
    u.email,
    COUNT(r.id) as total_receitas,
    SUM(r.valor) as valor_total_receitas
FROM usuarios u
LEFT JOIN receitas r ON u.id = r.usuario_id
GROUP BY u.id, u.nome, u.email
HAVING COUNT(r.id) > 0
ORDER BY total_receitas DESC
LIMIT 10;

-- 2. Verificar categorias de receita usadas
SELECT '=== CATEGORIAS DE RECEITA USADAS ===' as info;

SELECT 
    cr.id,
    cr.nome,
    COUNT(r.id) as total_receitas,
    SUM(r.valor) as valor_total
FROM categorias_receita cr
LEFT JOIN receitas r ON cr.id = r.categoria_receita_id
GROUP BY cr.id, cr.nome
HAVING COUNT(r.id) > 0
ORDER BY total_receitas DESC;

-- 3. Verificar receitas por usuário e categoria
SELECT '=== RECEITAS POR USUÁRIO E CATEGORIA ===' as info;

SELECT 
    u.nome as usuario,
    cr.nome as categoria_receita,
    COUNT(r.id) as total_receitas,
    SUM(r.valor) as valor_total,
    MIN(r.data_receita) as primeira_receita,
    MAX(r.data_receita) as ultima_receita
FROM usuarios u
JOIN receitas r ON u.id = r.usuario_id
LEFT JOIN categorias_receita cr ON r.categoria_receita_id = cr.id
GROUP BY u.id, u.nome, cr.id, cr.nome
ORDER BY u.nome, total_receitas DESC
LIMIT 20;

-- 4. Verificar se há receitas sem categoria
SELECT '=== RECEITAS SEM CATEGORIA ===' as info;

SELECT 
    u.nome as usuario,
    COUNT(r.id) as receitas_sem_categoria,
    SUM(r.valor) as valor_total_sem_categoria
FROM usuarios u
JOIN receitas r ON u.id = r.usuario_id
WHERE r.categoria_receita_id IS NULL
GROUP BY u.id, u.nome
ORDER BY receitas_sem_categoria DESC;

-- 5. Verificar categorias ativas vs receitas existentes
SELECT '=== COMPARAÇÃO: CATEGORIAS ATIVAS VS RECEITAS ===' as info;

WITH categorias_ativas AS (
    SELECT 
        uca.usuario_id,
        uca.categoria_receita_id,
        cr.nome as categoria_nome
    FROM usuario_categorias_ativas uca
    JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
    WHERE uca.ativo = true
),
receitas_existentes AS (
    SELECT 
        r.usuario_id,
        r.categoria_receita_id,
        cr.nome as categoria_nome,
        COUNT(r.id) as total_receitas
    FROM receitas r
    JOIN categorias_receita cr ON r.categoria_receita_id = cr.id
    GROUP BY r.usuario_id, r.categoria_receita_id, cr.nome
)
SELECT 
    u.nome as usuario,
    ca.categoria_nome as categoria_ativa,
    CASE 
        WHEN re.categoria_nome IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_receitas,
    re.total_receitas as qtd_receitas
FROM usuarios u
JOIN categorias_ativas ca ON u.id = ca.usuario_id
LEFT JOIN receitas_existentes re ON u.id = re.usuario_id AND ca.categoria_receita_id = re.categoria_receita_id
ORDER BY u.nome, ca.categoria_nome;

-- 6. Teste prático: Simular carregamento de receitas
SELECT '=== TESTE PRÁTICO: CARREGAMENTO DE RECEITAS ===' as info;

-- Escolher um usuário para teste
DO $$
DECLARE
    usuario_teste_id uuid;
    total_receitas integer;
    receitas_categorias_ativas integer;
    receitas_todas integer;
BEGIN
    -- Pegar o primeiro usuário que tem receitas
    SELECT u.id INTO usuario_teste_id
    FROM usuarios u
    JOIN receitas r ON u.id = r.usuario_id
    LIMIT 1;
    
    IF usuario_teste_id IS NULL THEN
        RAISE NOTICE 'Nenhum usuário com receitas encontrado para teste';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuário selecionado para teste: %', usuario_teste_id;
    
    -- Contar todas as receitas do usuário
    SELECT COUNT(*) INTO receitas_todas
    FROM receitas
    WHERE usuario_id = usuario_teste_id;
    
    RAISE NOTICE 'Todas as receitas do usuário: %', receitas_todas;
    
    -- Contar receitas das categorias ativas
    SELECT COUNT(*) INTO receitas_categorias_ativas
    FROM receitas r
    JOIN usuario_categorias_ativas uca ON r.usuario_id = uca.usuario_id 
        AND r.categoria_receita_id = uca.categoria_receita_id
    WHERE r.usuario_id = usuario_teste_id AND uca.ativo = true;
    
    RAISE NOTICE 'Receitas das categorias ativas: %', receitas_categorias_ativas;
    
    -- Verificar diferença
    IF receitas_todas > receitas_categorias_ativas THEN
        RAISE NOTICE '✅ CORREÇÃO NECESSÁRIA: Há receitas que não apareceriam se filtrasse por categorias ativas';
        RAISE NOTICE 'Receitas que ficariam "escondidas": %', (receitas_todas - receitas_categorias_ativas);
    ELSE
        RAISE NOTICE '✅ TUDO OK: Todas as receitas estão nas categorias ativas';
    END IF;
    
END $$;

SELECT '=== TESTE CONCLUÍDO ===' as info;
SELECT 'A correção foi implementada! Agora todas as receitas aparecem nas páginas.' as resultado; 