-- VERIFICAR CONFIGURAÇÃO DE FOREIGN KEY E CASCADE DELETE
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar as foreign keys da tabela usuario_categorias_ativas
SELECT '=== FOREIGN KEYS DA TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'usuario_categorias_ativas'
ORDER BY kcu.column_name;

-- 2. Verificar estrutura completa da tabela
SELECT '=== ESTRUTURA DA TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 3. Teste prático: Verificar se há registros órfãos
SELECT '=== VERIFICANDO REGISTROS ÓRFÃOS ===' as info;

-- Verificar registros com usuario_id que não existe na tabela usuarios
SELECT 
    'Registros com usuario_id inválido' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Registros com categoria_receita_id inválido' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.categoria_receita_id IS NOT NULL AND cr.id IS NULL
UNION ALL
SELECT 
    'Registros com categoria_despesa_id inválido' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas uca
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.categoria_despesa_id IS NOT NULL AND cd.id IS NULL;

-- 4. Mostrar exemplos de registros órfãos (se houver)
SELECT '=== EXEMPLOS DE REGISTROS ÓRFÃOS ===' as info;

SELECT 
    uca.id,
    uca.usuario_id,
    uca.categoria_receita_id,
    uca.categoria_despesa_id,
    uca.ativo,
    CASE 
        WHEN u.id IS NULL THEN 'USUÁRIO NÃO EXISTE'
        WHEN uca.categoria_receita_id IS NOT NULL AND cr.id IS NULL THEN 'CATEGORIA RECEITA NÃO EXISTE'
        WHEN uca.categoria_despesa_id IS NOT NULL AND cd.id IS NULL THEN 'CATEGORIA DESPESA NÃO EXISTE'
        ELSE 'OK'
    END as problema
FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.id
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE u.id IS NULL 
    OR (uca.categoria_receita_id IS NOT NULL AND cr.id IS NULL)
    OR (uca.categoria_despesa_id IS NOT NULL AND cd.id IS NULL)
LIMIT 10;

-- 5. Verificar se há CASCADE DELETE configurado
SELECT '=== CONFIGURAÇÃO DE CASCADE DELETE ===' as info;

SELECT 
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN 'SIM - Os dados serão apagados automaticamente'
        WHEN rc.delete_rule = 'SET NULL' THEN 'NÃO - Os campos ficarão NULL'
        WHEN rc.delete_rule = 'RESTRICT' THEN 'NÃO - Impede a exclusão do usuário'
        WHEN rc.delete_rule = 'NO ACTION' THEN 'NÃO - Impede a exclusão do usuário'
        ELSE 'NÃO - Comportamento padrão'
    END as resultado_cascade_delete
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'usuario_categorias_ativas' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%usuario_id%'
LIMIT 1; 