-- SQL Final para Categorias de Despesas
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos limpar as categorias de despesas existentes (se houver)
DELETE FROM categorias_despesa;

-- Inserir categorias de despesas (genéricas para todos os tipos de negócio)
INSERT INTO categorias_despesa (nome, descricao, ativo) VALUES
('Aluguel', 'Despesas com aluguel do estabelecimento', true),
('Contas (água, luz, internet)', 'Despesas com contas de água, luz e internet', true),
('Produtos de higiene', 'Produtos de higiene e limpeza', true),
('Equipamentos', 'Compra e manutenção de equipamentos', true),
('Manutenção', 'Despesas com manutenção geral', true),
('Marketing/Publicidade', 'Despesas com marketing e publicidade', true),
('Impostos', 'Impostos e taxas', true),
('Seguros', 'Seguros do estabelecimento', true),
('Funcionários', 'Salários e benefícios de funcionários', true),
('Segurança', 'Despesas com segurança e vigilância', true),
('Produtos de limpeza', 'Produtos específicos para limpeza', true),
('Outros', 'Outras despesas não categorizadas', true);

-- Verificar se as categorias foram inseridas corretamente
SELECT nome, descricao FROM categorias_despesa ORDER BY nome; 