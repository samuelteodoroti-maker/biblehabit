# Plano de Otimização Bible Habit

## 1. Otimização de Carregamento (Performance)
- Implementar `React.lazy` para as rotas pesadas (`/statistics`, `/groups`, `/admin`).
- Adicionar `prefetch` para rotas principais (Início, Progresso).
- Otimizar o tamanho do bundle com code splitting.

## 2. Otimização de Integração Supabase
- Implementar cache local para dados de leitura usando `react-query` com `staleTime` otimizado.
- Remover chamadas desnecessárias no `useReadingData.ts` (Batch requests).
- Implementar paginação real nas listagens longas (`reading_logs`).

## 3. Otimização UI/UX e Responsividade
- Otimizar animações do `BibleCard` e `AppShell` para rodar em 60 FPS.
- Refinar as transições de rota.
- Corrigir a hierarquia de carregamento (Skeletons mais inteligentes).

## 4. Otimização de Assets e CSS
- Revisar `styles.css` para remover redundâncias.
- Adicionar `loading="lazy"` em todas as imagens (se houver).
- Garantir que fontes externas carreguem de forma não bloqueante.
