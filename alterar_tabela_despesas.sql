-- Script para modificar a tabela categorias_despesa
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna tipo_negocio_id
ALTER TABLE categorias_despesa 
ADD COLUMN tipo_negocio_id UUID REFERENCES tipos_negocio(id);

-- Limpar dados existentes (se houver)
DELETE FROM categorias_despesa;

-- Inserir categorias específicas para cada tipo de negócio

-- Categorias para BARBEARIA
INSERT INTO categorias_despesa (nome, descricao, ativo, tipo_negocio_id) VALUES
('Aluguel', 'Despesas com aluguel do estabelecimento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Contas (água, luz, internet)', 'Despesas com contas de água, luz e internet', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Produtos de higiene', 'Produtos de higiene e limpeza específicos para barbearia', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Equipamentos', 'Compra e manutenção de equipamentos de barbearia', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Manutenção', 'Despesas com manutenção geral do estabelecimento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Marketing/Publicidade', 'Despesas com marketing e publicidade', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Impostos', 'Impostos e taxas', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Seguros', 'Seguros do estabelecimento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Funcionários', 'Salários e benefícios de funcionários', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Outros', 'Outras despesas não categorizadas', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia'));

-- Categorias para ESTACIONAMENTO
INSERT INTO categorias_despesa (nome, descricao, ativo, tipo_negocio_id) VALUES
('Aluguel', 'Despesas com aluguel do estacionamento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Contas (água, luz)', 'Despesas com contas de água e luz', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Manutenção de equipamentos', 'Manutenção de catracas, câmeras, etc.', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Segurança', 'Despesas com segurança e vigilância', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Impostos', 'Impostos e taxas', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Seguros', 'Seguros do estacionamento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Funcionários', 'Salários e benefícios de funcionários', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Marketing/Publicidade', 'Despesas com marketing e publicidade', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Outros', 'Outras despesas não categorizadas', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'));

-- Categorias para LAVA RÁPIDO
INSERT INTO categorias_despesa (nome, descricao, ativo, tipo_negocio_id) VALUES
('Aluguel', 'Despesas com aluguel do estabelecimento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Contas (água, luz)', 'Despesas com contas de água e luz', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Produtos de limpeza', 'Produtos específicos para lavagem de carros', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Equipamentos', 'Compra e manutenção de equipamentos de lavagem', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Manutenção', 'Despesas com manutenção geral', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Marketing/Publicidade', 'Despesas com marketing e publicidade', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Impostos', 'Impostos e taxas', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Seguros', 'Seguros do estabelecimento', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Funcionários', 'Salários e benefícios de funcionários', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Outros', 'Outras despesas não categorizadas', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido'));

-- Verificar se as categorias foram inseridas corretamente
SELECT 
    cd.nome as categoria,
    cd.descricao,
    tn.nome as tipo_negocio
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
ORDER BY tn.nome, cd.nome; 