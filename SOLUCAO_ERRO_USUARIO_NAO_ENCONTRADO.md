# Solução para Erro "Usuário não encontrado" na Exclusão

## Problema Identificado

O erro "usuário não encontrado" está ocorrendo mesmo quando o usuário existe no Supabase. Isso pode ser causado por:

1. **Problemas de permissões RLS (Row Level Security)**
2. **Políticas de acesso muito restritivas**
3. **Problemas de encoding ou caracteres especiais no email**
4. **Service role sem permissões adequadas**

## Soluções Implementadas

### 1. API Melhorada (`/api/admin/delete-user/route.ts`)

A API foi melhorada com:
- **Logs detalhados** para identificar onde exatamente o problema ocorre
- **Verificação de acesso** à tabela antes de buscar usuários específicos
- **Busca alternativa** sem `.single()` para verificar se há resultados
- **Proteção contra exclusão de admins**
- **Verificação de categorias ativas** antes da exclusão

### 2. Scripts de Diagnóstico

#### `debug_exclusao_usuarios.sql`
Execute este script para diagnosticar:
- Estrutura da tabela `usuarios`
- Políticas RLS ativas
- Permissões do service_role
- Triggers que possam interferir
- Foreign keys que impedem exclusão

#### `corrigir_permissoes_exclusao.sql`
Execute este script para corrigir:
- Garantir permissões completas para o service_role
- Desabilitar RLS temporariamente se necessário
- Criar políticas específicas para o service_role
- Reabilitar RLS com políticas corretas

## Passos para Resolver

### Passo 1: Executar Diagnóstico
```sql
-- Execute o script debug_exclusao_usuarios.sql no SQL Editor do Supabase
```

### Passo 2: Verificar Logs da API
1. Abra o console do navegador (F12)
2. Tente excluir um usuário
3. Verifique os logs detalhados no console
4. Identifique em qual etapa o erro ocorre

### Passo 3: Corrigir Permissões
```sql
-- Execute o script corrigir_permissoes_exclusao.sql no SQL Editor do Supabase
```

### Passo 4: Testar Novamente
1. Tente excluir o usuário novamente
2. Verifique se os logs mostram sucesso
3. Confirme que o usuário foi removido do Supabase

## Possíveis Causas Específicas

### 1. RLS Bloqueando Acesso
Se RLS estiver habilitado sem políticas adequadas para o service_role:
```sql
-- Solução: Desabilitar RLS temporariamente
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
```

### 2. Políticas Muito Restritivas
Se as políticas RLS não permitirem acesso do service_role:
```sql
-- Solução: Criar política específica
CREATE POLICY "service_role_access_usuarios" ON usuarios
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

### 3. Problemas de Encoding
Se houver caracteres especiais no email:
```sql
-- Verificar encoding
SELECT email, length(email), ascii(substring(email from 1 for 1))
FROM usuarios WHERE email LIKE '%@%';
```

## Logs Esperados

Com a API melhorada, você deve ver logs como:
```
API delete-user chamada com email: usuario@exemplo.com
Verificando acesso à tabela usuarios...
Acesso à tabela usuarios OK. Usuários encontrados: 5
Buscando usuário específico com email: usuario@exemplo.com
Usuário encontrado: {user_id: "...", nome: "...", email: "...", is_admin: false}
Verificando categorias ativas do usuário...
Categorias ativas encontradas: 3
Excluindo categorias ativas do usuário...
Categorias excluídas com sucesso
Excluindo usuário da tabela usuarios...
Usuário excluído da tabela usuarios com sucesso
Excluindo usuário do auth...
Usuário excluído do auth com sucesso
```

## Próximos Passos

1. **Execute os scripts SQL** na ordem indicada
2. **Teste a exclusão** de um usuário
3. **Verifique os logs** no console do navegador
4. **Se ainda houver problemas**, compartilhe os logs detalhados

## Contato

Se o problema persistir após seguir estes passos, compartilhe:
- Os logs completos do console
- O resultado dos scripts SQL de diagnóstico
- O email do usuário que está tentando excluir 