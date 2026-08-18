# Plano de Ajuste de Progresso e Estatísticas (Bible Habit)

Refatoração completa do sistema de cálculo de progresso bíblico para utilizar versículos únicos concluídos em vez de capítulos, e atualização das divisões do Novo Testamento.

## 1. Fonte Canônica de Dados
- Criar `src/lib/bible-canon.ts` contendo o dataset completo de 66 livros, 1.189 capítulos e 31.102 versículos.
- Definir as divisões do Novo Testamento: Evangelhos, Histórico, Cartas Paulinas, Cartas Gerais e Revelação.
- Manter divisões do Antigo Testamento: Pentateuco, Históricos, Poéticos, Profetas Maiores, Profetas Menores.

## 2. Lógica Centralizada de Cálculo
- Criar `src/lib/bible-calculations.ts` com a função `calculateBibleCoverage`.
- Implementar mesclagem de intervalos de versículos para evitar contagem duplicada.
- Diferenciar "Versículos lidos" (atividade) de "Versículos únicos concluídos" (progresso).

## 3. Interface e Apresentação
- **Estatísticas:** Substituir "NT" pelas 5 divisões; adicionar detalhamento por livro; formatar como `%` com 2 casas decimais.
- **Progresso:** Separar progresso do plano (dias/passagens) do progresso bíblico (versículos).
- **Formatos:** Usar padrão brasileiro (`0,20%`, `1.533 versículos`).

## 4. Validação
- Teste obrigatório: Gênesis 1:1-3 = 3/1533 ≈ 0,20%.
- Totais: 66 livros, 1189 capítulos, 31102 versículos.
