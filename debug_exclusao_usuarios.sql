-- Script para diagnosticar problemas de exclusão de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela usuarios existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. Verificar RLS na tabela usuarios
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 4. Listar todos os usuários na tabela
SELECT 
    user_id,
    nome,
    email,
    is_admin,
    created_at,
    updated_at
FROM usuarios
ORDER BY created_at DESC;

-- 5. Verificar se há usuários com o email específico (substitua pelo email real)
-- SELECT * FROM usuarios WHERE email = 'email_do_usuario@exemplo.com';

-- 6. Verificar permissões do service_role
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'usuarios' 
AND grantee = 'service_role';

-- 7. Verificar se há triggers que possam estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios';

-- 8. Verificar foreign keys que possam estar impedindo exclusão
SELECT
    tc.table_name, 
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
AND tc.table_name = 'usuarios';

-- 9. Testar busca direta (substitua pelo email real)
-- SELECT * FROM usuarios WHERE email = 'email_do_usuario@exemplo.com';

-- 10. Verificar se há problemas de encoding ou caracteres especiais
-- SELECT 
--     email,
--     length(email) as email_length,
--     ascii(substring(email from 1 for 1)) as first_char_ascii
-- FROM usuarios 
-- WHERE email LIKE '%@%'; 