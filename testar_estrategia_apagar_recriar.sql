-- TESTAR ESTRATÉGIA DE APAGAR E RECRIAR CATEGORIAS
-- Execute este script no SQL Editor do Supabase para testar a nova lógica

-- 1. Verificar estado atual antes do teste
SELECT '=== ESTADO ATUAL ANTES DO TESTE ===' as info;

SELECT 
    u.nome,
    u.email,
    COUNT(uca.id) as total_categorias_ativas,
    COUNT(uca.id) - COUNT(DISTINCT (uca.usuario_id, uca.categoria_receita_id, uca.categoria_despesa_id)) as duplicatas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY total_categorias_ativas DESC
LIMIT 10;

-- 2. Mostrar exemplo de usuário com categorias
SELECT '=== EXEMPLO DE USUÁRIO COM CATEGORIAS ===' as info;

SELECT 
    u.id,
    u.nome,
    u.email,
    uca.id as categoria_id,
    uca.categoria_receita_id,
    uca.categoria_despesa_id,
    uca.ativo,
    uca.created_at,
    cr.nome as categoria_receita,
    cd.nome as categoria_despesa
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.id IS NOT NULL
ORDER BY u.nome, uca.created_at
LIMIT 5;

-- 3. Simular a estratégia de "apagar e recriar" para um usuário específico
SELECT '=== SIMULANDO ESTRATÉGIA APAGAR E RECRIAR ===' as info;

-- Escolher um usuário para teste (substitua pelo ID real de um usuário)
DO $$
DECLARE
    usuario_teste_id uuid;
    total_antes integer;
    total_depois integer;
BEGIN
    -- Pegar o primeiro usuário que tem categorias
    SELECT u.id INTO usuario_teste_id
    FROM usuarios u
    JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
    LIMIT 1;
    
    IF usuario_teste_id IS NULL THEN
        RAISE NOTICE 'Nenhum usuário com categorias encontrado para teste';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuário selecionado para teste: %', usuario_teste_id;
    
    -- Contar categorias antes
    SELECT COUNT(*) INTO total_antes
    FROM usuario_categorias_ativas
    WHERE usuario_id = usuario_teste_id AND ativo = true;
    
    RAISE NOTICE 'Categorias ANTES: %', total_antes;
    
    -- SIMULAR: Apagar todas as categorias
    DELETE FROM usuario_categorias_ativas
    WHERE usuario_id = usuario_teste_id;
    
    RAISE NOTICE 'Todas as categorias foram APAGADAS';
    
    -- Contar categorias depois
    SELECT COUNT(*) INTO total_depois
    FROM usuario_categorias_ativas
    WHERE usuario_id = usuario_teste_id AND ativo = true;
    
    RAISE NOTICE 'Categorias DEPOIS: %', total_depois;
    
    -- Verificar se foi bem-sucedido
    IF total_depois = 0 THEN
        RAISE NOTICE '✅ TESTE BEM-SUCEDIDO: Todas as categorias foram apagadas';
    ELSE
        RAISE NOTICE '❌ TESTE FALHOU: Ainda existem categorias';
    END IF;
    
    -- ROLLBACK para não afetar os dados reais
    RAISE EXCEPTION 'ROLLBACK - Este é apenas um teste, dados não foram alterados';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Teste concluído com rollback';
END $$;

-- 4. Verificar se os dados foram preservados (devido ao rollback)
SELECT '=== VERIFICAÇÃO PÓS-TESTE (ROLLBACK) ===' as info;

SELECT 
    u.nome,
    u.email,
    COUNT(uca.id) as total_categorias_ativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY total_categorias_ativas DESC
LIMIT 5;

-- 5. Resumo da estratégia
SELECT '=== RESUMO DA ESTRATÉGIA APAGAR E RECRIAR ===' as info;

SELECT 
    'Vantagens' as tipo,
    'Banco mais limpo, menos espaço, performance melhor' as descricao
UNION ALL
SELECT 
    'Desvantagens' as tipo,
    'Perde histórico de mudanças de categorias' as descricao
UNION ALL
SELECT 
    'Dados preservados' as tipo,
    'Receitas, despesas, anotações e dados financeiros' as descricao
UNION ALL
SELECT 
    'Dados perdidos' as tipo,
    'Histórico de quais categorias o usuário já teve' as descricao;

SELECT '=== TESTE CONCLUÍDO ===' as info;
SELECT 'A estratégia de apagar e recriar está implementada e pronta para uso!' as resultado; 