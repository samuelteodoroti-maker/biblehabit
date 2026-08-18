INSERT INTO app_updates (
  version, 
  slug, 
  title, 
  summary, 
  status, 
  categories, 
  published_at, 
  highlights, 
  improvements, 
  fixes, 
  accessibility_changes,
  content
) VALUES (
  '1.5.0',
  'refatoracao-precisao-estatisticas',
  'Precisão Total nas Estatísticas e Novo Motor de Cálculo',
  'Refatoramos todo o sistema de progresso para utilizar cálculos baseados em versículos únicos, garantindo 100% de precisão na sua jornada bíblica.',
  'published',
  ARRAY['Melhoria', 'Desempenho', 'Manutenção'],
  NOW(),
  ARRAY[
    'Novo motor de cálculo baseado em versículos únicos (canon de 31.102 versículos)',
    'Divisões detalhadas do Novo Testamento (Evangelhos, Histórico, Cartas, etc)',
    'Sistema de registro atômico para maior integridade de dados'
  ],
  ARRAY[
    'Otimização profunda de performance com TanStack Query v5',
    'Interface de estatísticas agora permite expandir divisões e livros',
    'Cálculo inteligente de intervalos de leitura (sem duplicidade)',
    'Diferenciação clara entre progresso de planos e cobertura bíblica'
  ],
  ARRAY[
    'Correção do erro de hooks #310 na página de estatísticas',
    'Eliminação de contagens duplicadas em leituras sobrepostas',
    'Ajuste de timezone no registro de leituras retroativas',
    'Estabilização da navegação administrativa e rotas protegidas'
  ],
  ARRAY[
    'Suporte a labels ARIA para leitores de tela em gráficos',
    'Melhoria no contraste de elementos "Pure Black"',
    'Ajuste de áreas de toque em modais e calendários'
  ],
  'Esta atualização representa um marco na precisão do Bible Habit. Substituímos o cálculo genérico por uma análise granular de versículos únicos, permitindo que você saiba exatamente quanto da Palavra já percorreu.'
);