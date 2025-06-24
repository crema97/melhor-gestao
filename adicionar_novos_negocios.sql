-- Script para adicionar novos tipos de negócio: Estética e Salão de Beleza
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar novos tipos de negócio
INSERT INTO tipos_negocio (nome) VALUES 
('Estética'),
('Salão de Beleza');

-- 2. Adicionar categorias de receita para ESTÉTICA
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Manicure Tradicional', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Pedicure Tradicional', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Esmaltação em Gel', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Alongamento de Unha em Gel', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Alongamento de Unha em Fibra de Vidro', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Manutenção de Alongamento', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Remoção de Alongamento', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Nail Art Simples', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Nail Art Efeitos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Venda de Produtos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true);

-- 3. Adicionar categorias de despesa para ESTÉTICA (padrão igual barbearia)
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Contas (água, luz, internet)', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Produtos de higiene', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Manutenção', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true);

-- 4. Verificar se tudo foi inserido corretamente
SELECT 'TIPOS DE NEGÓCIO:' as tipo, nome FROM tipos_negocio ORDER BY nome;

SELECT 'CATEGORIAS DE RECEITA - ESTÉTICA:' as tipo, nome 
FROM categorias_receita 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Estética')
ORDER BY nome;

SELECT 'CATEGORIAS DE DESPESA - ESTÉTICA:' as tipo, nome 
FROM categorias_despesa 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Estética')
ORDER BY nome; 