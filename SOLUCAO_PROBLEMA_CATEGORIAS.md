# Solução para Problema de Salvamento de Categorias

## Problema Identificado
O sistema não está salvando as categorias selecionadas na tabela `usuario_categorias_ativas` durante a criação de novos usuários.

## Possíveis Causas e Soluções

### 1. Problemas de Estrutura da Tabela
**Causa:** A tabela `usuario_categorias_ativas` pode ter problemas estruturais.

**Solução:** Execute o script `corrigir_tabela_categorias_usuarios.sql` para:
- Verificar se a tabela existe
- Adicionar colunas faltantes
- Criar constraints necessárias
- Adicionar índices para performance

### 2. Problemas de Políticas RLS (Row Level Security)
**Causa:** As políticas RLS podem estar impedindo a inserção de dados.

**Solução:** Execute o script `verificar_rls_categorias.sql` para:
- Verificar políticas RLS existentes
- Remover políticas conflitantes
- Criar política permissiva para service role
- Garantir permissões adequadas

### 3. Problemas de Foreign Keys
**Causa:** Constraints de foreign key podem estar falhando.

**Solução:** Verificar se:
- Os IDs de usuário existem na tabela `usuarios`
- Os IDs de categorias existem nas tabelas `categorias_receita` e `categorias_despesa`
- Os tipos de dados estão corretos (UUID)

### 4. Problemas de Dados Enviados
**Causa:** Os dados enviados pela interface podem estar incorretos.

**Solução:** Verificar no console do navegador:
- Se as categorias estão sendo selecionadas corretamente
- Se os IDs das categorias são válidos
- Se o formato dos dados está correto

### 5. Problemas de API
**Causa:** A API pode estar falhando silenciosamente.

**Solução:** Os logs foram adicionados na API `create-user` para:
- Mostrar os dados recebidos
- Mostrar os dados preparados para inserção
- Mostrar erros detalhados
- Tentar inserção individual em caso de falha

## Passos para Resolução

### Passo 1: Executar Scripts de Correção
```sql
-- Execute estes scripts no Supabase SQL Editor:
1. debug_categorias_usuarios.sql
2. corrigir_tabela_categorias_usuarios.sql
3. verificar_rls_categorias.sql
4. teste_insercao_categorias.sql
```

### Passo 2: Verificar Logs
1. Abra o console do navegador (F12)
2. Tente criar um novo usuário
3. Verifique os logs no console
4. Verifique os logs no Supabase (Logs > API)

### Passo 3: Testar Manualmente
1. Execute o script `teste_insercao_categorias.sql`
2. Verifique se a inserção manual funciona
3. Compare com os dados enviados pela API

### Passo 4: Verificar Interface
1. Verifique se as categorias estão sendo carregadas
2. Verifique se as categorias estão sendo selecionadas
3. Verifique se os dados estão sendo enviados corretamente

## Logs Adicionados para Debug

### API create-user
- Log dos dados recebidos
- Log das categorias preparadas para inserção
- Log detalhado de erros
- Tentativa de inserção individual em caso de falha

### Interface Admin
- Log das categorias carregadas
- Log das categorias selecionadas
- Log dos dados enviados para a API

## Verificações Importantes

### 1. Estrutura da Tabela
```sql
-- Verificar se a tabela tem a estrutura correta
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas';
```

### 2. Políticas RLS
```sql
-- Verificar políticas existentes
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';
```

### 3. Dados de Teste
```sql
-- Verificar se há dados para teste
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM categorias_receita WHERE ativo = true;
SELECT COUNT(*) FROM categorias_despesa WHERE ativo = true;
```

## Próximos Passos

1. Execute os scripts de correção
2. Teste a criação de um novo usuário
3. Verifique os logs para identificar o problema específico
4. Se necessário, ajuste as políticas RLS ou estrutura da tabela
5. Teste novamente até que funcione corretamente

## Contato para Suporte

Se o problema persistir após executar todas as soluções, verifique:
- Os logs detalhados no console do navegador
- Os logs da API no Supabase
- Os resultados dos scripts de teste
- Se há erros específicos sendo reportados 