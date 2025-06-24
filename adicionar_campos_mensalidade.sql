-- Adicionar campos para controle de mensalidade na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN data_cadastro DATE DEFAULT CURRENT_DATE,
ADD COLUMN data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'ativo',
ADD COLUMN plano VARCHAR(20) DEFAULT 'mensal';

-- Criar índice para consultas por vencimento
CREATE INDEX idx_usuarios_vencimento ON usuarios(data_vencimento);
CREATE INDEX idx_usuarios_status ON usuarios(status_pagamento);

-- Comentários para documentação
COMMENT ON COLUMN usuarios.data_cadastro IS 'Data do primeiro cadastro do usuário';
COMMENT ON COLUMN usuarios.data_vencimento IS 'Data de vencimento da próxima mensalidade';
COMMENT ON COLUMN usuarios.status_pagamento IS 'Status do pagamento: ativo, pendente, cancelado';
COMMENT ON COLUMN usuarios.plano IS 'Tipo de plano: mensal, trimestral, anual'; 