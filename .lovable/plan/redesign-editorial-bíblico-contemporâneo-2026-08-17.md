# Redesign — Editorial Bíblico Contemporâneo

Implementação de uma nova identidade visual para o Bible Habit, focada em uma experiência editorial, moderna e acolhedora.

## Mudanças Visuais
- **Paleta de Cores**: Introdução de tokens semânticos e suporte aprimorado a temas claro e escuro.
- **Tipografia**: Adição de fontes serifadas (Lora/Libre Baskerville) para títulos editoriais, mantendo sans-serif para interface.
- **Componentes**: Redesign completo de Cards, Botões e Inputs com foco em profundidade suave e glassmorphism refinado.
- **Navegação**: Otimização da barra de navegação para mobile (max 5 itens) e introdução de layout desktop (Sidebar/Header).

## Estrutura Técnica
- Centralização de tokens CSS no `src/styles.css`.
- Novos componentes estruturais: `DesktopSidebar`, `BibleCard`, `ReadingSuggestionCard`.
- Refatoração de rotas principais para suportar layouts responsivos avançados.

## User Experience (UX)
- Linguagem mais acolhedora ("Constância na Palavra", "Comunidade", "Jornada Atual").
- Microinterações e animações discretas para feedback de progresso.
- Melhorias drásticas na visualização de dados e estatísticas.

## Validação
- Testes de acessibilidade (WCAG AA).
- Verificação de responsividade em múltiplos breakpoints (360px a 1440px).
- Preservação integral de todas as funcionalidades e dados existentes.
