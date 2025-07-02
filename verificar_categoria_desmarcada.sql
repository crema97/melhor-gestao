-- =====================================================
-- VERIFICAR SE CATEGORIA FOI DESMARCADA DO CLIENTE
-- =====================================================

-- =====================================================
-- 1. VERIFICAR CATEGORIAS ATIVAS DO CLIENTE
-- =====================================================
-- Substitua 'EMAIL_DO_CLIENTE' pelo email real do cliente
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
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cd.nome;

-- =====================================================
-- 2. VERIFICAR TODAS AS CATEGORIAS DISPONÍVEIS PARA ESTACIONAMENTO
-- =====================================================
SELECT 
    id,
    nome,
    tipo_negocio_id,
    created_at
FROM categorias_despesa 
WHERE tipo_negocio_id = 'e9f13adb-5f8c-4a26-b7c0-447397f276e2'
ORDER BY nome;

-- =====================================================
-- 3. VERIFICAR SE A CATEGORIA ESPECÍFICA ESTÁ ATIVA PARA O CLIENTE
-- =====================================================
-- Substitua 'NOME_DA_CATEGORIA' pelo nome da categoria que você desmarcou
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
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND cd.nome = 'NOME_DA_CATEGORIA'  -- Substitua pelo nome da categoria
ORDER BY uca.created_at DESC;

-- =====================================================
-- 4. DESMARCAR CATEGORIA ESPECÍFICA (se ainda estiver ativa)
-- =====================================================
-- Execute este comando se a categoria ainda estiver ativa
UPDATE usuario_categorias_ativas 
SET ativo = false
WHERE usuario_id = (
    SELECT user_id FROM usuarios WHERE email = 'EMAIL_DO_CLIENTE'
)
AND categoria_despesa_id = (
    SELECT id FROM categorias_despesa WHERE nome = 'NOME_DA_CATEGORIA'
);

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================
-- Verificar se a categoria foi realmente desmarcada
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
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND cd.nome = 'NOME_DA_CATEGORIA'  -- Substitua pelo nome da categoria
ORDER BY uca.created_at DESC; 