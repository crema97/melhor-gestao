-- Primeiro, vamos pegar o UUID da Barbearia
SELECT 'UUID da Barbearia:' as info;
SELECT id, nome FROM tipos_negocio WHERE nome = 'Barbearia';

-- Agora vamos verificar as categorias de receita da Barbearia
SELECT 'Categorias de Receita da Barbearia:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia' LIMIT 1);

-- Verificar categorias de despesa da Barbearia
SELECT 'Categorias de Despesa da Barbearia:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia' LIMIT 1); 