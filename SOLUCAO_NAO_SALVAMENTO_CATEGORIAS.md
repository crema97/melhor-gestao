# Solução para Problema de Não Salvamento das Categorias

## Problema Identificado
As categorias selecionadas não estão sendo salvas na tabela `usuario_categorias_ativas` durante a criação de novos usuários.

## Possíveis Causas

### 1. Problemas de Configuração do Supabase
- Variáveis de ambiente incorretas
- Service role key inválida
- Problemas de conectividade

### 2. Problemas de Estrutura da Tabela
- Tabela não existe
- Colunas faltantes
- Constraints incorretas
- Problemas de tipos de dados

### 3. Problemas de Permissões (RLS)
- Políticas RLS impedindo inserção
- Service role sem permissões adequadas
- Problemas de autenticação

### 4. Problemas de Dados
- IDs de categorias inválidos
- IDs de usuário inválidos
- Dados malformados

## Soluções Implementadas

### 1. Logs Detalhados na API
Adicionei logs completos na API `create-user` para identificar:
- Dados recebidos
- Dados preparados para inserção
- Erros detalhados
- Tentativa de inserção individual

### 2. Correção da Configuração
Modifiquei a API para usar o `supabaseAdmin` importado em vez de criar uma nova instância.

### 3. Scripts de Diagnóstico
Criei scripts SQL para verificar:
- Estrutura da tabela
- Permissões
- Políticas RLS
- Dados de teste

## Scripts de Solução

### 1. Verificação Completa
```sql
-- Execute para diagnosticar o problema
verificar_problema_insercao.sql
```

### 2. Teste de Inserção Manual
```sql
-- Execute para testar inserção manual
teste_insercao_manual.sql
```

### 3. Correção Completa
```sql
-- Execute para corrigir problemas estruturais
solucao_completa_categorias.sql
```

## Passos para Resolução

### Passo 1: Executar Script de Diagnóstico
1. Execute `verificar_problema_insercao.sql` no Supabase SQL Editor
2. Verifique os resultados para identificar o problema específico
3. Anote qualquer erro ou problema encontrado

### Passo 2: Verificar Logs da API
1. Tente criar um novo usuário
2. Verifique os logs no Supabase (Logs > API)
3. Procure por erros específicos na inserção de categorias

### Passo 3: Testar Inserção Manual
1. Execute `teste_insercao_manual.sql`
2. Verifique se a inserção manual funciona
3. Se funcionar, o problema está na API

### Passo 4: Executar Correção
1. Execute `solucao_completa_categorias.sql`
2. Teste novamente a criação de usuário
3. Verifique se as categorias são salvas

## Logs Importantes

### Supabase Logs (API)
- `Dados recebidos para criação de usuário:`
- `Categorias selecionadas recebidas:`
- `Categorias preparadas para salvar:`
- `Tentando salvar categorias na tabela usuario_categorias_ativas...`
- `Erro ao salvar categorias:` (se houver erro)

### Console do Navegador
- Verifique se há erros de rede
- Verifique se a requisição está sendo feita corretamente

## Verificações Específicas

### 1. Verificar Service Role Key
```javascript
// No arquivo supabaseAdmin.js
const supabaseServiceKey = 'sua_service_role_key_aqui'
```

### 2. Verificar Estrutura da Tabela
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuario_categorias_ativas';
```

### 3. Verificar Políticas RLS
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario_categorias_ativas';
```

### 4. Verificar Permissões
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'usuario_categorias_ativas';
```

## Teste de Funcionamento

### 1. Teste Manual
1. Execute os scripts SQL
2. Crie um novo usuário com categorias selecionadas
3. Verifique se as categorias aparecem na tabela

### 2. Verificar na Interface
1. Vá para a lista de usuários
2. Clique em "editar" nas categorias de um usuário
3. Verifique se as categorias são carregadas

### 3. Verificar no Supabase
1. Acesse o Supabase Dashboard
2. Vá para Table Editor
3. Verifique a tabela `usuario_categorias_ativas`
4. Confirme se há registros

## Próximos Passos

1. **Execute o script de diagnóstico** para identificar o problema específico
2. **Verifique os logs** da API no Supabase
3. **Teste a inserção manual** para confirmar se a tabela funciona
4. **Execute a correção** se necessário
5. **Teste novamente** a criação de usuário

## Contato para Suporte

Se o problema persistir após executar todas as soluções, verifique:
- Os logs detalhados da API no Supabase
- Os resultados dos scripts de diagnóstico
- Se há erros específicos sendo reportados
- Se a tabela está sendo criada corretamente 