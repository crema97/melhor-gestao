# Configuração das Variáveis de Ambiente

## Problema Identificado

O erro "Invalid API key" indica que as variáveis de ambiente do Supabase não estão configuradas corretamente.

## Solução

### 1. Criar arquivo .env.local

Crie um arquivo chamado `.env.local` na raiz do projeto (`melhor-gestao/.env.local`) com o seguinte conteúdo:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yfiygrsowmctczlnrdky.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 2. Obter as Chaves do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** > **API**
4. Copie as seguintes chaves:

#### Service Role Key
- Esta é a chave mais importante para a exclusão de usuários
- Está na seção "Project API keys" > "service_role"
- **NÃO é a anon key!**

#### Anon Key
- Está na seção "Project API keys" > "anon public"
- Usada para o cliente público

#### URL
- Está na seção "Project URL"
- Deve ser algo como: `https://yfiygrsowmctczlnrdky.supabase.co`

### 3. Exemplo Completo

```env
NEXT_PUBLIC_SUPABASE_URL=https://yfiygrsowmctczlnrdky.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaXlncnNvd21jdGN6bG5yZGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIyMTU3NCwiZXhwIjoyMDY1Nzk3NTc0fQ.3s4_ewJgBBZ2V3GqEvWzDxz-5mnPHTUmfnOB3kManJc
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Reiniciar o Servidor

Após criar o arquivo `.env.local`:

1. Pare o servidor de desenvolvimento (Ctrl+C)
2. Execute novamente: `npm run dev`
3. Teste a exclusão de usuários

### 5. Verificar se Funcionou

Se a configuração estiver correta, você deve ver logs como:

```
API delete-user chamada com email: usuario@exemplo.com
Verificando acesso à tabela usuarios...
Acesso à tabela usuarios OK. Usuários encontrados: X
```

### 6. Problemas Comuns

#### Erro "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis estão escritas corretamente
- Reinicie o servidor

#### Erro "Invalid API key"
- Verifique se está usando a **Service Role Key** (não a Anon Key)
- Verifique se a chave está completa e sem espaços extras

#### Erro "Invalid URL"
- Verifique se a URL do Supabase está correta
- Deve começar com `https://` e terminar com `.supabase.co`

### 7. Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env.local` no Git
- O arquivo já está no `.gitignore`
- Mantenha as chaves seguras e não as compartilhe

### 8. Deploy

Para deploy em produção (Vercel, Netlify, etc.):
1. Configure as mesmas variáveis de ambiente no painel do serviço
2. Use os mesmos nomes de variáveis
3. Certifique-se de usar a Service Role Key correta 