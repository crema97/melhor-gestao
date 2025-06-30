-- Script para testar inserção manual na tabela usuario_categorias_ativas
-- Execute este script para verificar se a tabela está funcionando corretamente

-- 1. Verificar se a tabela existe e tem a estrutura correta
SELECT 'VERIFICANDO ESTRUTURA DA TABELA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 2. Verificar se há dados para teste
SELECT 'VERIFICANDO DADOS PARA TESTE:' as info;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_categorias_receita FROM categorias_receita WHERE ativo = true;
SELECT COUNT(*) as total_categorias_despesa FROM categorias_despesa WHERE ativo = true;

-- 3. Pegar dados de teste
DO $$
DECLARE
    usuario_test_id UUID;
    categoria_receita_test_id UUID;
    categoria_despesa_test_id UUID;
    insert_result RECORD;
BEGIN
    -- Pegar o primeiro usuário
    SELECT user_id INTO usuario_test_id FROM usuarios LIMIT 1;
    RAISE NOTICE 'Usuário de teste: %', usuario_test_id;
    
    -- Pegar a primeira categoria de receita
    SELECT id INTO categoria_receita_test_id FROM categorias_receita WHERE ativo = true LIMIT 1;
    RAISE NOTICE 'Categoria de receita de teste: %', categoria_receita_test_id;
    
    -- Pegar a primeira categoria de despesa
    SELECT id INTO categoria_despesa_test_id FROM categorias_despesa WHERE ativo = true LIMIT 1;
    RAISE NOTICE 'Categoria de despesa de teste: %', categoria_despesa_test_id;
    
    -- Teste 1: Inserir categoria de receita
    IF usuario_test_id IS NOT NULL AND categoria_receita_test_id IS NOT NULL THEN
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES (usuario_test_id, categoria_receita_test_id, NULL, true)
        RETURNING * INTO insert_result;
        
        RAISE NOTICE 'Categoria de receita inserida com sucesso! ID: %', insert_result.id;
    END IF;
    
    -- Teste 2: Inserir categoria de despesa
    IF usuario_test_id IS NOT NULL AND categoria_despesa_test_id IS NOT NULL THEN
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES (usuario_test_id, NULL, categoria_despesa_test_id, true)
        RETURNING * INTO insert_result;
        
        RAISE NOTICE 'Categoria de despesa inserida com sucesso! ID: %', insert_result.id;
    END IF;
    
    -- Teste 3: Inserir múltiplas categorias (como a API faz)
    IF usuario_test_id IS NOT NULL AND categoria_receita_test_id IS NOT NULL AND categoria_despesa_test_id IS NOT NULL THEN
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES 
            (usuario_test_id, categoria_receita_test_id, NULL, true),
            (usuario_test_id, NULL, categoria_despesa_test_id, true);
        
        RAISE NOTICE 'Múltiplas categorias inseridas com sucesso!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante teste: % - %', SQLSTATE, SQLERRM;
END $$;

-- 4. Verificar se os registros foram inseridos
SELECT 'VERIFICANDO REGISTROS INSERIDOS:' as info;
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

-- 5. Verificar estatísticas
SELECT 'ESTATÍSTICAS FINAIS:' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ativo = true THEN 1 END) as registros_ativos,
    COUNT(DISTINCT usuario_id) as usuarios_unicos
FROM usuario_categorias_ativas;

-- 6. Limpar dados de teste (opcional - descomente se quiser limpar)
/*
DELETE FROM usuario_categorias_ativas 
WHERE created_at > NOW() - INTERVAL '1 hour';
*/

SELECT 'TESTE DE INSERÇÃO MANUAL CONCLUÍDO!' as info; 