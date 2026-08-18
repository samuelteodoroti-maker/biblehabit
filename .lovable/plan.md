# Bible Habit: Manutenção Corretiva e Hardening

Este plano detalha as correções necessárias para resolver o erro fatal na rota de estatísticas, completar funcionalidades de histórico, corrigir bugs no registro de leitura e fortalecer a segurança administrativa.

## 1. Correção Urgente: Rota `/statistics`
- **Problema:** Erro React #310 devido a hooks condicionais.
- **Solução:**
  - Mover todos os `useMemo` e `useQuery` para o nível superior do componente `StatisticsPage`.
  - Calcular todos os dados derivados (mensal, testamentário, divisões) antes de qualquer retorno condicional.
  - Ativar `react-hooks/rules-of-hooks` no ESLint (se aplicável localmente).

## 2. Estatísticas e Histórico Completos
- **Funcionalidades:**
  - Implementar gráfico de 12 meses usando `recentLogs`.
  - Calcular "Livros Concluídos" comparando capítulos lidos vs capítulos totais (66 livros).
  - Implementar lógica de ofensiva (streak) atual e máxima.
  - Adicionar filtros e busca no histórico (Data, Livro, Testamento, Divisão).
  - Ativar o botão "Ver histórico completo" com paginação.

## 3. Correção do Registro Retroativo (Calendário)
- **Problema:** Modal de registro não diferencia data selecionada de data atual.
- **Solução:**
  - Ajustar `LogReadingModal.tsx` para usar `initialDate` prop.
  - Garantir que `endVerse` inicie em 1.
  - Validar atomicamente capítulos e versículos (não permitir cap 0, versículos negativos ou acima do limite).
  - Implementar RPC `register_reading_atomic` para garantir atomicidade entre log, passagens e progresso do plano.
  - Garantir atualização instantânea do cache via TanStack Query após salvar.

## 4. Sugestões de Leitura
- **Funcionalidade:** Adicionar card de sugestão na Home quando não houver plano ativo.
- **Regras:** Sugestão determinística por dia, equilibrada entre Antigo/Novo Testamento.

## 5. Novidades e PDFs
- **Problema:** Rota `/updates/:slug` quebrada e downloads de PDF inoperantes.
- **Solução:**
  - Corrigir hierarquia de rotas em `src/routes/updates.tsx` e `src/routes/updates.$slug.tsx`.
  - Corrigir lógica de download de PDF garantindo limpeza de Object URL.
  - Melhorar acessibilidade (ARIA labels nos botões de PDF e inputs).

## 6. Área Administrativa Segura
- **Privilégios:** Configurar `super_admin` exclusivo para `samuelteodoro.ti@gmail.com` via migration.
- **Segurança:** 
  - Validar MFA (aal2) em todas as rotas e funções `/admin`.
  - Corrigir rotas administratvas: `/admin/errors` e `/admin/updates`.
  - Garantir que usuários comuns recebam redirecionamento ou erro 403 padronizado.

## Detalhes Técnicos

### Banco de Dados (Migrations)
- **`20240819_system_errors.sql`**: Criação da tabela `system_errors` para logs de erros administrativos.
- **`20240819_super_admin.sql`**: Atribuição segura de `super_admin` para o e-mail solicitado.
- **`20240819_reading_atomic.sql`**: Função RPC para salvamento transacional de leituras.

### Arquivos Impactados
- `src/routes/statistics.tsx`: Redesign da lógica de hooks.
- `src/hooks/useReadingData.ts`: Expansão da busca de logs (de 365 para histórico completo paginado).
- `src/components/LogReadingModal.tsx`: Validações e integração com RPC.
- `src/routes/updates.tsx` / `updates.$slug.tsx`: Correção de layout e rotas.
- `src/lib/pdf-generator.ts`: Correção do fluxo de download.
