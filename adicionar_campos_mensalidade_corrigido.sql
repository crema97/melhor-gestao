-- Adicionar campos para controle de mensalidade (apenas se não existirem)
DO $$ 
BEGIN
    -- Adicionar data_cadastro se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'data_cadastro') THEN
        ALTER TABLE usuarios ADD COLUMN data_cadastro DATE DEFAULT CURRENT_DATE;
    END IF;

    -- Adicionar data_vencimento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'data_vencimento') THEN
        ALTER TABLE usuarios ADD COLUMN data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month');
    END IF;

    -- Adicionar status_pagamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'status_pagamento') THEN
        ALTER TABLE usuarios ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'ativo';
    END IF;

    -- Adicionar plano se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'plano') THEN
        ALTER TABLE usuarios ADD COLUMN plano VARCHAR(20) DEFAULT 'mensal';
    END IF;

END $$;

-- Criar índices (apenas se não existirem)
DO $$
BEGIN
    -- Índice para vencimento
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_usuarios_vencimento') THEN
        CREATE INDEX idx_usuarios_vencimento ON usuarios(data_vencimento);
    END IF;

    -- Índice para status
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_usuarios_status') THEN
        CREATE INDEX idx_usuarios_status ON usuarios(status_pagamento);
    END IF;
END $$;

-- Atualizar comentários
COMMENT ON COLUMN usuarios.data_cadastro IS 'Data do primeiro cadastro do usuário';
COMMENT ON COLUMN usuarios.data_vencimento IS 'Data de vencimento da próxima mensalidade';
COMMENT ON COLUMN usuarios.status_pagamento IS 'Status do pagamento: ativo, pendente, cancelado';
COMMENT ON COLUMN usuarios.plano IS 'Tipo de plano: mensal, trimestral, anual'; 