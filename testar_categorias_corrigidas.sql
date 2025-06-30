-- TESTAR CATEGORIAS CORRIGIDAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual das tabelas
SELECT '=== ESTRUTURA ATUAL ===' as info;

SELECT 'Tabela usuarios:' as tabela;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('id', 'user_id')
ORDER BY column_name;

SELECT 'Tabela usuario_categorias_ativas:' as tabela;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas' 
AND column_name IN ('id', 'usuario_id')
ORDER BY column_name;

-- 2. Verificar foreign key
SELECT '=== FOREIGN KEY ===' as info;
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'usuario_categorias_ativas';

-- 3. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;

SELECT 'Usuários:' as info;
SELECT id, user_id, nome, email FROM usuarios LIMIT 3;

SELECT 'Categorias ativas:' as info;
SELECT * FROM usuario_categorias_ativas LIMIT 3;

-- 4. Contagem de dados
SELECT '=== CONTAGEM ===' as info;
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
    'usuario_categorias_ativas' as tabela,
    COUNT(*) as total_registros
FROM usuario_categorias_ativas;

-- 5. Teste de inserção manual (substitua pelos IDs reais)
SELECT '=== TESTE DE INSERÇÃO MANUAL ===' as info;
SELECT 'Para testar, pegue um ID de usuário da tabela usuarios e execute:' as instrucao;

-- Pegue um id de um usuário (não user_id!)
SELECT 'ID de usuário para teste:' as info, id, user_id, nome, email FROM usuarios LIMIT 1;

-- Pegue alguns IDs de categorias
SELECT 'Categorias de receita disponíveis:' as info;
SELECT id, nome FROM categorias_receita LIMIT 3;

SELECT 'Categorias de despesa disponíveis:' as info;
SELECT id, nome FROM categorias_despesa LIMIT 3;

-- 6. Verificar se há categorias ativas para algum usuário
SELECT '=== CATEGORIAS ATIVAS POR USUÁRIO ===' as info;
SELECT 
    u.nome,
    u.email,
    COUNT(uca.id) as total_categorias_ativas
FROM usuarios u
LEFT JOIN usuario_categorias_ativas uca ON u.id = uca.usuario_id AND uca.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY total_categorias_ativas DESC;

SELECT '=== SCRIPT CONCLUÍDO ===' as info;
SELECT 'Agora teste a criação de um novo usuário com categorias!' as proximo_passo; 