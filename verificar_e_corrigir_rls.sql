-- Verificar se RLS está habilitado nas tabelas de categorias
SELECT 'RLS habilitado nas tabelas:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('categorias_receita', 'categorias_despesa');

-- Verificar políticas RLS existentes
SELECT 'Políticas RLS em categorias_receita:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categorias_receita';

SELECT 'Políticas RLS em categorias_despesa:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categorias_despesa';

-- Se houver políticas RLS bloqueando, vamos criar políticas que permitam acesso total para service role
-- Política para categorias_receita (permitir acesso total)
DROP POLICY IF EXISTS "Permitir acesso total categorias_receita" ON categorias_receita;
CREATE POLICY "Permitir acesso total categorias_receita" ON categorias_receita
FOR ALL USING (true);

-- Política para categorias_despesa (permitir acesso total)
DROP POLICY IF EXISTS "Permitir acesso total categorias_despesa" ON categorias_despesa;
CREATE POLICY "Permitir acesso total categorias_despesa" ON categorias_despesa
FOR ALL USING (true);

-- Verificar se as políticas foram criadas
SELECT 'Políticas criadas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('categorias_receita', 'categorias_despesa'); 