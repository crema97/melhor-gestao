-- Script para adicionar categorias de receita e despesa para SALÃO DE BELEZA
-- Execute este script no SQL Editor do Supabase APÓS executar o script principal

-- 1. Adicionar categorias de receita para SALÃO DE BELEZA
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Corte Feminino', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Corte Masculino', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Escova', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Pintura', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Mechas', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Hidratação', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Tratamento Capilar', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Penteado', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Manicure', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Pedicure', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Esmaltação', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Depilação', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Maquiagem', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Venda de Produtos', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true);

-- 2. Adicionar categorias de despesa para SALÃO DE BELEZA (padrão igual barbearia)
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Contas (água, luz, internet)', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Produtos de higiene', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Manutenção', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true);

-- 3. Verificar se tudo foi inserido corretamente
SELECT 'CATEGORIAS DE RECEITA - SALÃO DE BELEZA:' as tipo, nome 
FROM categorias_receita 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza')
ORDER BY nome;

SELECT 'CATEGORIAS DE DESPESA - SALÃO DE BELEZA:' as tipo, nome 
FROM categorias_despesa 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza')
ORDER BY nome; 