-- Script para adicionar campo de data nas anotações
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna data_anotacao
ALTER TABLE anotacoes 
ADD COLUMN data_anotacao DATE DEFAULT CURRENT_DATE;

-- Atualizar anotações existentes com a data atual
UPDATE anotacoes 
SET data_anotacao = CURRENT_DATE 
WHERE data_anotacao IS NULL; 