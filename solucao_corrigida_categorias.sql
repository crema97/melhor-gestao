-- SOLUÇÃO CORRIGIDA PARA CATEGORIAS DE USUÁRIOS
-- Baseado na estrutura real das tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. REMOVER TABELA EXISTENTE (se houver problemas)
DROP TABLE IF EXISTS usuario_categorias_ativas CASCADE;

-- 2. CRIAR TABELA NOVA COM ESTRUTURA CORRETA
CREATE TABLE usuario_categorias_ativas (
    id SERIAL PRIMARY KEY,  -- INTEGER, não UUID
    usuario_id UUID NOT NULL,
    categoria_receita_id UUID,
    categoria_despesa_id UUID,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADICIONAR FOREIGN KEYS CORRETOS
-- Referenciar user_id da tabela usuarios (não id)
ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT fk_usuario_categorias_ativas_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;

ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT fk_usuario_categorias_ativas_receita 
FOREIGN KEY (categoria_receita_id) REFERENCES categorias_receita(id) ON DELETE CASCADE;

ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT fk_usuario_categorias_ativas_despesa 
FOREIGN KEY (categoria_despesa_id) REFERENCES categorias_despesa(id) ON DELETE CASCADE;

-- 4. ADICIONAR CONSTRAINTS
-- Garantir que pelo menos uma categoria seja especificada
ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT check_categoria_especificada 
CHECK (categoria_receita_id IS NOT NULL OR categoria_despesa_id IS NOT NULL);

-- Garantir que não há duplicatas
ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT unique_usuario_categoria 
UNIQUE (usuario_id, categoria_receita_id, categoria_despesa_id);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_usuario_categorias_ativas_usuario_id 
ON usuario_categorias_ativas(usuario_id);

CREATE INDEX idx_usuario_categorias_ativas_categoria_receita_id 
ON usuario_categorias_ativas(categoria_receita_id);

CREATE INDEX idx_usuario_categorias_ativas_categoria_despesa_id 
ON usuario_categorias_ativas(categoria_despesa_id);

CREATE INDEX idx_usuario_categorias_ativas_ativo 
ON usuario_categorias_ativas(ativo);

-- 6. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE usuario_categorias_ativas DISABLE ROW LEVEL SECURITY;

-- 7. GARANTIR PERMISSÕES COMPLETAS PARA SERVICE_ROLE
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO service_role;
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO postgres;
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO authenticated;
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO anon;

-- 8. GARANTIR PERMISSÕES NA SEQUENCE (importante para SERIAL)
GRANT USAGE, SELECT ON SEQUENCE usuario_categorias_ativas_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE usuario_categorias_ativas_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE usuario_categorias_ativas_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE usuario_categorias_ativas_id_seq TO anon;

-- 9. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. CRIAR TRIGGER
DROP TRIGGER IF EXISTS update_usuario_categorias_ativas_updated_at ON usuario_categorias_ativas;
CREATE TRIGGER update_usuario_categorias_ativas_updated_at
    BEFORE UPDATE ON usuario_categorias_ativas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. TESTAR INSERÇÃO MANUAL
-- Primeiro, vamos ver alguns dados de exemplo:
SELECT '=== DADOS DE EXEMPLO ===' as info;

SELECT 'Usuários disponíveis:' as info;
SELECT user_id, nome, email FROM usuarios LIMIT 3;

SELECT 'Categorias de receita disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita LIMIT 3;

SELECT 'Categorias de despesa disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa LIMIT 3;

-- 12. INSERÇÃO DE TESTE (substitua pelos IDs reais)
-- Descomente e substitua pelos IDs reais para testar:
/*
INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
VALUES 
    ('user_id_aqui', 'categoria_receita_id_aqui', NULL, true),
    ('user_id_aqui', NULL, 'categoria_despesa_id_aqui', true);
*/

-- 13. VERIFICAR SE TUDO ESTÁ FUNCIONANDO
SELECT '=== VERIFICAÇÃO FINAL ===' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 14. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 15. VERIFICAR PERMISSÕES
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'usuario_categorias_ativas';

-- 16. VERIFICAR SE RLS ESTÁ DESABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 17. VERIFICAR FOREIGN KEYS
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

SELECT '=== SCRIPT CONCLUÍDO ===' as info;
SELECT 'Agora teste a criação de um novo usuário com categorias!' as proximo_passo; 