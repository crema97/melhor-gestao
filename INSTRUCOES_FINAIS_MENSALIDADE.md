# 🎯 Instruções Finais - Sistema de Mensalidades

## 📊 **Estrutura Atual da Tabela `usuarios`:**

✅ **Campos existentes:**
- `id` (uuid, primary key)
- `user_id` (uuid)
- `nome` (text)
- `email` (text)
- `nome_negocio` (text)
- `tipo_negocio_id` (uuid)
- `data_cadastro` (timestamp with time zone) ← **Já existe!**
- `is_admin` (boolean)

❌ **Campos que precisam ser adicionados:**
- `data_vencimento` (date)
- `status_pagamento` (varchar)
- `plano` (varchar)

## 🚀 **Passo 1: Executar o SQL para Adicionar Campos Faltantes**

Execute este SQL no **Supabase SQL Editor**:

```sql
-- Adicionar apenas os campos que faltam para o sistema de mensalidades
-- Baseado na estrutura atual da tabela usuarios

-- Adicionar data_vencimento (não existe)
ALTER TABLE usuarios ADD COLUMN data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month');

-- Adicionar status_pagamento (não existe)
ALTER TABLE usuarios ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'ativo';

-- Adicionar plano (não existe)
ALTER TABLE usuarios ADD COLUMN plano VARCHAR(20) DEFAULT 'mensal';

-- Criar índices para otimização
CREATE INDEX idx_usuarios_vencimento ON usuarios(data_vencimento);
CREATE INDEX idx_usuarios_status ON usuarios(status_pagamento);

-- Adicionar comentários para documentação
COMMENT ON COLUMN usuarios.data_vencimento IS 'Data de vencimento da próxima mensalidade';
COMMENT ON COLUMN usuarios.status_pagamento IS 'Status do pagamento: ativo, pendente, cancelado';
COMMENT ON COLUMN usuarios.plano IS 'Tipo de plano: mensal, trimestral, anual';
```

## ✅ **O que foi ajustado no código:**

### 🔧 **API de Criação de Usuário:**
- ✅ **Removido** campo `data_cadastro` (já tem default `now()`)
- ✅ **Mantido** cálculo automático de `data_vencimento`
- ✅ **Adicionado** campos `status_pagamento` e `plano`

### 🎨 **Interface de Admin:**
- ✅ **Função `formatarData`** melhorada para lidar com timestamps
- ✅ **Tratamento de erro** para datas inválidas
- ✅ **Compatibilidade** com estrutura atual

## 🎯 **Funcionalidades Prontas:**

### 📊 **Dashboard com Estatísticas:**
- **Total de Clientes** - Contagem geral
- **Clientes Ativos** - Apenas com status 'ativo'
- **Vencendo em 7 dias** - Alertas de vencimento próximo

### 📝 **Formulário de Cadastro:**
- **Seleção de plano** (Mensal, Trimestral, Anual)
- **Cálculo automático** de vencimento
- **Feedback** com data de vencimento

### 👥 **Cards de Cliente:**
- **Informações completas** do negócio
- **Data de cadastro** (usando campo existente)
- **Data de vencimento** (novo campo)
- **Status de pagamento** com cores
- **Indicador "VENCIDO"** para atrasos

## 🚀 **Para Testar:**

1. **Execute o SQL** acima no Supabase
2. **Acesse a página de admin** (`/admin`)
3. **Cadastre um novo cliente** com plano escolhido
4. **Verifique** se as informações aparecem corretamente
5. **Monitore** o dashboard para estatísticas

## 💡 **Dicas de Uso:**

### **Para Atualizar Status de Pagamento:**
```sql
-- Marcar como pago e renovar por 1 mês
UPDATE usuarios 
SET status_pagamento = 'ativo', 
    data_vencimento = data_vencimento + INTERVAL '1 month'
WHERE email = 'cliente@email.com';
```

### **Para Ver Clientes Vencidos:**
```sql
-- Listar clientes com mensalidade vencida
SELECT nome, email, data_vencimento, status_pagamento
FROM usuarios 
WHERE data_vencimento < CURRENT_DATE 
AND status_pagamento = 'ativo';
```

## 🎉 **Sistema Completo!**

Agora você tem um sistema de mensalidades totalmente funcional que:
- ✅ **Respeita** a estrutura atual da tabela
- ✅ **Adiciona** apenas os campos necessários
- ✅ **Funciona** imediatamente após executar o SQL
- ✅ **Fornece** controle total sobre pagamentos

**Execute o SQL e teste o sistema!** 🚀 