# Solução para Problema de Exclusão de Usuários

## Problema Identificado
Não é possível excluir usuários cadastrados através da interface do admin.

## Possíveis Causas

### 1. Problemas de Permissões (RLS)
- Políticas RLS impedindo exclusão
- Service role sem permissões adequadas
- Problemas de autenticação

### 2. Problemas de Foreign Keys
- Constraints sem CASCADE
- Dependências não resolvidas
- Categorias ativas impedindo exclusão

### 3. Problemas de API
- Cliente Supabase sem permissões adequadas
- API não configurada corretamente
- Problemas de autenticação

### 4. Problemas de Interface
- Função de exclusão não implementada corretamente
- Problemas de comunicação com a API

## Soluções Implementadas

### 1. Nova API de Exclusão
Criei uma API específica `/api/admin/delete-user` que:
- Usa o `supabaseAdmin` com permissões adequadas
- Exclui categorias ativas primeiro
- Exclui o usuário da tabela `usuarios`
- Exclui o usuário do auth
- Fornece logs detalhados

### 2. Interface Atualizada
Modifiquei a função `handleDeleteUser` para:
- Usar a nova API de exclusão
- Fornecer feedback detalhado
- Tratar erros adequadamente
- Mostrar logs no console

### 3. Scripts de Diagnóstico
Criei scripts SQL para verificar:
- Políticas RLS
- Permissões
- Foreign keys
- Constraints

## Scripts de Solução

### 1. Verificação de Problemas
```sql
-- Execute para diagnosticar o problema
verificar_exclusao_usuarios.sql
```

### 2. Correção de Problemas
```sql
-- Execute para corrigir problemas de permissões e RLS
corrigir_exclusao_usuarios.sql
```

## Passos para Resolução

### Passo 1: Executar Script de Diagnóstico
1. Execute `verificar_exclusao_usuarios.sql` no Supabase SQL Editor
2. Verifique os resultados para identificar problemas específicos
3. Anote qualquer erro ou problema encontrado

### Passo 2: Executar Correção
1. Execute `corrigir_exclusao_usuarios.sql` no Supabase SQL Editor
2. Este script corrige problemas de RLS e permissões
3. Configura foreign keys com CASCADE

### Passo 3: Testar Exclusão
1. Tente excluir um usuário através da interface
2. Verifique os logs no console do navegador
3. Verifique os logs no Supabase (Logs > API)

### Passo 4: Verificar Resultado
1. Confirme se o usuário foi excluído da lista
2. Verifique se as categorias foram excluídas
3. Confirme se o usuário foi removido do auth

## Logs Importantes

### Console do Navegador
- `Tentando excluir usuário:`
- `Resposta da API de exclusão:`
- `Usuário excluído com sucesso`

### Supabase Logs (API)
- `API delete-user chamada com email:`
- `Buscando usuário...`
- `Usuário encontrado:`
- `Excluindo categorias ativas do usuário...`
- `Categorias excluídas com sucesso`
- `Excluindo usuário da tabela usuarios...`
- `Usuário excluído da tabela usuarios com sucesso`
- `Excluindo usuário do auth...`
- `Usuário excluído do auth com sucesso`

## Verificações Específicas

### 1. Verificar Políticas RLS
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('usuarios', 'usuario_categorias_ativas');
```

### 2. Verificar Permissões
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('usuarios', 'usuario_categorias_ativas')
AND grantee = 'service_role';
```

### 3. Verificar Foreign Keys
```sql
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'usuario_categorias_ativas'::regclass
AND contype = 'f';
```

## Teste de Funcionamento

### 1. Teste Manual
1. Execute os scripts SQL
2. Tente excluir um usuário não-admin
3. Verifique se o usuário foi removido da lista
4. Verifique se as categorias foram excluídas

### 2. Verificar no Supabase
1. Acesse o Supabase Dashboard
2. Vá para Table Editor
3. Verifique a tabela `usuarios`
4. Verifique a tabela `usuario_categorias_ativas`
5. Confirme se os registros foram removidos

### 3. Verificar Auth
1. Vá para Authentication > Users
2. Verifique se o usuário foi removido
3. Confirme que não há usuários órfãos

## Próximos Passos

1. **Execute o script de diagnóstico** para identificar problemas específicos
2. **Execute o script de correção** para resolver problemas de permissões
3. **Teste a exclusão** de um usuário não-admin
4. **Verifique os logs** para confirmar que funcionou
5. **Teste novamente** se necessário

## Contato para Suporte

Se o problema persistir após executar todas as soluções, verifique:
- Os logs detalhados da API no Supabase
- Os logs no console do navegador
- Os resultados dos scripts de diagnóstico
- Se há erros específicos sendo reportados
- Se as políticas RLS foram aplicadas corretamente 