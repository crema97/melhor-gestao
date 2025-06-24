-- Adicionar apenas os campos que faltam para o sistema de mensalidades
-- Baseado na estrutura atual da tabela usuarios

-- Adicionar data_vencimento (não existe)
ALTER TABLE usuarios ADD COLUMN data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month');

-- Adicionar status_pagamento (não existe)
ALTER TABLE usuarios ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'ativo';

-- Adicionar plano (não existe)
ALTER TABLE usuarios ADD COLUMN plano VARCHAR(20) DEFAULT 'mensal';

-- Criar índices para otimização
CREATE INDEX idx_usuarios_vencimento ON usuarios(data_vencimento);
CREATE INDEX idx_usuarios_status ON usuarios(status_pagamento);

-- Adicionar comentários para documentação
COMMENT ON COLUMN usuarios.data_vencimento IS 'Data de vencimento da próxima mensalidade';
COMMENT ON COLUMN usuarios.status_pagamento IS 'Status do pagamento: ativo, pendente, cancelado';
COMMENT ON COLUMN usuarios.plano IS 'Tipo de plano: mensal, trimestral, anual'; 