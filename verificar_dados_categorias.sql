-- Script para verificar dados das categorias e identificar problemas
-- Execute este script para diagnosticar o problema de carregamento de categorias

-- 1. Verificar se há usuários na tabela
SELECT 'VERIFICANDO USUÁRIOS:' as info;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT user_id, nome, email, tipo_negocio_id FROM usuarios LIMIT 5;

-- 2. Verificar se há tipos de negócio
SELECT 'VERIFICANDO TIPOS DE NEGÓCIO:' as info;
SELECT COUNT(*) as total_tipos FROM tipos_negocio;
SELECT id, nome FROM tipos_negocio;

-- 3. Verificar se há categorias de receita
SELECT 'VERIFICANDO CATEGORIAS DE RECEITA:' as info;
SELECT COUNT(*) as total_categorias_receita FROM categorias_receita;
SELECT id, nome, tipo_negocio_id, ativo FROM categorias_receita LIMIT 10;

-- 4. Verificar se há categorias de despesa
SELECT 'VERIFICANDO CATEGORIAS DE DESPESA:' as info;
SELECT COUNT(*) as total_categorias_despesa FROM categorias_despesa;
SELECT id, nome, tipo_negocio_id, ativo FROM categorias_despesa LIMIT 10;

-- 5. Verificar se há categorias ativas de usuários
SELECT 'VERIFICANDO CATEGORIAS ATIVAS DE USUÁRIOS:' as info;
SELECT COUNT(*) as total_categorias_ativas FROM usuario_categorias_ativas;
SELECT COUNT(*) as categorias_ativas FROM usuario_categorias_ativas WHERE ativo = true;

-- 6. Verificar estrutura da tabela usuario_categorias_ativas
SELECT 'ESTRUTURA DA TABELA usuario_categorias_ativas:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 7. Verificar alguns registros de exemplo da tabela usuario_categorias_ativas
SELECT 'REGISTROS DE EXEMPLO:' as info;
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

-- 8. Verificar se há usuários sem categorias
SELECT 'USUÁRIOS SEM CATEGORIAS:' as info;
SELECT u.user_id, u.nome, u.email, u.tipo_negocio_id
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.user_id = uca.usuario_id AND uca.ativo = true
WHERE uca.usuario_id IS NULL
LIMIT 10;

-- 9. Verificar se há categorias para cada tipo de negócio
SELECT 'CATEGORIAS POR TIPO DE NEGÓCIO:' as info;
SELECT 
    tn.id as tipo_negocio_id,
    tn.nome as tipo_negocio,
    COUNT(DISTINCT cr.id) as categorias_receita,
    COUNT(DISTINCT cd.id) as categorias_despesa
FROM tipos_negocio tn
LEFT JOIN categorias_receita cr ON tn.id = cr.tipo_negocio_id AND cr.ativo = true
LEFT JOIN categorias_despesa cd ON tn.id = cd.tipo_negocio_id AND cd.ativo = true
GROUP BY tn.id, tn.nome
ORDER BY tn.nome;

-- 10. Teste específico para um usuário (substitua o user_id pelo ID real)
SELECT 'TESTE PARA USUÁRIO ESPECÍFICO:' as info;
-- Pegar o primeiro usuário como exemplo
DO $$
DECLARE
    usuario_exemplo_id UUID;
    usuario_exemplo_tipo UUID;
BEGIN
    SELECT user_id, tipo_negocio_id INTO usuario_exemplo_id, usuario_exemplo_tipo FROM usuarios LIMIT 1;
    
    IF usuario_exemplo_id IS NOT NULL THEN
        RAISE NOTICE 'Usuário de exemplo: % (tipo: %)', usuario_exemplo_id, usuario_exemplo_tipo;
        
        -- Verificar categorias disponíveis para este tipo
        RAISE NOTICE 'Categorias de receita disponíveis:';
        FOR r IN SELECT id, nome FROM categorias_receita WHERE tipo_negocio_id = usuario_exemplo_tipo AND ativo = true
        LOOP
            RAISE NOTICE '  - %: %', r.id, r.nome;
        END LOOP;
        
        RAISE NOTICE 'Categorias de despesa disponíveis:';
        FOR r IN SELECT id, nome FROM categorias_despesa WHERE tipo_negocio_id = usuario_exemplo_tipo AND ativo = true
        LOOP
            RAISE NOTICE '  - %: %', r.id, r.nome;
        END LOOP;
        
        -- Verificar categorias ativas do usuário
        RAISE NOTICE 'Categorias ativas do usuário:';
        FOR r IN SELECT categoria_receita_id, categoria_despesa_id FROM usuario_categorias_ativas WHERE usuario_id = usuario_exemplo_id AND ativo = true
        LOOP
            RAISE NOTICE '  - Receita: %, Despesa: %', r.categoria_receita_id, r.categoria_despesa_id;
        END LOOP;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- 11. Verificar se há problemas de RLS
SELECT 'VERIFICANDO RLS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('usuarios', 'categorias_receita', 'categorias_despesa', 'usuario_categorias_ativas');

SELECT 'POLÍTICAS RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('usuarios', 'categorias_receita', 'categorias_despesa', 'usuario_categorias_ativas');

SELECT 'VERIFICAÇÃO CONCLUÍDA!' as info; 