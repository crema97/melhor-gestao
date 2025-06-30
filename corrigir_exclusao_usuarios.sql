-- Script para corrigir problemas de exclusão de usuários
-- Execute este script para resolver problemas de permissões e RLS

-- 1. Verificar e corrigir RLS na tabela usuarios
SELECT 'CORRIGINDO RLS NA TABELA USUARIOS:' as info;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Enable read access for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuarios;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON usuarios;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON usuarios;
DROP POLICY IF EXISTS "Enable all for service role" ON usuarios;
DROP POLICY IF EXISTS "Permitir acesso total usuarios" ON usuarios;

-- Criar política permissiva para service role
CREATE POLICY "Enable all for service role" ON usuarios
FOR ALL USING (true) WITH CHECK (true);

-- 2. Verificar e corrigir RLS na tabela usuario_categorias_ativas
SELECT 'CORRIGINDO RLS NA TABELA USUARIO_CATEGORIAS_ATIVAS:' as info;
ALTER TABLE usuario_categorias_ativas ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Enable read access for all users" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable all for service role" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas;

-- Criar política permissiva para service role
CREATE POLICY "Enable all for service role" ON usuario_categorias_ativas
FOR ALL USING (true) WITH CHECK (true);

-- 3. Garantir permissões para service role
SELECT 'GARANTINDO PERMISSÕES PARA SERVICE ROLE:' as info;
GRANT ALL PRIVILEGES ON TABLE usuarios TO service_role;
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 4. Verificar e corrigir foreign keys se necessário
SELECT 'VERIFICANDO FOREIGN KEYS:' as info;
-- Verificar se há foreign keys que podem estar impedindo exclusão
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuario_categorias_ativas'::regclass
AND contype = 'f';

-- 5. Verificar se há constraints de exclusão em cascata
SELECT 'VERIFICANDO CONSTRAINTS DE CASCATA:' as info;
-- Se não houver CASCADE, adicionar
DO $$
BEGIN
    -- Verificar se existe foreign key para usuario_id sem CASCADE
    IF EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuario_categorias_ativas_usuario_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Remover constraint existente
        ALTER TABLE usuario_categorias_ativas 
        DROP CONSTRAINT IF EXISTS usuario_categorias_ativas_usuario_id_fkey;
        
        -- Recriar com CASCADE
        ALTER TABLE usuario_categorias_ativas 
        ADD CONSTRAINT usuario_categorias_ativas_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key recriada com CASCADE';
    END IF;
END $$;

-- 6. Verificar se há índices que podem estar causando problemas
SELECT 'VERIFICANDO ÍNDICES:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('usuarios', 'usuario_categorias_ativas');

-- 7. Teste de exclusão manual (comentado para segurança)
SELECT 'TESTE DE EXCLUSÃO MANUAL:' as info;
-- Descomente para testar exclusão manual
/*
DO $$
DECLARE
    usuario_test_email TEXT;
    usuario_test_id UUID;
    categorias_count INTEGER;
BEGIN
    -- Pegar o primeiro usuário não-admin
    SELECT email, user_id INTO usuario_test_email, usuario_test_id 
    FROM usuarios 
    WHERE is_admin = false 
    LIMIT 1;
    
    IF usuario_test_email IS NOT NULL THEN
        RAISE NOTICE 'Testando exclusão do usuário: % (ID: %)', usuario_test_email, usuario_test_id;
        
        -- Verificar quantas categorias o usuário tem
        SELECT COUNT(*) INTO categorias_count 
        FROM usuario_categorias_ativas 
        WHERE usuario_id = usuario_test_id;
        
        RAISE NOTICE 'Usuário tem % categorias ativas', categorias_count;
        
        -- Excluir usuário (as categorias devem ser excluídas automaticamente por CASCADE)
        DELETE FROM usuarios WHERE email = usuario_test_email;
        RAISE NOTICE 'Usuário excluído com sucesso';
        
    ELSE
        RAISE NOTICE 'Nenhum usuário não-admin encontrado para teste';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante teste de exclusão: % - %', SQLSTATE, SQLERRM;
END $$;
*/

-- 8. Verificar políticas criadas
SELECT 'POLÍTICAS CRIADAS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('usuarios', 'usuario_categorias_ativas');

-- 9. Verificar permissões finais
SELECT 'PERMISSÕES FINAIS:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name IN ('usuarios', 'usuario_categorias_ativas')
AND grantee = 'service_role';

-- 10. Verificar estatísticas finais
SELECT 'ESTATÍSTICAS FINAIS:' as info;
SELECT 
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM usuario_categorias_ativas) as total_categorias_ativas,
    (SELECT COUNT(*) FROM usuarios WHERE is_admin = false) as usuarios_nao_admin;

SELECT 'CORREÇÃO DE EXCLUSÃO CONCLUÍDA!' as info; 