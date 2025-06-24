-- Script para debug do login da Estética
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o tipo de negócio Estética existe
SELECT 'TIPO DE NEGÓCIO:' as tipo, id, nome FROM tipos_negocio WHERE nome = 'Estética';

-- 2. Verificar usuários da Estética
SELECT 
    'USUÁRIO:' as tipo,
    u.id,
    u.nome,
    u.email,
    u.nome_negocio,
    u.tipo_negocio_id,
    tn.nome as tipo_negocio_nome
FROM usuarios u
JOIN tipos_negocio tn ON u.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética';

-- 3. Verificar se as categorias foram criadas
SELECT 
    'CATEGORIA RECEITA:' as tipo,
    cr.id,
    cr.nome,
    cr.tipo_negocio_id
FROM categorias_receita cr
JOIN tipos_negocio tn ON cr.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY cr.nome;

-- 4. Verificar se as categorias de despesa foram criadas
SELECT 
    'CATEGORIA DESPESA:' as tipo,
    cd.id,
    cd.nome,
    cd.tipo_negocio_id
FROM categorias_despesa cd
JOIN tipos_negocio tn ON cd.tipo_negocio_id = tn.id
WHERE tn.nome = 'Estética'
ORDER BY cd.nome; 