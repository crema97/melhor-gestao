-- Script para limpar dados incorretos do estacionamento
-- Execute este script para corrigir problemas nos gráficos

-- 1. Verificar e limpar receitas órfãs (sem usuário válido)
DELETE FROM receitas 
WHERE usuario_id NOT IN (SELECT id FROM usuarios);

-- 2. Verificar e limpar despesas órfãs (sem usuário válido)
DELETE FROM despesas 
WHERE usuario_id NOT IN (SELECT id FROM usuarios);

-- 3. Verificar e corrigir dados com valores negativos ou zero
UPDATE receitas 
SET valor = ABS(valor) 
WHERE valor < 0;

UPDATE despesas 
SET valor = ABS(valor) 
WHERE valor < 0;

-- 4. Verificar e corrigir datas inválidas
UPDATE receitas 
SET data_receita = CURRENT_DATE 
WHERE data_receita IS NULL OR data_receita = '';

UPDATE despesas 
SET data_despesa = CURRENT_DATE 
WHERE data_despesa IS NULL OR data_despesa = '';

-- 5. Verificar e corrigir categorias inválidas
UPDATE receitas 
SET categoria_receita_id = NULL 
WHERE categoria_receita_id NOT IN (SELECT id FROM categorias_receita);

UPDATE despesas 
SET categoria_despesa_id = NULL 
WHERE categoria_despesa_id NOT IN (SELECT id FROM categorias_despesa);

-- 6. Verificar e corrigir formas de pagamento inválidas
UPDATE receitas 
SET forma_pagamento = 'dinheiro' 
WHERE forma_pagamento NOT IN ('dinheiro', 'debito', 'credito', 'pix') 
   OR forma_pagamento IS NULL 
   OR forma_pagamento = '';

-- 7. Verificar se há dados duplicados e remover
DELETE FROM receitas 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM receitas 
    GROUP BY usuario_id, valor, data_receita, forma_pagamento, observacoes
);

DELETE FROM despesas 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM despesas 
    GROUP BY usuario_id, valor, data_despesa, observacoes
);

-- 8. Verificar e corrigir usuários sem tipo de negócio válido
UPDATE usuarios 
SET tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome ILIKE '%estacionamento%' LIMIT 1)
WHERE tipo_negocio_id NOT IN (SELECT id FROM tipos_negocio)
   OR tipo_negocio_id IS NULL;

-- 9. Verificar se as políticas RLS estão funcionando corretamente
-- (Isso deve ser feito manualmente verificando as políticas)

-- 10. Relatório final dos dados limpos
SELECT 
    'Receitas após limpeza' as tipo,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM receitas

UNION ALL

SELECT 
    'Despesas após limpeza' as tipo,
    COUNT(*) as total,
    COALESCE(SUM(valor), 0) as valor_total
FROM despesas

ORDER BY tipo; 