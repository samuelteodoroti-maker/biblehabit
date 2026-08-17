INSERT INTO public.app_updates (
  slug, 
  title, 
  summary, 
  version, 
  status, 
  categories, 
  published_at, 
  highlights, 
  improvements, 
  fixes, 
  accessibility_changes
) VALUES (
  'melhorias-responsividade-v1-4', 
  'Melhorias de Responsividade e Legibilidade', 
  'Overhaul completo para garantir uma experiência perfeita em celular, tablet e desktop.', 
  '1.4.0', 
  'published', 
  ARRAY['Melhoria', 'Acessibilidade'], 
  NOW(), 
  ARRAY['Tipografia fluida com clamp() em todo o app', 'Grids adaptativos para celulares pequenos (320px)', 'Navegação inferior compatível com Safe Area (iOS/Android)'], 
  ARRAY['Aproveitamento de espaço em telas grandes', 'Gráficos estatísticos agora são totalmente responsivos', 'Cards de progresso e planos redesenhados'], 
  ARRAY['Correção de textos cortados em dispositivos móveis', 'Sobreposição de elementos no card Jornada Atual', 'Overflow horizontal em diversas páginas'], 
  ARRAY['Suporte a zoom de 200% sem perda de funcionalidade', 'Melhoria no contraste e áreas de toque']
);