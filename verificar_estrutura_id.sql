-- VERIFICAR ESTRUTURA DA COLUNA ID NA TABELA USUARIO_CATEGORIAS_ATIVAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela
SELECT '=== ESTRUTURA DA TABELA USUARIO_CATEGORIAS_ATIVAS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_default LIKE 'gen_random_uuid()' THEN 'UUID Gerado Automaticamente'
        WHEN column_default LIKE 'uuid_generate_v4()' THEN 'UUID Gerado Automaticamente'
        WHEN column_default LIKE 'nextval%' THEN 'Sequência Automática'
        ELSE column_default
    END as tipo_geracao
FROM information_schema.columns
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 2. Verificar se é PRIMARY KEY
SELECT '=== VERIFICANDO PRIMARY KEY ===' as info;

SELECT 
    tc.constraint_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'usuario_categorias_ativas' 
    AND tc.constraint_type = 'PRIMARY KEY';

-- 3. Mostrar alguns exemplos de IDs existentes
SELECT '=== EXEMPLOS DE IDs EXISTENTES ===' as info;

SELECT 
    id,
    usuario_id,
    categoria_receita_id,
    categoria_despesa_id,
    ativo,
    created_at
FROM usuario_categorias_ativas
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se os IDs são UUIDs
SELECT '=== VERIFICANDO FORMATO DOS IDs ===' as info;

SELECT 
    'Total de registros' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas
UNION ALL
SELECT 
    'IDs que são UUIDs válidos' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
UNION ALL
SELECT 
    'IDs que NÃO são UUIDs válidos' as tipo,
    COUNT(*) as quantidade
FROM usuario_categorias_ativas
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 5. Mostrar exemplo de UUID válido
SELECT '=== EXEMPLO DE UUID VÁLIDO ===' as info;

SELECT 
    'Formato esperado' as tipo,
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' as exemplo_uuid,
    'Exemplo real' as tipo_real,
    id as exemplo_real
FROM usuario_categorias_ativas
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
LIMIT 1; 