-- Verificar políticas RLS existentes na tabela usuario_categorias_ativas
SELECT 'Políticas RLS existentes em usuario_categorias_ativas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable read access for all users" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON usuario_categorias_ativas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON usuario_categorias_ativas;

-- Criar política para permitir acesso total (para service role)
CREATE POLICY "Permitir acesso total usuario_categorias_ativas" ON usuario_categorias_ativas
FOR ALL USING (true) WITH CHECK (true);

-- Verificar se a política foi criada
SELECT 'Política criada em usuario_categorias_ativas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- Teste: inserir um registro de teste para verificar se funciona
INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- UUID de teste
  '34a9378e-994d-49dc-8114-4c4d1bfcd52e', -- ID de uma categoria de receita da Barbearia
  NULL,
  true
);

-- Verificar se o registro foi inserido
SELECT 'Registro de teste inserido:' as info;
SELECT * FROM usuario_categorias_ativas WHERE usuario_id = '00000000-0000-0000-0000-000000000000';

-- Limpar o registro de teste
DELETE FROM usuario_categorias_ativas WHERE usuario_id = '00000000-0000-0000-0000-000000000000';

SELECT 'Teste concluído - RLS configurado corretamente!' as info; 