# Instruções para Adicionar Novos Tipos de Negócio

## 📋 Passos para Implementação

### 1. Executar Scripts SQL no Supabase

#### Primeiro, execute o script principal:
```sql
-- Execute este script no SQL Editor do Supabase
-- Arquivo: adicionar_novos_negocios.sql

-- 1. Adicionar novos tipos de negócio
INSERT INTO tipos_negocio (nome) VALUES 
('Estética'),
('Salão de Beleza');

-- 2. Adicionar categorias de receita para ESTÉTICA
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Manicure Tradicional', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Pedicure Tradicional', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Esmaltação em Gel', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Alongamento de Unha em Gel', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Alongamento de Unha em Fibra de Vidro', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Manutenção de Alongamento', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Remoção de Alongamento', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Nail Art Simples', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Nail Art Efeitos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Venda de Produtos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true);

-- 3. Adicionar categorias de despesa para ESTÉTICA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Contas (água, luz, internet)', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Produtos de higiene', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Manutenção', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Estética'), true);
```

#### Depois, execute o script para Salão de Beleza:
```sql
-- Execute este script no SQL Editor do Supabase
-- Arquivo: adicionar_salao_beleza.sql

-- 1. Adicionar categorias de receita para SALÃO DE BELEZA
INSERT INTO categorias_receita (nome, tipo_negocio_id, ativo) VALUES
('Corte Feminino', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Corte Masculino', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Escova', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Pintura', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Mechas', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Hidratação', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Tratamento Capilar', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Penteado', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Manicure', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Pedicure', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Esmaltação', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Depilação', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Maquiagem', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Venda de Produtos', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true);

-- 2. Adicionar categorias de despesa para SALÃO DE BELEZA
INSERT INTO categorias_despesa (nome, tipo_negocio_id, ativo) VALUES
('Aluguel', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Contas (água, luz, internet)', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Produtos de higiene', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Equipamentos', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Manutenção', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Marketing/Publicidade', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Impostos', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Seguros', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Funcionários', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true),
('Outros', (SELECT id FROM tipos_negocio WHERE nome = 'Salão de Beleza'), true);
```

### 2. Verificar os IDs dos Tipos de Negócio

Execute este script para obter os IDs corretos:
```sql
-- Arquivo: verificar_ids_negocios.sql
SELECT id, nome FROM tipos_negocio ORDER BY nome;
```

### 3. Atualizar o Arquivo de Login

Após obter os IDs, atualize o arquivo `src/app/login/page.tsx` adicionando os novos casos no switch:

```typescript
// Adicione estes casos no switch do arquivo login/page.tsx
// Substitua os IDs pelos valores reais obtidos no passo anterior

case 'ID_DA_ESTETICA': // Substitua pelo ID real
  console.log('Redirecionando para /dashboard/estetica')
  router.push('/dashboard/estetica')
  break
case 'ID_DO_SALAO_BELEZA': // Substitua pelo ID real
  console.log('Redirecionando para /dashboard/salao-beleza')
  router.push('/dashboard/salao-beleza')
  break
```

### 4. Estrutura de Arquivos Criada

Os seguintes arquivos foram criados:

#### Para Estética:
- `src/app/dashboard/estetica/page.tsx` - Dashboard principal
- `src/app/dashboard/estetica/receitas/page.tsx` - Página de receitas
- `src/app/dashboard/estetica/despesas/page.tsx` - Página de despesas
- `src/app/dashboard/estetica/anotacoes/page.tsx` - Página de anotações

#### Para Salão de Beleza:
- `src/app/dashboard/salao-beleza/page.tsx` - Dashboard principal
- `src/app/dashboard/salao-beleza/receitas/page.tsx` - Página de receitas
- `src/app/dashboard/salao-beleza/despesas/page.tsx` - Página de despesas
- `src/app/dashboard/salao-beleza/anotacoes/page.tsx` - Página de anotações

### 5. Funcionalidades Implementadas

✅ **Dashboard Principal:**
- Cards de estatísticas (receitas, despesas, lucro)
- Gráficos interativos (barras e linhas)
- Gráfico de pizza para formas de pagamento
- Seletor de período
- Cards de navegação

✅ **Página de Receitas:**
- Lista de receitas com filtro por período
- Formulário para adicionar/editar receitas
- Gráficos de receitas mensais e diárias
- Categorias específicas para cada tipo de negócio

✅ **Página de Despesas:**
- Lista de despesas com filtro por período
- Formulário para adicionar/editar despesas
- Categorias padrão para cada tipo de negócio

✅ **Página de Anotações:**
- Lista de anotações em grid
- Formulário para adicionar/editar anotações
- Interface moderna e responsiva

### 6. Categorias de Receita Implementadas

#### Estética:
- Manicure Tradicional
- Pedicure Tradicional
- Esmaltação em Gel
- Alongamento de Unha em Gel
- Alongamento de Unha em Fibra de Vidro
- Manutenção de Alongamento
- Remoção de Alongamento
- Nail Art Simples
- Nail Art Efeitos
- Venda de Produtos

#### Salão de Beleza:
- Corte Feminino
- Corte Masculino
- Escova
- Pintura
- Mechas
- Hidratação
- Tratamento Capilar
- Penteado
- Manicure
- Pedicure
- Esmaltação
- Depilação
- Maquiagem
- Venda de Produtos

### 7. Teste a Implementação

1. Execute os scripts SQL no Supabase
2. Atualize o arquivo de login com os IDs corretos
3. Crie um novo usuário no painel admin selecionando "Estética" ou "Salão de Beleza"
4. Faça login com o novo usuário
5. Teste todas as funcionalidades (receitas, despesas, anotações)

### 8. Próximos Passos

Após implementar a Estética, você pode:
1. Me enviar os serviços específicos para o Salão de Beleza
2. Criar as páginas do Salão de Beleza seguindo o mesmo padrão
3. Personalizar cores ou estilos se necessário

## 🎯 Resultado Final

Após seguir estas instruções, você terá:
- ✅ 2 novos tipos de negócio funcionais
- ✅ Dashboards completos com gráficos interativos
- ✅ Sistema de receitas e despesas específico para cada negócio
- ✅ Categorias personalizadas para cada tipo de serviço
- ✅ Interface moderna e responsiva
- ✅ Integração completa com o sistema existente 