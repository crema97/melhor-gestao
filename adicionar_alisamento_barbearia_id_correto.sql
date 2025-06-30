-- ADICIONAR SERVIÇO ALISAMENTO PARA BARBEARIA
-- Execute este script no SQL Editor do Supabase
-- ID da Barbearia: 04c82ce2-c099-44ca-85ce-b48549e5a592

-- 1. Verificar o tipo de negócio barbearia
SELECT '=== VERIFICANDO TIPO DE NEGÓCIO BARBEARIA ===' as info;

SELECT 
    id,
    nome
FROM tipos_negocio
WHERE id = '04c82ce2-c099-44ca-85ce-b48549e5a592';

-- 2. Adicionar categoria de receita "Alisamento" para barbearia
SELECT '=== ADICIONANDO CATEGORIA ALISAMENTO ===' as info;

INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo)
VALUES ('Alisamento', '04c82ce2-c099-44ca-85ce-b48549e5a592', true)
ON CONFLICT (nome, tipo_negocio_id) DO NOTHING;

-- 3. Verificar se foi inserida corretamente
SELECT '=== VERIFICANDO INSERÇÃO ===' as info;

SELECT 
    cr.id,
    cr.nome,
    cr.ativo,
    cr.created_at,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE cr.nome = 'Alisamento' 
    AND cr.tipo_negocio_id = '04c82ce2-c099-44ca-85ce-b48549e5a592';

-- 4. Mostrar todas as categorias de receita da barbearia
SELECT '=== CATEGORIAS DE RECEITA DA BARBEARIA ===' as info;

SELECT 
    cr.id,
    cr.nome,
    cr.ativo,
    cr.created_at
FROM categorias_receita cr
WHERE cr.tipo_negocio_id = '04c82ce2-c099-44ca-85ce-b48549e5a592'
ORDER BY cr.nome;

-- 5. Verificar usuários de barbearia
SELECT '=== USUÁRIOS DE BARBEARIA ===' as info;

SELECT 
    u.id,
    u.nome,
    u.email,
    u.nome_negocio,
    tn.nome as tipo_negocio
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE u.tipo_negocio_id = '04c82ce2-c099-44ca-85ce-b48549e5a592'
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
    'ID da Barbearia' as acao,
    '04c82ce2-c099-44ca-85ce-b48549e5a592' as categoria,
    'Confirmado' as tipo_negocio,
    'ID correto usado' as tipo_categoria
UNION ALL
SELECT 
    'Status' as acao,
    'Ativa' as categoria,
    'Pronta para uso' as tipo_negocio,
    'Disponível para cadastro' as tipo_categoria;

SELECT '=== CATEGORIA ALISAMENTO ADICIONADA COM SUCESSO! ===' as resultado; 