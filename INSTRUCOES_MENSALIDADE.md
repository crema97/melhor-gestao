# 📋 Instruções para Implementar Sistema de Mensalidades

## 🚀 **Passo 1: Verificar Estrutura Atual (Opcional)**

Se quiser ver quais campos já existem, execute primeiro:

```sql
-- Verificar a estrutura atual da tabela usuarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
```

## 🚀 **Passo 2: Executar o SQL Corrigido no Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o seguinte comando (este não dará erro se campos já existirem):

```sql
-- Adicionar campos para controle de mensalidade (apenas se não existirem)
DO $$ 
BEGIN
    -- Adicionar data_cadastro se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'data_cadastro') THEN
        ALTER TABLE usuarios ADD COLUMN data_cadastro DATE DEFAULT CURRENT_DATE;
    END IF;

    -- Adicionar data_vencimento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'data_vencimento') THEN
        ALTER TABLE usuarios ADD COLUMN data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month');
    END IF;

    -- Adicionar status_pagamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'status_pagamento') THEN
        ALTER TABLE usuarios ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'ativo';
    END IF;

    -- Adicionar plano se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'plano') THEN
        ALTER TABLE usuarios ADD COLUMN plano VARCHAR(20) DEFAULT 'mensal';
    END IF;

END $$;

-- Criar índices (apenas se não existirem)
DO $$
BEGIN
    -- Índice para vencimento
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_usuarios_vencimento') THEN
        CREATE INDEX idx_usuarios_vencimento ON usuarios(data_vencimento);
    END IF;

    -- Índice para status
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_usuarios_status') THEN
        CREATE INDEX idx_usuarios_status ON usuarios(status_pagamento);
    END IF;
END $$;

-- Atualizar comentários
COMMENT ON COLUMN usuarios.data_cadastro IS 'Data do primeiro cadastro do usuário';
COMMENT ON COLUMN usuarios.data_vencimento IS 'Data de vencimento da próxima mensalidade';
COMMENT ON COLUMN usuarios.status_pagamento IS 'Status do pagamento: ativo, pendente, cancelado';
COMMENT ON COLUMN usuarios.plano IS 'Tipo de plano: mensal, trimestral, anual';
```

## ✅ **O que foi implementado:**

### 📊 **Novos Campos na Tabela `usuarios`:**
- `data_cadastro` - Data do primeiro cadastro
- `data_vencimento` - Data de vencimento da mensalidade
- `status_pagamento` - Status: 'ativo', 'pendente', 'cancelado'
- `plano` - Tipo: 'mensal', 'trimestral', 'anual'

### 🎯 **Funcionalidades Adicionadas:**

#### **1. Formulário de Cadastro Melhorado**
- ✅ Seleção de plano (Mensal, Trimestral, Anual)
- ✅ Cálculo automático da data de vencimento
- ✅ Feedback com data de vencimento

#### **2. Dashboard com Estatísticas**
- ✅ **Total de Clientes** - Contagem geral
- ✅ **Clientes Ativos** - Apenas com status 'ativo'
- ✅ **Vencendo em 7 dias** - Alertas de vencimento próximo

#### **3. Cards de Cliente Expandidos**
- ✅ **Informações do Negócio** e **Plano**
- ✅ **Data de Cadastro** e **Data de Vencimento**
- ✅ **Status de Pagamento** com cores
- ✅ **Indicador "VENCIDO"** para mensalidades atrasadas

#### **4. Cálculo Automático de Vencimento**
- **Mensal**: +1 mês
- **Trimestral**: +3 meses  
- **Anual**: +1 ano

## 🔧 **Próximos Passos (Opcionais):**

### **Opção A: Sistema Simples (Atual)**
- ✅ Já está funcionando
- ✅ Controle básico eficiente
- ✅ Fácil de manter

### **Opção B: Sistema Avançado**
Se quiser expandir no futuro, pode criar:

1. **Tabela `assinaturas`** para histórico completo
2. **Tabela `pagamentos`** para controle financeiro
3. **API para renovar assinaturas**
4. **Sistema de notificações** de vencimento
5. **Relatórios financeiros** detalhados

## 💡 **Dicas de Uso:**

### **Para Gerenciar Mensalidades:**
1. **Cadastre clientes** com o plano desejado
2. **Monitore o dashboard** para vencimentos próximos
3. **Atualize status** manualmente quando receber pagamento
4. **Use o filtro "Vencendo em 7 dias"** para cobranças

### **Para Atualizar Status de Pagamento:**
```sql
-- Exemplo: Marcar como pago
UPDATE usuarios 
SET status_pagamento = 'ativo', 
    data_vencimento = data_vencimento + INTERVAL '1 month'
WHERE email = 'cliente@email.com';
```

## 🎉 **Sistema Pronto!**

Agora você tem controle total sobre as mensalidades dos seus clientes! O sistema é simples, eficiente e pode crescer conforme sua necessidade. 