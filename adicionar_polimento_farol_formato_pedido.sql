-- Adicionar Polimento de Farol como categoria de receita para Estacionamento
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) 
VALUES ('Polimento de Farol', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true); 