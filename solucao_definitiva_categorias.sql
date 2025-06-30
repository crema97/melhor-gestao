-- SOLUÇÃO DEFINITIVA PARA CATEGORIAS DE USUÁRIOS
-- Execute este script no SQL Editor do Supabase

-- 1. REMOVER TABELA EXISTENTE (se houver problemas)
DROP TABLE IF EXISTS usuario_categorias_ativas CASCADE;

-- 2. CRIAR TABELA NOVA COM ESTRUTURA CORRETA
CREATE TABLE usuario_categorias_ativas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    categoria_receita_id UUID,
    categoria_despesa_id UUID,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADICIONAR FOREIGN KEYS
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

-- 8. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. CRIAR TRIGGER
DROP TRIGGER IF EXISTS update_usuario_categorias_ativas_updated_at ON usuario_categorias_ativas;
CREATE TRIGGER update_usuario_categorias_ativas_updated_at
    BEFORE UPDATE ON usuario_categorias_ativas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. TESTAR INSERÇÃO MANUAL
-- Primeiro, vamos ver alguns dados de exemplo:
SELECT '=== DADOS DE EXEMPLO ===' as info;

SELECT 'Usuários disponíveis:' as info;
SELECT user_id, nome, email FROM usuarios LIMIT 3;

SELECT 'Categorias de receita disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita LIMIT 3;

SELECT 'Categorias de despesa disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa LIMIT 3;

-- 11. INSERÇÃO DE TESTE (substitua pelos IDs reais)
-- Descomente e substitua pelos IDs reais para testar:
/*
INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
VALUES 
    ('user_id_aqui', 'categoria_receita_id_aqui', NULL, true),
    ('user_id_aqui', NULL, 'categoria_despesa_id_aqui', true);
*/

-- 12. VERIFICAR SE TUDO ESTÁ FUNCIONANDO
SELECT '=== VERIFICAÇÃO FINAL ===' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 13. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 14. VERIFICAR PERMISSÕES
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'usuario_categorias_ativas';

-- 15. VERIFICAR SE RLS ESTÁ DESABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

SELECT '=== SCRIPT CONCLUÍDO ===' as info;
SELECT 'Agora teste a criação de um novo usuário com categorias!' as proximo_passo; 