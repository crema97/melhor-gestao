-- Script para verificar e corrigir RLS da tabela anotacoes
-- Execute este script no SQL Editor do Supabase

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'anotacoes';

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'anotacoes';

-- Criar política para usuários verem apenas suas anotações
CREATE POLICY "Usuários podem ver suas próprias anotações" ON anotacoes
    FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- Criar política para usuários inserirem suas anotações
CREATE POLICY "Usuários podem inserir suas anotações" ON anotacoes
    FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

-- Criar política para usuários atualizarem suas anotações
CREATE POLICY "Usuários podem atualizar suas anotações" ON anotacoes
    FOR UPDATE USING (auth.uid()::text = usuario_id::text);

-- Criar política para usuários deletarem suas anotações
CREATE POLICY "Usuários podem deletar suas anotações" ON anotacoes
    FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Habilitar RLS se não estiver habilitado
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY; 