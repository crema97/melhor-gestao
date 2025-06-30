-- Verificar políticas RLS na tabela categorias_receita
SELECT 'Políticas RLS em categorias_receita:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categorias_receita';

-- Verificar políticas RLS na tabela categorias_despesa
SELECT 'Políticas RLS em categorias_despesa:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categorias_despesa';

-- Verificar se RLS está habilitado nas tabelas
SELECT 'RLS habilitado nas tabelas:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('categorias_receita', 'categorias_despesa'); 