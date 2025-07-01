-- =====================================================
-- SCRIPT PARA RENOVAÇÃO MANUAL DE PLANOS
-- =====================================================
-- Use este script quando o cliente pagar via PIX
-- e você precisar renovar o plano manualmente

-- =====================================================
-- 1. VERIFICAR CLIENTE ESPECÍFICO
-- =====================================================
-- Substitua 'EMAIL_DO_CLIENTE' pelo email real do cliente
SELECT 
    id,
    nome,
    email,
    plano,
    data_vencimento,
    status_pagamento,
    data_cadastro
FROM usuarios 
WHERE email = 'EMAIL_DO_CLIENTE';

-- =====================================================
-- 2. RENOVAR PLANO MENSAL
-- =====================================================
-- Para renovar por mais 1 mês
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE email = 'EMAIL_DO_CLIENTE';

-- =====================================================
-- 3. RENOVAR PLANO TRIMESTRAL
-- =====================================================
-- Para renovar por mais 3 meses
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '3 months',
    status_pagamento = 'ativo'
WHERE email = 'EMAIL_DO_CLIENTE';

-- =====================================================
-- 4. RENOVAR PLANO ANUAL
-- =====================================================
-- Para renovar por mais 1 ano
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '1 year',
    status_pagamento = 'ativo'
WHERE email = 'EMAIL_DO_CLIENTE';

-- =====================================================
-- 5. MUDAR TIPO DE PLANO E RENOVAR
-- =====================================================
-- Para mudar de mensal para trimestral
UPDATE usuarios 
SET 
    plano = 'trimestral',
    data_vencimento = CURRENT_DATE + INTERVAL '3 months',
    status_pagamento = 'ativo'
WHERE email = 'EMAIL_DO_CLIENTE';

-- Para mudar de mensal para anual
UPDATE usuarios 
SET 
    plano = 'anual',
    data_vencimento = CURRENT_DATE + INTERVAL '1 year',
    status_pagamento = 'ativo'
WHERE email = 'EMAIL_DO_CLIENTE';

-- =====================================================
-- 6. RENOVAR A PARTIR DA DATA ATUAL
-- =====================================================
-- Se o plano já venceu, renovar a partir de hoje
UPDATE usuarios 
SET 
    data_vencimento = CURRENT_DATE + INTERVAL '1 month', -- Para mensal
    status_pagamento = 'ativo'
WHERE email = 'EMAIL_DO_CLIENTE' AND data_vencimento < CURRENT_DATE;

-- =====================================================
-- 7. VERIFICAR APÓS RENOVAÇÃO
-- =====================================================
-- Confirme que a renovação foi feita corretamente
SELECT 
    id,
    nome,
    email,
    plano,
    data_vencimento,
    status_pagamento,
    CASE 
        WHEN data_vencimento < CURRENT_DATE THEN 'VENCIDO'
        ELSE 'ATIVO'
    END as status_vencimento
FROM usuarios 
WHERE email = 'EMAIL_DO_CLIENTE';

-- =====================================================
-- 8. RENOVAR MÚLTIPLOS CLIENTES
-- =====================================================
-- Para renovar todos os clientes vencidos por 1 mês
UPDATE usuarios 
SET 
    data_vencimento = CURRENT_DATE + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE data_vencimento < CURRENT_DATE;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Substitua 'EMAIL_DO_CLIENTE' pelo email real
-- 2. Execute primeiro a consulta de verificação (passo 1)
-- 3. Escolha o tipo de renovação (passos 2-6)
-- 4. Execute a renovação desejada
-- 5. Confirme com a consulta de verificação (passo 7)
-- 6. Ou use o Painel Admin que agora tem botão de renovação!

-- =====================================================
-- EXEMPLOS PRÁTICOS:
-- =====================================================

-- Exemplo 1: Renovar João Silva por mais 1 mês
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE email = 'joao.silva@email.com';

-- Exemplo 2: Mudar Maria Santos para plano trimestral
UPDATE usuarios 
SET 
    plano = 'trimestral',
    data_vencimento = CURRENT_DATE + INTERVAL '3 months',
    status_pagamento = 'ativo'
WHERE email = 'maria.santos@email.com';

-- Exemplo 3: Renovar cliente vencido a partir de hoje
UPDATE usuarios 
SET 
    data_vencimento = CURRENT_DATE + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE email = 'cliente.vencido@email.com' AND data_vencimento < CURRENT_DATE; 