-- Script para corrigir problemas na tabela usuario_categorias_ativas
-- Este script verifica e corrige possíveis problemas estruturais

-- 1. Verificar se a tabela existe, se não, criar
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
        
        RAISE NOTICE 'Tabela usuario_categorias_ativas criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela usuario_categorias_ativas já existe.';
    END IF;
END $$;

-- 2. Verificar e adicionar colunas faltantes se necessário
DO $$
BEGIN
    -- Verificar se a coluna id existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuario_categorias_ativas' AND column_name = 'id') THEN
        ALTER TABLE usuario_categorias_ativas ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
        RAISE NOTICE 'Coluna id adicionada.';
    END IF;
    
    -- Verificar se a coluna created_at existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuario_categorias_ativas' AND column_name = 'created_at') THEN
        ALTER TABLE usuario_categorias_ativas ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada.';
    END IF;
    
    -- Verificar se a coluna updated_at existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuario_categorias_ativas' AND column_name = 'updated_at') THEN
        ALTER TABLE usuario_categorias_ativas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada.';
    END IF;
END $$;

-- 3. Verificar e adicionar constraints se necessário
DO $$
BEGIN
    -- Verificar se existe constraint de foreign key para usuario_id
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuario_categorias_ativas_usuario_id_fkey'
    ) THEN
        ALTER TABLE usuario_categorias_ativas 
        ADD CONSTRAINT usuario_categorias_ativas_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key para usuario_id adicionada.';
    END IF;
    
    -- Verificar se existe constraint de foreign key para categoria_receita_id
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuario_categorias_ativas_categoria_receita_id_fkey'
    ) THEN
        ALTER TABLE usuario_categorias_ativas 
        ADD CONSTRAINT usuario_categorias_ativas_categoria_receita_id_fkey 
        FOREIGN KEY (categoria_receita_id) REFERENCES categorias_receita(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key para categoria_receita_id adicionada.';
    END IF;
    
    -- Verificar se existe constraint de foreign key para categoria_despesa_id
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuario_categorias_ativas_categoria_despesa_id_fkey'
    ) THEN
        ALTER TABLE usuario_categorias_ativas 
        ADD CONSTRAINT usuario_categorias_ativas_categoria_despesa_id_fkey 
        FOREIGN KEY (categoria_despesa_id) REFERENCES categorias_despesa(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key para categoria_despesa_id adicionada.';
    END IF;
END $$;

-- 4. Verificar e adicionar índices se necessário
DO $$
BEGIN
    -- Índice para usuario_id
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'usuario_categorias_ativas' AND indexname = 'idx_usuario_categorias_ativas_usuario_id') THEN
        CREATE INDEX idx_usuario_categorias_ativas_usuario_id ON usuario_categorias_ativas(usuario_id);
        RAISE NOTICE 'Índice para usuario_id criado.';
    END IF;
    
    -- Índice para categoria_receita_id
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'usuario_categorias_ativas' AND indexname = 'idx_usuario_categorias_ativas_categoria_receita_id') THEN
        CREATE INDEX idx_usuario_categorias_ativas_categoria_receita_id ON usuario_categorias_ativas(categoria_receita_id);
        RAISE NOTICE 'Índice para categoria_receita_id criado.';
    END IF;
    
    -- Índice para categoria_despesa_id
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'usuario_categorias_ativas' AND indexname = 'idx_usuario_categorias_ativas_categoria_despesa_id') THEN
        CREATE INDEX idx_usuario_categorias_ativas_categoria_despesa_id ON usuario_categorias_ativas(categoria_despesa_id);
        RAISE NOTICE 'Índice para categoria_despesa_id criado.';
    END IF;
    
    -- Índice composto para consultas por usuario_id e ativo
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'usuario_categorias_ativas' AND indexname = 'idx_usuario_categorias_ativas_usuario_ativo') THEN
        CREATE INDEX idx_usuario_categorias_ativas_usuario_ativo ON usuario_categorias_ativas(usuario_id, ativo);
        RAISE NOTICE 'Índice composto para usuario_id e ativo criado.';
    END IF;
END $$;

-- 5. Habilitar RLS se não estiver habilitado
ALTER TABLE usuario_categorias_ativas ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas RLS existentes e criar uma nova
DROP POLICY IF EXISTS "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable read access for all users" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON usuario_categorias_ativas;

-- Criar política para permitir acesso total (para service role)
CREATE POLICY "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas
FOR ALL USING (true) WITH CHECK (true);

-- 7. Verificar se há registros duplicados ou inconsistentes
SELECT 'Verificando registros duplicados:' as info;
SELECT usuario_id, categoria_receita_id, categoria_despesa_id, COUNT(*) as total
FROM usuario_categorias_ativas
GROUP BY usuario_id, categoria_receita_id, categoria_despesa_id
HAVING COUNT(*) > 1;

-- 8. Verificar registros com valores nulos inconsistentes
SELECT 'Verificando registros com valores nulos inconsistentes:' as info;
SELECT * FROM usuario_categorias_ativas 
WHERE categoria_receita_id IS NULL AND categoria_despesa_id IS NULL;

-- 9. Verificar se há registros com categorias que não existem
SELECT 'Verificando categorias de receita inexistentes:' as info;
SELECT uca.* FROM usuario_categorias_ativas uca
LEFT JOIN categorias_receita cr ON uca.categoria_receita_id = cr.id
WHERE uca.categoria_receita_id IS NOT NULL AND cr.id IS NULL;

SELECT 'Verificando categorias de despesa inexistentes:' as info;
SELECT uca.* FROM usuario_categorias_ativas uca
LEFT JOIN categorias_despesa cd ON uca.categoria_despesa_id = cd.id
WHERE uca.categoria_despesa_id IS NOT NULL AND cd.id IS NULL;

-- 10. Verificar se há usuários que não existem
SELECT 'Verificando usuários inexistentes:' as info;
SELECT uca.* FROM usuario_categorias_ativas uca
LEFT JOIN usuarios u ON uca.usuario_id = u.user_id
WHERE u.user_id IS NULL;

-- 11. Mostrar estatísticas finais
SELECT 'Estatísticas da tabela usuario_categorias_ativas:' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT usuario_id) as usuarios_unicos,
    COUNT(CASE WHEN categoria_receita_id IS NOT NULL THEN 1 END) as categorias_receita,
    COUNT(CASE WHEN categoria_despesa_id IS NOT NULL THEN 1 END) as categorias_despesa,
    COUNT(CASE WHEN ativo = true THEN 1 END) as registros_ativos
FROM usuario_categorias_ativas;

SELECT 'Correção da tabela usuario_categorias_ativas concluída!' as info; 