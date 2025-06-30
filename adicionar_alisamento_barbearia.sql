-- ADICIONAR SERVIÇO ALISAMENTO PARA BARBEARIA
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o ID do tipo de negócio barbearia
SELECT '=== VERIFICANDO ID DA BARBEARIA ===' as info;

SELECT 
    id,
    nome,
    descricao
FROM tipos_negocio
WHERE nome ILIKE '%barbearia%' OR nome ILIKE '%barbearia%';

-- 2. Adicionar categoria de receita "Alisamento" para barbearia
SELECT '=== ADICIONANDO CATEGORIA ALISAMENTO ===' as info;

-- Inserir a categoria de receita (substitua o ID correto da barbearia)
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo)
SELECT 
    'Alisamento',
    tn.id,
    true
FROM tipos_negocio tn
WHERE tn.nome ILIKE '%barbearia%' OR tn.nome ILIKE '%barbearia%'
ON CONFLICT (nome, tipo_negocio_id) DO NOTHING;

-- 3. Verificar se foi inserida corretamente
SELECT '=== VERIFICANDO INSERÇÃO ===' as info;

SELECT 
    cr.id,
    cr.nome,
    cr.ativo,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE cr.nome = 'Alisamento'
ORDER BY tn.nome;

-- 4. Mostrar todas as categorias de receita da barbearia
SELECT '=== CATEGORIAS DE RECEITA DA BARBEARIA ===' as info;

SELECT 
    cr.id,
    cr.nome,
    cr.ativo,
    cr.created_at
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome ILIKE '%barbearia%' OR tn.nome ILIKE '%barbearia%'
ORDER BY cr.nome;

-- 5. Verificar se há usuários de barbearia que precisam da nova categoria
SELECT '=== USUÁRIOS DE BARBEARIA ===' as info;

SELECT 
    u.id,
    u.nome,
    u.email,
    u.nome_negocio,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome ILIKE '%barbearia%' OR tn.nome ILIKE '%barbearia%'
ORDER BY u.nome;

-- 6. Resumo final
SELECT '=== RESUMO ===' as info;

SELECT 
    'Categoria adicionada' as acao,
    'Alisamento' as categoria,
    'Barbearia' as tipo_negocio,
    'Receita' as tipo_categoria
UNION ALL
SELECT 
    'Status' as acao,
    'Ativa' as categoria,
    'Pronta para uso' as tipo_negocio,
    'Disponível para cadastro' as tipo_categoria;

SELECT '=== CATEGORIA ALISAMENTO ADICIONADA COM SUCESSO! ===' as resultado; 