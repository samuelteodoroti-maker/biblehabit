# Plano de Lançamento de Atualização (v1.5.0)

Este plano descreve o lançamento formal da versão 1.5.0 do Bible Habit, consolidando as recentes melhorias de precisão estatística e otimização de performance.

## Alterações Técnicas

### 1. Sistema de Versão
- Atualização da constante `APP_VERSION` para `1.5.0` em `src/lib/app-utils.ts`.

### 2. Banco de Dados
- Inserção de uma nova entrada na tabela `app_updates` detalhando as mudanças da v1.5.0.
- Categorias: Melhoria, Desempenho, Manutenção.
- Destaques: Novo motor de cálculo de versículos, divisões do Novo Testamento, correção de erros críticos.

### 3. Experiência do Usuário
- O banner de novidades na Home aparecerá automaticamente para os usuários (devido à mudança de versão no localStorage).
- Disponibilização do PDF detalhado de atualizações via rota `/updates/refatoracao-precisao-estatisticas`.

## Validação
- [x] Verificação da versão atual no banco.
- [x] Registro da nova versão no histórico de atualizações.
- [x] Sincronização da versão exibida no Admin.
- [x] Disponibilidade das notas para geração de PDF.
