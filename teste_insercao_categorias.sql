-- Script de teste para verificar inserção de categorias de usuários
-- Este script testa se a tabela usuario_categorias_ativas está funcionando corretamente

-- 1. Verificar se há usuários na tabela
SELECT 'Verificando usuários disponíveis:' as info;
SELECT user_id, nome, email FROM usuarios LIMIT 5;

-- 2. Verificar se há categorias disponíveis
SELECT 'Verificando categorias de receita disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita WHERE ativo = true LIMIT 5;

SELECT 'Verificando categorias de despesa disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa WHERE ativo = true LIMIT 5;

-- 3. Teste de inserção manual (usando dados reais)
-- Primeiro, vamos pegar um usuário real
DO $$
DECLARE
    usuario_test_id UUID;
    categoria_receita_test_id UUID;
    categoria_despesa_test_id UUID;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT user_id INTO usuario_test_id FROM usuarios LIMIT 1;
    
    -- Pegar a primeira categoria de receita disponível
    SELECT id INTO categoria_receita_test_id FROM categorias_receita WHERE ativo = true LIMIT 1;
    
    -- Pegar a primeira categoria de despesa disponível
    SELECT id INTO categoria_despesa_test_id FROM categorias_despesa WHERE ativo = true LIMIT 1;
    
    RAISE NOTICE 'Usuário de teste: %', usuario_test_id;
    RAISE NOTICE 'Categoria de receita de teste: %', categoria_receita_test_id;
    RAISE NOTICE 'Categoria de despesa de teste: %', categoria_despesa_test_id;
    
    -- Teste 1: Inserir categoria de receita
    IF usuario_test_id IS NOT NULL AND categoria_receita_test_id IS NOT NULL THEN
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES (usuario_test_id, categoria_receita_test_id, NULL, true);
        
        RAISE NOTICE 'Categoria de receita inserida com sucesso!';
    END IF;
    
    -- Teste 2: Inserir categoria de despesa
    IF usuario_test_id IS NOT NULL AND categoria_despesa_test_id IS NOT NULL THEN
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES (usuario_test_id, NULL, categoria_despesa_test_id, true);
        
        RAISE NOTICE 'Categoria de despesa inserida com sucesso!';
    END IF;
    
    -- Teste 3: Inserir múltiplas categorias (simulando o que a API faz)
    IF usuario_test_id IS NOT NULL AND categoria_receita_test_id IS NOT NULL AND categoria_despesa_test_id IS NOT NULL THEN
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES 
            (usuario_test_id, categoria_receita_test_id, NULL, true),
            (usuario_test_id, NULL, categoria_despesa_test_id, true);
        
        RAISE NOTICE 'Múltiplas categorias inseridas com sucesso!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante o teste: %', SQLERRM;
END $$;

-- 4. Verificar se os registros foram inseridos
SELECT 'Verificando registros inseridos:' as info;
SELECT 
    uca.id,
    uca.usuario_id,
    u.nome as nome_usuario,
    uca.categoria_receita_id,
    cr.nome as nome_categoria_receita,
    uca.categoria_despesa_id,
    cd.nome as nome_categoria_despesa,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.user_id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
ORDER BY uca.created_at DESC
LIMIT 10;

-- 5. Teste de atualização (simulando o que a API de edição faz)
DO $$
DECLARE
    usuario_test_id UUID;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT user_id INTO usuario_test_id FROM usuarios LIMIT 1;
    
    IF usuario_test_id IS NOT NULL THEN
        -- Desativar todas as categorias atuais (simulando a API de edição)
        UPDATE usuario_categorias_ativas 
        SET ativo = false 
        WHERE usuario_id = usuario_test_id;
        
        RAISE NOTICE 'Categorias desativadas para o usuário: %', usuario_test_id;
        
        -- Verificar quantas foram desativadas
        GET DIAGNOSTICS usuario_test_id = ROW_COUNT;
        RAISE NOTICE 'Registros desativados: %', usuario_test_id;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante a atualização: %', SQLERRM;
END $$;

-- 6. Verificar estatísticas finais
SELECT 'Estatísticas finais da tabela:' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ativo = true THEN 1 END) as registros_ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as registros_inativos,
    COUNT(DISTINCT usuario_id) as usuarios_unicos
FROM usuario_categorias_ativas;

-- 7. Limpar dados de teste (opcional - descomente se quiser limpar)
/*
DELETE FROM usuario_categorias_ativas 
WHERE created_at > NOW() - INTERVAL '1 hour';
*/

SELECT 'Teste de inserção de categorias concluído!' as info; 