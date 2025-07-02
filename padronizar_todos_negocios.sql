-- =====================================================
-- PADRONIZAR TODOS OS NEGÓCIOS IGUAL À BARBEARIA
-- =====================================================

-- Este script vai associar todas as categorias de todos os tipos de negócio
-- a todos os usuários, garantindo que funcionem igual à barbearia

-- =====================================================
-- 1. ASSOCIAR CATEGORIAS DE DESPESA PARA TODOS OS NEGÓCIOS
-- =====================================================
DO $$
DECLARE
    usuario_record RECORD;
    categoria_record RECORD;
BEGIN
    -- Para cada usuário de todos os tipos de negócio
    FOR usuario_record IN 
        SELECT u.user_id, u.nome, u.email, u.tipo_negocio_id, tn.nome as tipo_negocio
        FROM usuarios u
        JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
    LOOP
        -- Para cada categoria de despesa do tipo de negócio do usuário
        FOR categoria_record IN 
            SELECT id, nome
            FROM categorias_despesa
            WHERE tipo_negocio_id = usuario_record.tipo_negocio_id
              AND ativo = true
        LOOP
            -- Verificar se já existe a associação
            IF NOT EXISTS (
                SELECT 1 FROM usuario_categorias_ativas 
                WHERE usuario_id = usuario_record.user_id 
                  AND categoria_despesa_id = categoria_record.id
            ) THEN
                -- Inserir a associação
                INSERT INTO usuario_categorias_ativas (
                    usuario_id,
                    categoria_despesa_id,
                    ativo,
                    created_at,
                    updated_at
                ) VALUES (
                    usuario_record.user_id,
                    categoria_record.id,
                    true,
                    NOW(),
                    NOW()
                );
                
                RAISE NOTICE 'Categoria de despesa "%" associada ao usuário "%" (%) - %', 
                    categoria_record.nome, usuario_record.nome, usuario_record.email, usuario_record.tipo_negocio;
            ELSE
                -- Se já existe, garantir que está ativa
                UPDATE usuario_categorias_ativas 
                SET ativo = true, updated_at = NOW()
                WHERE usuario_id = usuario_record.user_id 
                  AND categoria_despesa_id = categoria_record.id
                  AND ativo = false;
                
                IF FOUND THEN
                    RAISE NOTICE 'Categoria de despesa "%" reativada para o usuário "%" (%) - %', 
                        categoria_record.nome, usuario_record.nome, usuario_record.email, usuario_record.tipo_negocio;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Processo de categorias de despesa concluído!';
END $$;

-- =====================================================
-- 2. ASSOCIAR CATEGORIAS DE RECEITA PARA TODOS OS NEGÓCIOS
-- =====================================================
DO $$
DECLARE
    usuario_record RECORD;
    categoria_record RECORD;
BEGIN
    -- Para cada usuário de todos os tipos de negócio
    FOR usuario_record IN 
        SELECT u.user_id, u.nome, u.email, u.tipo_negocio_id, tn.nome as tipo_negocio
        FROM usuarios u
        JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
    LOOP
        -- Para cada categoria de receita do tipo de negócio do usuário
        FOR categoria_record IN 
            SELECT id, nome
            FROM categorias_receita
            WHERE tipo_negocio_id = usuario_record.tipo_negocio_id
              AND ativo = true
        LOOP
            -- Verificar se já existe a associação
            IF NOT EXISTS (
                SELECT 1 FROM usuario_categorias_ativas 
                WHERE usuario_id = usuario_record.user_id 
                  AND categoria_receita_id = categoria_record.id
            ) THEN
                -- Inserir a associação
                INSERT INTO usuario_categorias_ativas (
                    usuario_id,
                    categoria_receita_id,
                    ativo,
                    created_at,
                    updated_at
                ) VALUES (
                    usuario_record.user_id,
                    categoria_record.id,
                    true,
                    NOW(),
                    NOW()
                );
                
                RAISE NOTICE 'Categoria de receita "%" associada ao usuário "%" (%) - %', 
                    categoria_record.nome, usuario_record.nome, usuario_record.email, usuario_record.tipo_negocio;
            ELSE
                -- Se já existe, garantir que está ativa
                UPDATE usuario_categorias_ativas 
                SET ativo = true, updated_at = NOW()
                WHERE usuario_id = usuario_record.user_id 
                  AND categoria_receita_id = categoria_record.id
                  AND ativo = false;
                
                IF FOUND THEN
                    RAISE NOTICE 'Categoria de receita "%" reativada para o usuário "%" (%) - %', 
                        categoria_record.nome, usuario_record.nome, usuario_record.email, usuario_record.tipo_negocio;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Processo de categorias de receita concluído!';
END $$;

-- =====================================================
-- 3. VERIFICAÇÃO FINAL - RESUMO POR TIPO DE NEGÓCIO
-- =====================================================
SELECT 
    'RESUMO FINAL POR TIPO DE NEGÓCIO:' as tipo,
    tn.nome as tipo_negocio,
    COUNT(DISTINCT u.id) as total_usuarios,
    COUNT(CASE WHEN uca.categoria_despesa_id IS NOT NULL AND uca.ativo = true THEN 1 END) as despesas_ativas,
    COUNT(CASE WHEN uca.categoria_receita_id IS NOT NULL AND uca.ativo = true THEN 1 END) as receitas_ativas,
    COUNT(CASE WHEN uca.ativo = false THEN 1 END) as categorias_inativas
FROM tipos_negocio tn
LEFT JOIN usuarios u ON u.tipo_negocio_id = tn.id
LEFT JOIN usuario_categorias_ativas uca ON uca.usuario_id = u.user_id
GROUP BY tn.id, tn.nome
ORDER BY tn.nome;

-- =====================================================
-- 4. VERIFICAÇÃO DETALHADA POR USUÁRIO
-- =====================================================
SELECT 
    'DETALHAMENTO POR USUÁRIO:' as tipo,
    u.nome as usuario,
    u.email,
    tn.nome as tipo_negocio,
    COUNT(CASE WHEN uca.categoria_despesa_id IS NOT NULL AND uca.ativo = true THEN 1 END) as despesas_ativas,
    COUNT(CASE WHEN uca.categoria_receita_id IS NOT NULL AND uca.ativo = true THEN 1 END) as receitas_ativas,
    COUNT(CASE WHEN uca.ativo = false THEN 1 END) as categorias_inativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON uca.usuario_id = u.user_id
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
GROUP BY u.id, u.nome, u.email, tn.nome
ORDER BY tn.nome, u.nome;

-- =====================================================
-- 5. LISTAR TODAS AS CATEGORIAS ATIVAS POR USUÁRIO
-- =====================================================
SELECT 
    'CATEGORIAS ATIVAS POR USUÁRIO:' as tipo,
    u.nome as usuario,
    u.email,
    tn.nome as tipo_negocio,
    CASE 
        WHEN uca.categoria_despesa_id IS NOT NULL THEN 'DESPESA'
        WHEN uca.categoria_receita_id IS NOT NULL THEN 'RECEITA'
    END as tipo_categoria,
    COALESCE(cd.nome, cr.nome) as categoria
FROM usuarios u
JOIN usuario_categorias_ativas uca ON uca.usuario_id = u.user_id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE uca.ativo = true
ORDER BY tn.nome, u.nome, tipo_categoria, categoria; 