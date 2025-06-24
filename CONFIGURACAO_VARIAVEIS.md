# 🔧 Configuração das Variáveis de Ambiente

## O que são Variáveis de Ambiente?

São como "senhas" e "endereços" que sua aplicação precisa para funcionar. Elas ficam guardadas de forma segura.

## Passo 1: Pegar as Configurações do Supabase

1. **Acesse o Supabase**: https://supabase.com
2. **Faça login** na sua conta
3. **Clique no seu projeto**
4. **Vá em Settings** (configurações)
5. **Clique em API**

Você verá algo assim:
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 2: Criar arquivo .env

Na pasta do seu projeto, crie um arquivo chamado `.env` com este conteúdo:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Substitua** os valores pelos seus do Supabase.

## Passo 3: Testar Localmente

```bash
npm run dev
```

Se funcionar, está tudo certo!

## ⚠️ IMPORTANTE

- **NUNCA** compartilhe essas chaves
- **NUNCA** coloque no GitHub
- O arquivo `.env` deve estar no `.gitignore` 