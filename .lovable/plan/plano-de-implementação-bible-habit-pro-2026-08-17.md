# Plano de Implementação - Bible Habit Pro

Implementação de check-in retroativo, referências estruturadas, estatísticas avançadas e catálogo bíblico canônico.

## 1. Banco de Dados e Migrações
- **Tabela `reading_passages`**: Criar para armazenar as referências (livro, cap inicial/final, vers inicial/final).
- **Alteração `reading_logs`**: Adicionar `duration_minutes` e garantir que `reading_date` seja a base de cálculo.
- **RLS**: Configurar políticas para as novas tabelas/colunas.
- **Triggers**: Atualizar o cálculo de ofensiva (`streak`) para considerar `reading_date`.

## 2. Catálogo Bíblico Canônico
- Centralizar os 66 livros em `src/lib/bibleBooks.ts` com metadados (capítulos, versículos, testamento, divisão).

## 3. Frontend - Componentes e Hooks
- **`useReadingData`**: Evoluir para suportar o novo histórico e estatísticas.
- **`LogReadingModal`**: Reformular completamente para o novo formulário estruturado com suporte a múltiplas passagens e datas passadas.
- **`ReadingCalendar`**: Tornar os dias clicáveis para check-in retroativo.

## 4. Novas Telas e Funcionalidades
- **Sugestões**: Implementar lógica de sugestão "Continue de onde parou" na Home.
- **Estatísticas**: Criar nova rota `/statistics` com gráficos Recharts (progresso mensal, distribuição, etc).
- **Histórico**: Adicionar visualização detalhada de todo o passado de leitura.

## 5. Polimento e Correções
- **Ranking**: Garantir empate (1, 1, 3) para todos os empatados.
- **Skeletons**: Sincronizar estados de carregamento em todas as novas áreas.
- **Responsividade**: Validar em dispositivos móveis e desktop.

## Detalhes Técnicos
- Migração via `supabase--migration`.
- Gráficos usando `recharts`.
- Ícones via `lucide-react`.
- Validações com `zod`.
