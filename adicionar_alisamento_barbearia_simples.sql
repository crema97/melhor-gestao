-- ADICIONAR SERVIÇO ALISAMENTO PARA BARBEARIA
-- Execute este script no SQL Editor do Supabase
-- ID da Barbearia: 04c82ce2-c099-44ca-85ce-b48549e5a592

-- Adicionar categoria de receita "Alisamento" para barbearia
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo)
VALUES ('Alisamento', '04c82ce2-c099-44ca-85ce-b48549e5a592', true);

-- Verificar se foi inserida
SELECT 'Categoria Alisamento adicionada com sucesso!' as resultado; 