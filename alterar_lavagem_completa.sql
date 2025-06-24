-- Script simples para alterar "Lavagem Completa" para "Lavagem com Cera"
UPDATE categorias_receita 
SET nome = 'Lavagem com Cera'
WHERE nome = 'Lavagem Completa'; 