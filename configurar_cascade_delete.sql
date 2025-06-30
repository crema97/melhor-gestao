-- CONFIGURAR CASCADE DELETE PARA USUARIO_CATEGORIAS_ATIVAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar configuração atual
SELECT '=== CONFIGURAÇÃO ATUAL ===' as info;

SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'usuario_categorias_ativas'
    AND kcu.column_name = 'usuario_id';

-- 2. Remover foreign key atual (se existir)
SELECT '=== REMOVENDO FOREIGN KEY ATUAL ===' as info;

-- Primeiro, vamos ver qual é o nome da constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'usuario_categorias_ativas'
        AND tc.constraint_name LIKE '%usuario_id%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE usuario_categorias_ativas DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Foreign key removida: %', constraint_name;
    ELSE
        RAISE NOTICE 'Nenhuma foreign key encontrada para usuario_id';
    END IF;
END $$;

-- 3. Adicionar nova foreign key com CASCADE DELETE
SELECT '=== ADICIONANDO FOREIGN KEY COM CASCADE DELETE ===' as info;

ALTER TABLE usuario_categorias_ativas 
ADD CONSTRAINT fk_usuario_categorias_ativas_usuario_id 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE;

-- 4. Verificar nova configuração
SELECT '=== NOVA CONFIGURAÇÃO ===' as info;

SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'usuario_categorias_ativas'
    AND kcu.column_name = 'usuario_id';

-- 5. Teste: Verificar se a configuração está correta
SELECT '=== TESTE DE CONFIGURAÇÃO ===' as info;

SELECT 
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE DELETE CONFIGURADO - Os dados serão apagados automaticamente quando o usuário for excluído'
        ELSE '❌ CASCADE DELETE NÃO CONFIGURADO'
    END as resultado
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'usuario_categorias_ativas' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name = 'fk_usuario_categorias_ativas_usuario_id';

SELECT '=== CONFIGURAÇÃO CONCLUÍDA ===' as info;
SELECT 'Agora quando você apagar um usuário, todos os registros da tabela usuario_categorias_ativas serão apagados automaticamente!' as resultado; 