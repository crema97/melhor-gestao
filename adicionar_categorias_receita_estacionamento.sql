-- Script para adicionar categorias de receita para o Estacionamento
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o ID do tipo de negócio "Estacionamento"
SELECT id, nome FROM tipos_negocio WHERE nome = 'Estacionamento';

-- 2. Adicionar categorias de receita para ESTACIONAMENTO
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Estacionamento por Hora', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Estacionamento por Dia', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Estacionamento Mensal', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Estacionamento Anual', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Lavagem de Carro', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Enceramento', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Aspiração', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Lavagem de Motor', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Pacotes de Serviços', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Venda de Produtos', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'), true);

-- 3. Verificar se as categorias foram inseridas corretamente
SELECT 
    'CATEGORIAS DE RECEITA - ESTACIONAMENTO:' as tipo,
    cr.id,
    cr.nome,
    cr.ativo,
    tn.nome as tipo_negocio
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento' AND cr.ativo = true
ORDER BY cr.nome;

-- 4. Contar total de categorias
SELECT 
    COUNT(*) as total_categorias_receita
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estacionamento' AND cr.ativo = true; 