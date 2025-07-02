-- =====================================================
-- CORRIGIR CARREGAMENTO DE CATEGORIAS NO DASHBOARD
-- =====================================================
-- Este script verifica e corrige o problema onde categorias
-- desmarcadas no Painel Admin ainda aparecem no dashboard do cliente

-- =====================================================
-- 1. VERIFICAR CATEGORIAS ATIVAS DE UM USUÁRIO ESPECÍFICO
-- =====================================================
-- Substitua 'EMAIL_DO_CLIENTE' pelo email real do cliente
SELECT 
    u.nome as nome_usuario,
    u.email,
    'CATEGORIAS DE RECEITA ATIVAS:' as tipo,
    cr.nome as categoria
FROM usuarios u
JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id
JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cr.nome;

SELECT 
    u.nome as nome_usuario,
    u.email,
    'CATEGORIAS DE DESPESA ATIVAS:' as tipo,
    cd.nome as categoria
FROM usuarios u
JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id
JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
  AND uca.ativo = true
ORDER BY cd.nome;

-- =====================================================
-- 2. VERIFICAR TODAS AS CATEGORIAS DISPONÍVEIS PARA O TIPO DE NEGÓCIO
-- =====================================================
-- Substitua 'ID_TIPO_NEGOCIO' pelo ID real do tipo de negócio
SELECT 
    'CATEGORIAS DE RECEITA DISPONÍVEIS:' as tipo,
    cr.nome as categoria,
    cr.ativo
FROM categorias_receita cr
WHERE cr.tipo_negocio_id = 'ID_TIPO_NEGOCIO'  -- Substitua pelo ID real
ORDER BY cr.nome;

SELECT 
    'CATEGORIAS DE DESPESA DISPONÍVEIS:' as tipo,
    cd.nome as categoria,
    cd.ativo
FROM categorias_despesa cd
WHERE cd.tipo_negocio_id = 'ID_TIPO_NEGOCIO'  -- Substitua pelo ID real
ORDER BY cd.nome;

-- =====================================================
-- 3. DESMARCAR CATEGORIA ESPECÍFICA DE RECEITA
-- =====================================================
-- Execute este comando para desmarcar uma categoria específica
UPDATE usuario_categorias_ativas 
SET ativo = false
WHERE usuario_id = (
    SELECT user_id FROM usuarios WHERE email = 'EMAIL_DO_CLIENTE'
)
AND categoria_receita_id = (
    SELECT id FROM categorias_receita WHERE nome = 'NOME_DA_CATEGORIA_RECEITA'
);

-- =====================================================
-- 4. DESMARCAR CATEGORIA ESPECÍFICA DE DESPESA
-- =====================================================
-- Execute este comando para desmarcar uma categoria específica
UPDATE usuario_categorias_ativas 
SET ativo = false
WHERE usuario_id = (
    SELECT user_id FROM usuarios WHERE email = 'EMAIL_DO_CLIENTE'
)
AND categoria_despesa_id = (
    SELECT id FROM categorias_despesa WHERE nome = 'NOME_DA_CATEGORIA_DESPESA'
);

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================
-- Verificar se as categorias foram realmente desmarcadas
SELECT 
    u.nome as nome_usuario,
    'CATEGORIAS ATIVAS APÓS CORREÇÃO:' as status,
    COUNT(CASE WHEN uca.categoria_receita_id IS NOT NULL THEN 1 END) as receitas_ativas,
    COUNT(CASE WHEN uca.categoria_despesa_id IS NOT NULL THEN 1 END) as despesas_ativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
WHERE u.email = 'EMAIL_DO_CLIENTE'  -- Substitua pelo email real
GROUP BY u.id, u.nome; 