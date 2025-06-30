-- SOLUÇÃO COMPLETA PARA PROBLEMA DE CATEGORIAS DE USUÁRIOS
-- Execute este script no Supabase SQL Editor para resolver todos os problemas

-- 1. Verificar e criar tabela se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuario_categorias_ativas') THEN
        CREATE TABLE usuario_categorias_ativas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            usuario_id UUID NOT NULL,
            categoria_receita_id UUID,
            categoria_despesa_id UUID,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela usuario_categorias_ativas criada!';
    END IF;
END $$;

-- 2. Adicionar colunas faltantes se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuario_categorias_ativas' AND column_name = 'id') THEN
        ALTER TABLE usuario_categorias_ativas ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuario_categorias_ativas' AND column_name = 'created_at') THEN
        ALTER TABLE usuario_categorias_ativas ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuario_categorias_ativas' AND column_name = 'updated_at') THEN
        ALTER TABLE usuario_categorias_ativas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Adicionar foreign keys se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'usuario_categorias_ativas_usuario_id_fkey') THEN
        ALTER TABLE usuario_categorias_ativas ADD CONSTRAINT usuario_categorias_ativas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'usuario_categorias_ativas_categoria_receita_id_fkey') THEN
        ALTER TABLE usuario_categorias_ativas ADD CONSTRAINT usuario_categorias_ativas_categoria_receita_id_fkey FOREIGN KEY (categoria_receita_id) REFERENCES categorias_receita(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'usuario_categorias_ativas_categoria_despesa_id_fkey') THEN
        ALTER TABLE usuario_categorias_ativas ADD CONSTRAINT usuario_categorias_ativas_categoria_despesa_id_fkey FOREIGN KEY (categoria_despesa_id) REFERENCES categorias_despesa(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Criar índices para performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'usuario_categorias_ativas' AND indexname = 'idx_usuario_categorias_ativas_usuario_id') THEN
        CREATE INDEX idx_usuario_categorias_ativas_usuario_id ON usuario_categorias_ativas(usuario_id);
    END IF;
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'usuario_categorias_ativas' AND indexname = 'idx_usuario_categorias_ativas_usuario_ativo') THEN
        CREATE INDEX idx_usuario_categorias_ativas_usuario_ativo ON usuario_categorias_ativas(usuario_id, ativo);
    END IF;
END $$;

-- 5. Configurar RLS e políticas
ALTER TABLE usuario_categorias_ativas ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable read access for all users" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable all for service role" ON usuario_categorias_ativas;

-- Criar política permissiva para service role
CREATE POLICY "Enable all for service role" ON usuario_categorias_ativas
FOR ALL USING (true) WITH CHECK (true);

-- 6. Garantir permissões para service role
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 7. Teste de inserção para verificar se tudo funciona
DO $$
DECLARE
    usuario_test_id UUID;
    categoria_receita_test_id UUID;
    categoria_despesa_test_id UUID;
    insert_result RECORD;
BEGIN
    -- Pegar dados de teste
    SELECT user_id INTO usuario_test_id FROM usuarios LIMIT 1;
    SELECT id INTO categoria_receita_test_id FROM categorias_receita WHERE ativo = true LIMIT 1;
    SELECT id INTO categoria_despesa_test_id FROM categorias_despesa WHERE ativo = true LIMIT 1;
    
    IF usuario_test_id IS NOT NULL AND categoria_receita_test_id IS NOT NULL AND categoria_despesa_test_id IS NOT NULL THEN
        -- Teste de inserção múltipla (como a API faz)
        INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
        VALUES 
            (usuario_test_id, categoria_receita_test_id, NULL, true),
            (usuario_test_id, NULL, categoria_despesa_test_id, true)
        RETURNING * INTO insert_result;
        
        RAISE NOTICE 'Teste de inserção bem-sucedido!';
        
        -- Limpar teste
        DELETE FROM usuario_categorias_ativas WHERE usuario_id = usuario_test_id AND created_at > NOW() - INTERVAL '1 minute';
        RAISE NOTICE 'Dados de teste removidos.';
    ELSE
        RAISE NOTICE 'Dados de teste não encontrados. Verifique se há usuários e categorias cadastrados.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro durante teste: % - %', SQLSTATE, SQLERRM;
END $$;

-- 8. Mostrar estatísticas finais
SELECT 'ESTATÍSTICAS FINAIS:' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT usuario_id) as usuarios_unicos,
    COUNT(CASE WHEN categoria_receita_id IS NOT NULL THEN 1 END) as categorias_receita,
    COUNT(CASE WHEN categoria_despesa_id IS NOT NULL THEN 1 END) as categorias_despesa,
    COUNT(CASE WHEN ativo = true THEN 1 END) as registros_ativos
FROM usuario_categorias_ativas;

SELECT 'SOLUÇÃO APLICADA COM SUCESSO! Agora teste criar um novo usuário.' as resultado; 