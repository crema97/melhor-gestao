-- Script para associar a categoria "Polimento técnico" aos usuários de estacionamento
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se a categoria foi inserida corretamente
SELECT 
    'VERIFICANDO CATEGORIA INSERIDA:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    cr.tipo_negocio_id,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE cr.nome = 'Polimento técnico'
  AND tn.nome = 'Estacionamento';

-- 2. Buscar todos os usuários de estacionamento
SELECT 
    'USUÁRIOS ESTACIONAMENTO:' as tipo,
    u.id,
    u.user_id,
    u.nome,
    u.email,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento'
ORDER BY u.nome;

-- 3. Associar a categoria "Polimento técnico" a todos os usuários de estacionamento
DO $$
DECLARE
    usuario_record RECORD;
    categoria_id UUID;
BEGIN
    -- Buscar o ID da categoria "Polimento técnico"
    SELECT id INTO categoria_id
    FROM categorias_receita cr
    JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
    WHERE cr.nome = 'Polimento técnico'
      AND tn.nome = 'Estacionamento'
    LIMIT 1;

    IF categoria_id IS NULL THEN
        RAISE EXCEPTION 'Categoria "Polimento técnico" não encontrada para estacionamento';
    END IF;

    -- Para cada usuário de estacionamento
    FOR usuario_record IN 
        SELECT u.user_id, u.nome, u.email
        FROM usuarios u
        JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
        WHERE tn.nome = 'Estacionamento'
    LOOP
        -- Verificar se já existe a associação
        IF NOT EXISTS (
            SELECT 1 FROM usuario_categorias_ativas 
            WHERE usuario_id = usuario_record.user_id 
              AND categoria_receita_id = categoria_id
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
                categoria_id,
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Categoria "Polimento técnico" associada ao usuário "%" (%)', 
                usuario_record.nome, usuario_record.email;
        ELSE
            -- Se já existe, garantir que está ativa
            UPDATE usuario_categorias_ativas 
            SET ativo = true, updated_at = NOW()
            WHERE usuario_id = usuario_record.user_id 
              AND categoria_receita_id = categoria_id;
            
            RAISE NOTICE 'Categoria "Polimento técnico" já estava associada ao usuário "%" (%) - reativada', 
                usuario_record.nome, usuario_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Processo de associação concluído!';
END $$;

-- 4. Verificar se as associações foram criadas corretamente
SELECT 
    'VERIFICANDO ASSOCIAÇÕES CRIADAS:' as tipo,
    u.nome as usuario,
    u.email,
    cr.nome as categoria,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE cr.nome = 'Polimento técnico'
  AND uca.ativo = true
ORDER BY u.nome; 