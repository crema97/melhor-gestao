-- Verificar todos os tipos de negócio primeiro
SELECT 'Tipos de Negócio:' as info;
SELECT id, nome FROM tipos_negocio;

-- Verificar se a tabela usuario_categorias_ativas foi criada
SELECT 'Tabela usuario_categorias_ativas existe:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'usuario_categorias_ativas'
);

-- Verificar categorias de receita (usando o UUID correto da Barbearia)
SELECT 'Categorias de Receita para Barbearia:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia' LIMIT 1);

-- Verificar categorias de despesa (usando o UUID correto da Barbearia)
SELECT 'Categorias de Despesa para Barbearia:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa 
WHERE tipo_negocio_id = (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia' LIMIT 1);

-- Verificar todas as categorias de receita
SELECT 'Todas as Categorias de Receita:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_receita;

-- Verificar todas as categorias de despesa
SELECT 'Todas as Categorias de Despesa:' as info;
SELECT id, nome, tipo_negocio_id FROM categorias_despesa; 