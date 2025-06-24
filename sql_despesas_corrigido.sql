-- SQL Corrigido para Categorias de Despesas
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos limpar as categorias de despesas existentes (se houver)
DELETE FROM categorias_despesa;

-- Categorias para BARBEARIA
INSERT INTO categorias_despesa (nome, tipo_negocio) VALUES
('Aluguel', 'Barbearia'),
('Contas (água, luz, internet)', 'Barbearia'),
('Produtos de higiene', 'Barbearia'),
('Equipamentos', 'Barbearia'),
('Manutenção', 'Barbearia'),
('Marketing/Publicidade', 'Barbearia'),
('Impostos', 'Barbearia'),
('Seguros', 'Barbearia'),
('Funcionários', 'Barbearia'),
('Outros', 'Barbearia');

-- Categorias para ESTACIONAMENTO
INSERT INTO categorias_despesa (nome, tipo_negocio) VALUES
('Aluguel', 'Estacionamento'),
('Contas (água, luz)', 'Estacionamento'),
('Manutenção de equipamentos', 'Estacionamento'),
('Segurança', 'Estacionamento'),
('Impostos', 'Estacionamento'),
('Seguros', 'Estacionamento'),
('Funcionários', 'Estacionamento'),
('Marketing/Publicidade', 'Estacionamento'),
('Outros', 'Estacionamento');

-- Categorias para LAVA RÁPIDO
INSERT INTO categorias_despesa (nome, tipo_negocio) VALUES
('Aluguel', 'Lava Rápido'),
('Contas (água, luz)', 'Lava Rápido'),
('Produtos de limpeza', 'Lava Rápido'),
('Equipamentos', 'Lava Rápido'),
('Manutenção', 'Lava Rápido'),
('Marketing/Publicidade', 'Lava Rápido'),
('Impostos', 'Lava Rápido'),
('Seguros', 'Lava Rápido'),
('Funcionários', 'Lava Rápido'),
('Outros', 'Lava Rápido');

-- Verificar se as categorias foram inseridas corretamente
SELECT nome, tipo_negocio FROM categorias_despesa ORDER BY tipo_negocio, nome; 