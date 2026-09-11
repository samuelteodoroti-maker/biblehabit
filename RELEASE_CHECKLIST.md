# Release checklist — Bible Habit

Antes de **qualquer** publicação, cumpra todos os itens abaixo.

1. **Versão atualizada** — defina a nova versão em `src/data/releaseNotes.ts`
   (a primeira entrada de `RELEASE_NOTES` é sempre a versão atual e alimenta
   `APP_VERSION`). Use versionamento semântico:
   - correções: `1.0.1`
   - novas funcionalidades compatíveis: `1.1.0`
   - grandes mudanças: `2.0.0`
2. **Notas reais registradas** — descreva em `src/data/releaseNotes.ts` apenas
   mudanças efetivamente implementadas (recursos, melhorias, correções e
   segurança). Não invente funcionalidades e não apague versões anteriores.
3. **Data conferida** — o campo `date` deve estar no formato `YYYY-MM-DD` e
   corresponder à data real da publicação.
4. **Testes executados** — `bunx vitest run` sem falhas, além de typecheck e
   build.
5. **Página verificada** — abra `/novidades` e confirme: histórico com a versão
   mais recente no topo, aviso "O que há de novo" aparecendo uma única vez,
   indicador "Novo" desaparecendo após a visualização, layout responsivo em
   tema claro e escuro, navegação por teclado e console sem erros.
6. **Nada sensível nas notas** — nenhuma chave, credencial, dado pessoal,
   detalhe explorável de vulnerabilidade ou informação interna de
   infraestrutura pode aparecer nas notas.

## Regra permanente

Toda alteração visível para o usuário ou correção relevante deve atualizar
`src/data/releaseNotes.ts` antes da publicação. Mudanças futuras nunca devem
apagar o histórico anterior.
