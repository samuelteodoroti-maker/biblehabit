# Plano de Implementação: Notas de Atualização e Suporte WhatsApp

Implementação de um sistema completo para gerenciamento de notas de atualização (changelog) e suporte via WhatsApp, incluindo backend, frontend e geração de PDF.

## Banco de Dados
- Criar tabela `app_updates` com suporte a RLS.
- Implementar políticas para leitura pública de notas publicadas e escrita restrita a administradores.
- Criar função e trigger para atualização automática de `updated_at`.
- Verificar/Implementar papel de administrador na tabela `user_roles` (se necessário).

## Backend (Server Functions)
- Criar funções para CRUD de atualizações (restritas a admin).
- Criar função para busca e listagem de atualizações publicadas.
- Implementar rota `/api/public/updates/pdf` para geração de PDF usando `jspdf` ou similar.

## Frontend
- **Página de Suporte (`/support`)**: Central de ajuda com link direto para o WhatsApp oficial.
- **Página de Atualizações (`/updates`)**: Listagem cronológica com filtros, busca e destaques.
- **Página de Detalhe da Atualização (`/updates/$slug`)**: Conteúdo completo da versão.
- **Área Administrativa (`/admin/updates`)**: Dashboard para gestão das notas.
- **Componentes**:
  - `UpdateNotice`: Aviso de nova versão (persistido no perfil do usuário ou localStorage).
  - `UpdatePDFButton`: Componente para visualizar/baixar PDF.

## Integrações e Documentação
- Configurar link do WhatsApp: `https://wa.me/5521959331138` com mensagem dinâmica.
- Criar `CHANGELOG.md` e `RELEASE_WORKFLOW.md`.
- Migrar histórico existente de versões do projeto.

## Detalhes Técnicos
- **Design**: Manter o tema *Midnight Indigo* com *glassmorphism*.
- **Acessibilidade**: Foco em navegação por teclado e suporte a leitores de tela.
- **Segurança**: Validação de permissões no servidor, não apenas na UI.
- **PDF**: Gerar via `jspdf` com suporte a UTF-8 e quebra de páginas.
