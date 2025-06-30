-- Script para debug e correção de problemas com categorias de usuários
-- Verificar estrutura da tabela usuario_categorias_ativas

-- 1. Verificar se a tabela existe
SELECT 'Verificando existência da tabela usuario_categorias_ativas:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas';

-- 2. Verificar estrutura da tabela
SELECT 'Estrutura da tabela usuario_categorias_ativas:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'usuario_categorias_ativas'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 'RLS habilitado na tabela usuario_categorias_ativas:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario_categorias_ativas';

-- 4. Verificar políticas RLS existentes
SELECT 'Políticas RLS existentes:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';

-- 5. Verificar se há registros na tabela
SELECT 'Total de registros na tabela usuario_categorias_ativas:' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 6. Verificar alguns registros de exemplo
SELECT 'Registros de exemplo:' as info;
SELECT * FROM usuario_categorias_ativas LIMIT 5;

-- 7. Verificar se há categorias disponíveis
SELECT 'Categorias de receita disponíveis:' as info;
SELECT COUNT(*) as total_receitas FROM categorias_receita WHERE ativo = true;

SELECT 'Categorias de despesa disponíveis:' as info;
SELECT COUNT(*) as total_despesas FROM categorias_despesa WHERE ativo = true;

-- 8. Verificar tipos de negócio
SELECT 'Tipos de negócio disponíveis:' as info;
SELECT id, nome FROM tipos_negocio;

-- 9. Teste de inserção manual (comentado para segurança)
/*
-- Descomente para testar inserção manual
INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- UUID de teste
  (SELECT id FROM categorias_receita WHERE ativo = true LIMIT 1), -- Primeira categoria de receita ativa
  NULL,
  true
);

-- Verificar se foi inserido
SELECT 'Teste de inserção:' as info;
SELECT * FROM usuario_categorias_ativas WHERE usuario_id = '00000000-0000-0000-0000-000000000000';

-- Limpar teste
DELETE FROM usuario_categorias_ativas WHERE usuario_id = '00000000-0000-0000-0000-000000000000';
*/

-- 10. Verificar se há problemas de constraint
SELECT 'Verificando constraints:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuario_categorias_ativas'::regclass;

-- 11. Verificar se há índices
SELECT 'Verificando índices:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'usuario_categorias_ativas';

-- 12. Verificar permissões
SELECT 'Verificando permissões:' as info;
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'usuario_categorias_ativas';

SELECT 'Debug concluído!' as info; 