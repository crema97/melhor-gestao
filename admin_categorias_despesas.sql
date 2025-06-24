-- Script de Administração para Categorias de Despesas
-- Execute este script no SQL Editor do Supabase

-- 1. Ver todas as categorias por tipo de negócio
SELECT 
    cd.id,
    cd.nome as categoria,
    cd.descricao,
    cd.ativo,
    tn.nome as tipo_negocio
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
ORDER BY tn.nome, cd.nome;

-- 2. Adicionar nova categoria para Barbearia
-- INSERT INTO categorias_despesa (nome, descricao, ativo, tipo_negocio_id) VALUES
-- ('Nova Categoria', 'Descrição da nova categoria', true, (SELECT id FROM tipos_negocio WHERE nome = 'Barbearia'));

-- 3. Adicionar nova categoria para Estacionamento
-- INSERT INTO categorias_despesa (nome, descricao, ativo, tipo_negocio_id) VALUES
-- ('Nova Categoria', 'Descrição da nova categoria', true, (SELECT id FROM tipos_negocio WHERE nome = 'Estacionamento'));

-- 4. Adicionar nova categoria para Lava Rápido
-- INSERT INTO categorias_despesa (nome, descricao, ativo, tipo_negocio_id) VALUES
-- ('Nova Categoria', 'Descrição da nova categoria', true, (SELECT id FROM tipos_negocio WHERE nome = 'Lava Rápido'));

-- 5. Editar categoria (substitua o ID pela categoria que deseja editar)
-- UPDATE categorias_despesa 
-- SET nome = 'Novo Nome', descricao = 'Nova descrição'
-- WHERE id = 'ID_DA_CATEGORIA';

-- 6. Desativar categoria
-- UPDATE categorias_despesa 
-- SET ativo = false
-- WHERE id = 'ID_DA_CATEGORIA';

-- 7. Reativar categoria
-- UPDATE categorias_despesa 
-- SET ativo = true
-- WHERE id = 'ID_DA_CATEGORIA';

-- 8. Ver categorias inativas
SELECT 
    cd.nome as categoria,
    cd.descricao,
    tn.nome as tipo_negocio
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE cd.ativo = false
ORDER BY tn.nome, cd.nome; 