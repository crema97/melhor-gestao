-- Verificar se RLS está habilitado na tabela usuario_categorias_ativas
SELECT 'RLS habilitado na tabela usuario_categorias_ativas:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- Verificar políticas RLS existentes na tabela
SELECT 'Políticas RLS existentes em usuario_categorias_ativas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- Habilitar RLS na tabela (se não estiver habilitado)
ALTER TABLE usuario_categorias_ativas ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso total para service role
DROP POLICY IF EXISTS "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas;
CREATE POLICY "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas
FOR ALL USING (true);

-- Verificar se a política foi criada
SELECT 'Política criada em usuario_categorias_ativas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- Verificar se RLS está habilitado
SELECT 'RLS habilitado após configuração:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas'; 