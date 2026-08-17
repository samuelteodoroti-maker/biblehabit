# Release Workflow - Bible Habit

Este documento descreve o processo obrigatório para a publicação de novas versões do aplicativo Bible Habit.

## Processo de Lançamento

1. **Implementação**: Realizar as alterações de código (funcionalidades, correções, melhorias).
2. **Testes**: Verificar a estabilidade, responsividade e acessibilidade.
3. **Versão**: Definir o novo número da versão (ex: `1.3.1`).
4. **CHANGELOG.md**: Atualizar o arquivo local com os detalhes técnicos da versão.
5. **Nota de Atualização**: 
   - Acessar a área administrativa (ou via banco de dados).
   - Criar uma nova entrada em `app_updates` com status `draft`.
   - Gerar o slug e preencher todos os campos (highlights, improvements, fixes, etc.).
6. **Revisão de PDF**: Visualizar a prévia do PDF para garantir que a formatação está correta.
7. **Publicação da Nota**: Alterar o status para `published` e definir a `published_at`.
8. **Publicação do App**: Realizar o deploy da nova versão do aplicativo.
9. **Validação**:
   - Confirmar que a nota está visível em `/updates`.
   - Confirmar que o aviso de "Novo" aparece para os usuários.
   - Testar o link do WhatsApp na nova nota.

---
*Nota: Nenhuma alteração deve ser publicada sem o registro correspondente no sistema de atualizações.*
