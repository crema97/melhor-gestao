-- Script para adicionar categorias de despesas para todos os tipos de negócio
-- Execute este script no SQL Editor do Supabase

-- Categorias para BARBEARIA
INSERT INTO categorias_despesa (nome, tipo_negocio_id) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Contas (água, luz, internet)', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Produtos de higiene', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Manutenção', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia')),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia'));

-- Categorias para ESTACIONAMENTO
INSERT INTO categorias_despesa (nome, tipo_negocio_id) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Contas (água, luz)', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Manutenção de equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Segurança', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento')),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'));

-- Categorias para LAVA RÁPIDO
INSERT INTO categorias_despesa (nome, tipo_negocio_id) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Contas (água, luz)', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Produtos de limpeza', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Manutenção', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido')); 