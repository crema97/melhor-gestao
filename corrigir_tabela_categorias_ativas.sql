-- Script para corrigir problemas na tabela usuario_categorias_ativas
-- Execute este script no SQL Editor do Supabase

-- 1. Garantir que o service_role tem todas as permissões necessárias
GRANT ALL PRIVILEGES ON TABLE usuario_categorias_ativas TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Desabilitar RLS temporariamente para o service_role
ALTER TABLE usuario_categorias_ativas DISABLE ROW LEVEL SECURITY;

-- 3. Criar política específica para o service_role
DROP POLICY IF EXISTS "service_role_access_categorias_ativas" ON usuario_categorias_ativas;
CREATE POLICY "service_role_access_categorias_ativas" ON usuario_categorias_ativas
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Verificar se a tabela tem a estrutura correta
-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS usuario_categorias_ativas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(user_id) ON DELETE CASCADE,
    categoria_receita_id UUID REFERENCES categorias_receita(id) ON DELETE CASCADE,
    categoria_despesa_id UUID REFERENCES categorias_despesa(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Adicionar constraints se não existirem
-- Garantir que pelo menos uma categoria (receita ou despesa) seja especificada
ALTER TABLE usuario_categorias_ativas 
DROP CONSTRAINT IF EXISTS check_categoria_especificada;

ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT check_categoria_especificada 
CHECK (categoria_receita_id IS NOT NULL OR categoria_despesa_id IS NOT NULL);

-- Garantir que não há duplicatas
ALTER TABLE usuario_categorias_ativas 
DROP CONSTRAINT IF EXISTS unique_usuario_categoria;

ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT unique_usuario_categoria 
UNIQUE (usuario_id, categoria_receita_id, categoria_despesa_id);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuario_categorias_ativas_usuario_id 
ON usuario_categorias_ativas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_usuario_categorias_ativas_categoria_receita_id 
ON usuario_categorias_ativas(categoria_receita_id);

CREATE INDEX IF NOT EXISTS idx_usuario_categorias_ativas_categoria_despesa_id 
ON usuario_categorias_ativas(categoria_despesa_id);

CREATE INDEX IF NOT EXISTS idx_usuario_categorias_ativas_ativo 
ON usuario_categorias_ativas(ativo);

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_usuario_categorias_ativas_updated_at ON usuario_categorias_ativas;
CREATE TRIGGER update_usuario_categorias_ativas_updated_at
    BEFORE UPDATE ON usuario_categorias_ativas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Limpar dados inválidos (se houver)
DELETE FROM usuario_categorias_ativas 
WHERE categoria_receita_id IS NULL AND categoria_despesa_id IS NULL;

DELETE FROM usuario_categorias_ativas 
WHERE usuario_id NOT IN (SELECT user_id FROM usuarios);

DELETE FROM usuario_categorias_ativas 
WHERE categoria_receita_id IS NOT NULL 
AND categoria_receita_id NOT IN (SELECT id FROM categorias_receita);

DELETE FROM usuario_categorias_ativas 
WHERE categoria_despesa_id IS NOT NULL 
AND categoria_despesa_id NOT IN (SELECT id FROM categorias_despesa);

-- 10. Testar inserção manual (substitua pelos IDs reais)
-- Primeiro, vamos ver alguns dados de exemplo:
SELECT 'Usuários disponíveis:' as info;
SELECT user_id, nome, email FROM usuarios LIMIT 3;

SELECT 'Categorias de receita disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita LIMIT 3;

SELECT 'Categorias de despesa disponíveis:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa LIMIT 3;

-- 11. Exemplo de inserção manual (descomente e substitua pelos IDs reais):
-- INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
-- VALUES 
--     ('user_id_aqui', 'categoria_receita_id_aqui', NULL, true),
--     ('user_id_aqui', NULL, 'categoria_despesa_id_aqui', true);

-- 12. Verificar se tudo está funcionando
SELECT 'Verificação final:' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 13. Se tudo estiver funcionando, reabilitar RLS com políticas corretas
-- ALTER TABLE usuario_categorias_ativas ENABLE ROW LEVEL SECURITY;

-- 14. Criar políticas para usuários normais
DROP POLICY IF EXISTS "usuarios_see_own_categorias_ativas" ON usuario_categorias_ativas;
CREATE POLICY "usuarios_see_own_categorias_ativas" ON usuario_categorias_ativas
    FOR ALL
    TO authenticated
    USING (usuario_id = auth.uid());

-- Política para admins verem todas as categorias
DROP POLICY IF EXISTS "admins_see_all_categorias_ativas" ON usuario_categorias_ativas;
CREATE POLICY "admins_see_all_categorias_ativas" ON usuario_categorias_ativas
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    ); 