-- Script para adicionar categorias de receita para o Salão de Beleza
-- ID do tipo de negócio: 7e1d1f77-4721-47cc-8173-393074cdae13

-- Inserir categorias de receita para Salão de Beleza
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Corte de Cabelo', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Escova', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Progressiva', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Coloração', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Tratamentos Capilares', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Manicure e Pedicure', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Depilação', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Sobrancelhas', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Extensão de Cílios', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Alongamento de Unhas', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Maquiagem', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Pacotes de Serviços', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Venda de Produtos', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Outros', '7e1d1f77-4721-47cc-8173-393074cdae13', true);

-- Inserir categorias de despesa para Salão de Beleza
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Produtos de Beleza', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Equipamentos', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Aluguel', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Contas (Luz, Água, Internet)', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Funcionários', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Marketing e Publicidade', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Limpeza e Manutenção', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Seguros', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Impostos', '7e1d1f77-4721-47cc-8173-393074cdae13', true),
('Outros', '7e1d1f77-4721-47cc-8173-393074cdae13', true);

-- Verificar se as categorias foram inseridas corretamente
SELECT 'Categorias de Receita:' as tipo, nome FROM categorias_receita 
WHERE tipo_negocio_id = '7e1d1f77-4721-47cc-8173-393074cdae13' AND ativo = true
ORDER BY nome;

SELECT 'Categorias de Despesa:' as tipo, nome FROM categorias_despesa 
WHERE tipo_negocio_id = '7e1d1f77-4721-47cc-8173-393074cdae13' AND ativo = true
ORDER BY nome; 