# Plano de Ajuste de Progresso e Estatísticas (Bible Habit)

Refatoração completa do sistema de cálculo de progresso bíblico para utilizar versículos únicos concluídos em vez de capítulos, e atualização das divisões do Novo Testamento.

## 1. Fonte Canônica de Dados
- Criar `src/lib/bible-canon.ts` contendo o dataset completo de 66 livros, 1.189 capítulos e 31.102 versículos (versificação protestante).
- Definir as divisões do Novo Testamento conforme solicitado: Evangelhos, Histórico, Cartas Paulinas, Cartas Gerais e Revelação.
- Manter as divisões do Antigo Testamento.

## 2. Lógica Centralizada de Cálculo
- Criar `src/lib/bible-calculations.ts` com a função `calculateBibleCoverage(readingPassages)`.
- **Regra de Intervalos:** Implementar lógica para mesclar intervalos sobrepostos de versículos.
  - Ex: Gênesis 1:1-10 + Gênesis 1:5-15 = 15 versículos únicos.
- **Diferenciação:** Separar "Versículos lidos" (atividade total) de "Versículos únicos concluídos" (cobertura bíblica).

## 3. Integração no Hook e Telas
- **useReadingData.ts:** Atualizar para buscar todos os logs sem limite e injetar o resultado de `calculateBibleCoverage`.
- **statistics.tsx:**
  - Substituir "NT" pelas 5 novas divisões.
  - Exibir barra de progresso baseada em versículos únicos com duas casas decimais (ou "< 0,01%").
  - Permitir expansão por divisão para ver detalhamento por livro.
- **progress.tsx:**
  - Diferenciar "Progresso bíblico" de "Progresso do plano".
  - Atualizar barras de progresso para refletir os novos cálculos.

## 4. Testes e Validação
- Validar totais: 31.102 versículos (AT: 23.145, NT: 7.957).
- Caso de teste: Gênesis 1:1-3 (3 de 1.533 versículos) = 0,20%.
- Garantir que a porcentagem nunca ultrapasse 100%.

## Detalhes Técnicos
- O cálculo será feito no cliente para agilidade, mas otimizado para não recalcular desnecessariamente (memoization).
- Se o volume de dados do usuário for excessivo, uma RPC será considerada futuramente.
