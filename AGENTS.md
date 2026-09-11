<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Notas de atualização (regra permanente)

- `src/data/releaseNotes.ts` é a **única** fonte oficial das notas de versão. A
  página pública `/novidades` monta o histórico automaticamente a partir dela.
- Toda alteração visível para o usuário ou correção relevante deve atualizar
  esse arquivo **antes** da publicação, seguindo versionamento semântico.
- Nunca apague nem reescreva versões anteriores: o histórico é acumulativo.
- Nunca inclua chaves, dados pessoais, detalhes exploráveis de vulnerabilidades
  ou informações internas nas notas.
- Antes de publicar, siga `RELEASE_CHECKLIST.md`.
