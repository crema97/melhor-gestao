# 🎯 **GUIA COMPLETO - RENOVAÇÃO DE PLANOS MANUAL**

## 📋 **Resumo das Opções Disponíveis**

Enquanto você não tem integração com Stripe, aqui estão **todas as formas** de renovar planos dos clientes:

---

## 🖥️ **OPÇÃO 1: PAINEL ADMIN (RECOMENDADO)**

### ✅ **Vantagens:**
- Interface visual amigável
- Não precisa conhecer SQL
- Atualização automática da lista
- Confirmação visual imediata

### 🔧 **Como usar:**
1. Acesse o **Painel Admin**
2. Na lista de clientes, procure o cliente com status **"VENCIDO"**
3. Clique no botão **"Renovar Plano"** (verde)
4. Escolha o novo plano (Mensal/Trimestral/Anual)
5. Clique em **"Renovar Plano"**

### 🎨 **Interface:**
- Botão aparece apenas para clientes vencidos
- Modal com informações do cliente
- Seleção de tipo de plano
- Confirmação visual da renovação

---

## 💾 **OPÇÃO 2: SQL DIRETO NO SUPABASE**

### ✅ **Vantagens:**
- Controle total
- Pode renovar múltiplos clientes
- Scripts prontos para usar

### 🔧 **Como usar:**
1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Use o script `renovar_plano_manual.sql`
4. Substitua `EMAIL_DO_CLIENTE` pelo email real
5. Execute o comando desejado

### 📝 **Comandos Principais:**

#### **Renovar por 1 mês:**
```sql
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE email = 'cliente@email.com';
```

#### **Renovar por 3 meses:**
```sql
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '3 months',
    status_pagamento = 'ativo'
WHERE email = 'cliente@email.com';
```

#### **Renovar por 1 ano:**
```sql
UPDATE usuarios 
SET 
    data_vencimento = data_vencimento + INTERVAL '1 year',
    status_pagamento = 'ativo'
WHERE email = 'cliente@email.com';
```

---

## 🔄 **OPÇÃO 3: API ENDPOINT (FUTURO)**

### 📋 **Plano para implementação:**
- Criar endpoint `/api/admin/renovar-plano`
- Integração com webhook do PIX
- Renovação automática após confirmação de pagamento

---

## 📊 **FLUXO DE TRABALHO RECOMENDADO**

### **1. Cliente paga via PIX**
- Cliente envia comprovante
- Você confirma o pagamento

### **2. Renovar plano (escolha uma opção):**

#### **Opção A - Painel Admin:**
```
Painel Admin → Lista de Clientes → Botão "Renovar Plano" → Confirmar
```

#### **Opção B - SQL:**
```
Supabase → SQL Editor → Executar script de renovação
```

### **3. Confirmação:**
- Cliente recebe acesso renovado
- Status muda para "ATIVO"
- Nova data de vencimento é definida

---

## 🎯 **CENÁRIOS ESPECÍFICOS**

### **Cenário 1: Cliente vencido paga mensalidade**
```sql
-- Renovar a partir de hoje
UPDATE usuarios 
SET 
    data_vencimento = CURRENT_DATE + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE email = 'cliente@email.com' AND data_vencimento < CURRENT_DATE;
```

### **Cenário 2: Cliente quer mudar de plano**
```sql
-- Mudar de mensal para trimestral
UPDATE usuarios 
SET 
    plano = 'trimestral',
    data_vencimento = CURRENT_DATE + INTERVAL '3 months',
    status_pagamento = 'ativo'
WHERE email = 'cliente@email.com';
```

### **Cenário 3: Renovar múltiplos clientes**
```sql
-- Renovar todos os vencidos por 1 mês
UPDATE usuarios 
SET 
    data_vencimento = CURRENT_DATE + INTERVAL '1 month',
    status_pagamento = 'ativo'
WHERE data_vencimento < CURRENT_DATE;
```

---

## 🔍 **VERIFICAÇÕES IMPORTANTES**

### **Antes de renovar:**
```sql
-- Verificar dados do cliente
SELECT 
    nome,
    email,
    plano,
    data_vencimento,
    status_pagamento
FROM usuarios 
WHERE email = 'cliente@email.com';
```

### **Após renovar:**
```sql
-- Confirmar renovação
SELECT 
    nome,
    plano,
    data_vencimento,
    CASE 
        WHEN data_vencimento < CURRENT_DATE THEN 'VENCIDO'
        ELSE 'ATIVO'
    END as status_vencimento
FROM usuarios 
WHERE email = 'cliente@email.com';
```

---

## ⚠️ **DICAS IMPORTANTES**

### **1. Sempre verifique antes de renovar**
- Confirme o email do cliente
- Verifique o plano atual
- Confirme o valor pago

### **2. Use o Painel Admin para clientes individuais**
- Mais seguro
- Interface amigável
- Menos chance de erro

### **3. Use SQL para operações em lote**
- Múltiplos clientes
- Renovações programadas
- Relatórios

### **4. Mantenha registro dos pagamentos**
- Comprovantes de PIX
- Data de renovação
- Valor pago

---

## 🚀 **PRÓXIMOS PASSOS**

### **Curto prazo:**
- ✅ Painel Admin com renovação manual
- ✅ Scripts SQL prontos
- 🔄 Testar funcionalidade

### **Médio prazo:**
- 🔄 Integração com PIX
- 🔄 Webhook automático
- 🔄 Notificações de vencimento

### **Longo prazo:**
- 🔄 Integração completa com Stripe
- 🔄 Pagamentos automáticos
- 🔄 Sistema de assinaturas

---

## 📞 **SUPORTE**

Se tiver dúvidas sobre renovação de planos:

1. **Use o Painel Admin** para renovações simples
2. **Consulte este guia** para comandos SQL
3. **Teste primeiro** com um cliente de teste
4. **Mantenha backup** antes de operações em lote

---

**🎉 Agora você tem todas as ferramentas para gerenciar renovações manualmente!** 