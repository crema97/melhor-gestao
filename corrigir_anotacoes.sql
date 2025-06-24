-- Script para corrigir a tabela anotacoes
-- Execute este script no SQL Editor do Supabase

-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'anotacoes' 
        AND column_name = 'data_anotacao'
    ) THEN
        -- Adicionar coluna se não existir
        ALTER TABLE anotacoes ADD COLUMN data_anotacao DATE DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Coluna data_anotacao adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna data_anotacao já existe';
    END IF;
END $$;

-- Atualizar anotações existentes com a data atual se data_anotacao for NULL
UPDATE anotacoes 
SET data_anotacao = CURRENT_DATE 
WHERE data_anotacao IS NULL;

-- Verificar a estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'anotacoes'
ORDER BY ordinal_position; 