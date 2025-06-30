-- CORRIGIR FOREIGN KEY PARA REFERENCIAR ID (PRIMARY KEY)
-- Execute este script no SQL Editor do Supabase

-- 1. Remover o foreign key incorreto
ALTER TABLE usuario_categorias_ativas 
DROP CONSTRAINT IF EXISTS fk_usuario_categorias_ativas_usuario;

-- 2. Adicionar o foreign key correto (referenciando id - primary key)
ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT fk_usuario_categorias_ativas_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- 3. Verificar se o foreign key foi criado corretamente
SELECT '=== VERIFICAR FOREIGN KEY CORRIGIDO ===' as info;
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

-- 4. Verificar se há dados na tabela
SELECT '=== VERIFICAR DADOS ===' as info;
SELECT COUNT(*) as total_registros FROM usuario_categorias_ativas;

-- 5. Testar inserção manual (substitua pelos IDs reais)
-- Descomente e substitua pelos IDs reais para testar:
/*
-- Pegue um id de um usuário (não user_id!)
SELECT id, user_id, nome, email FROM usuarios LIMIT 1;

-- Pegue alguns IDs de categorias
SELECT id, nome FROM categorias_receita LIMIT 1;
SELECT id, nome FROM categorias_despesa LIMIT 1;

-- Teste a inserção (substitua pelos IDs reais):
INSERT INTO usuario_categorias_ativas (usuario_id, categoria_receita_id, categoria_despesa_id, ativo)
VALUES 
    ('id_do_usuario_aqui', 'categoria_receita_id_aqui', NULL, true);
*/

SELECT '=== SCRIPT CONCLUÍDO ===' as info;
SELECT 'Agora teste a criação de um novo usuário com categorias!' as proximo_passo; 