-- =====================================================
-- ASSOCIAR CATEGORIA "MATERIAIS LAVA RÁPIDO" AOS USUÁRIOS DE ESTACIONAMENTO
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE A CATEGORIA EXISTE
-- =====================================================
SELECT 
    id,
    nome,
    tipo_negocio_id,
    created_at
FROM categorias_despesa 
WHERE nome = 'Materiais lava rápido'
  AND tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2';

-- =====================================================
-- 2. VERIFICAR USUÁRIOS DE ESTACIONAMENTO
-- =====================================================
SELECT 
    u.id,
    u.user_id,
    u.nome,
    u.email,
    u.tipo_negocio_id,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome ILIKE '%estacionamento%'
ORDER BY u.nome;

-- =====================================================
-- 3. ASSOCIAR CATEGORIA A TODOS OS USUÁRIOS DE ESTACIONAMENTO
-- =====================================================
-- Primeiro, vamos pegar o ID da categoria
DO $$
DECLARE
    categoria_id UUID;
    usuario_record RECORD;
BEGIN
    -- Pegar o ID da categoria "Materiais lava rápido"
    SELECT id INTO categoria_id 
    FROM categorias_despesa 
    WHERE nome = 'Materiais lava rápido'
      AND tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2';
    
    IF categoria_id IS NULL THEN
        RAISE NOTICE 'Categoria "Materiais lava rápido" não encontrada!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Categoria encontrada: %', categoria_id;
    
    -- Associar a todos os usuários de estacionamento
    FOR usuario_record IN 
        SELECT u.user_id
        FROM usuarios u
        JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
        WHERE tn.nome ILIKE '%estacionamento%'
    LOOP
        -- Verificar se já existe a associação
        IF NOT EXISTS (
            SELECT 1 FROM usuario_categorias_ativas 
            WHERE usuario_id = usuario_record.user_id 
              AND categoria_despesa_id = categoria_id
              AND ativo = true
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
                categoria_id,
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Categoria associada ao usuário: %', usuario_record.user_id;
        ELSE
            RAISE NOTICE 'Categoria já associada ao usuário: %', usuario_record.user_id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Processo concluído!';
END $$;

-- =====================================================
-- 4. VERIFICAR ASSOCIAÇÕES CRIADAS
-- =====================================================
SELECT 
    uca.id,
    uca.usuario_id,
    u.nome as nome_usuario,
    u.email,
    uca.categoria_despesa_id,
    cd.nome as categoria_despesa,
    uca.ativo,
    uca.created_at
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE cd.nome = 'Materiais lava rápido'
  AND uca.ativo = true
ORDER BY u.nome;

-- =====================================================
-- 5. VERIFICAR TODAS AS CATEGORIAS DE DESPESA DE UM USUÁRIO ESPECÍFICO
-- =====================================================
-- Substitua 'USER_ID_AQUI' pelo user_id real do usuário
SELECT 
    uca.id,
    uca.usuario_id,
    u.nome as nome_usuario,
    uca.categoria_despesa_id,
    cd.nome as categoria_despesa,
    uca.ativo
FROM usuario_categorias_ativas uca
JOIN usuarios u ON uca.usuario_id = u.user_id
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.usuario_id = 'USER_ID_AQUI'  -- Substitua pelo user_id real
  AND uca.ativo = true
ORDER BY cd.nome; 