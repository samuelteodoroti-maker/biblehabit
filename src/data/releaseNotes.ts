/**
 * Fonte oficial e única das notas de atualização do Bible Habit.
 *
 * Regras permanentes:
 * - Toda alteração visível para o usuário ou correção relevante deve ser
 *   registrada aqui ANTES da publicação (ver RELEASE_CHECKLIST.md).
 * - Nunca apague versões anteriores: o histórico é acumulativo.
 * - Nunca inclua chaves, dados pessoais, detalhes exploráveis de segurança
 *   ou informações internas de infraestrutura.
 * - Versionamento semântico: correções `x.y.Z`, novidades compatíveis `x.Y.0`,
 *   grandes mudanças `X.0.0`.
 */

export type ReleaseNote = {
  /** Versão semântica, ex.: "1.6.0" */
  version: string;
  /** Data de publicação no formato YYYY-MM-DD */
  date: string;
  /** Título curto da versão */
  title: string;
  /** Resumo em uma ou duas frases */
  summary: string;
  /** Novos recursos */
  features?: string[];
  /** Melhorias em recursos existentes */
  improvements?: string[];
  /** Correções de problemas */
  fixes?: string[];
  /** Mudanças de segurança, descritas sem detalhes exploráveis */
  security?: string[];
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.6.0",
    date: "2026-09-11",
    title: "Notas de atualização, apoio ao app e leitura mais simples",
    summary:
      "Nova página pública de novidades com histórico completo de versões, página de apoio ao aplicativo e um registro de leitura focado no que você realmente leu.",
    features: [
      "Página pública “Novidades e atualizações” em /novidades, montada a partir do histórico oficial de versões.",
      "Aviso discreto “O que há de novo” na primeira abertura de cada nova versão, com acesso ao histórico completo.",
      "Indicador “Novo” no menu e nos ajustes quando existe uma atualização ainda não visualizada.",
      "Página “Apoie este app” com contribuição voluntária via Pix, compartilhamento do aplicativo e instalação como app no dispositivo.",
      "Card “Palavra para hoje” na tela inicial, com versículo do dia, cópia, compartilhamento e link para o contexto na Bíblia.",
      "Detalhes do dia no calendário da tela inicial: ao tocar em um dia com leituras, todas aparecem separadamente.",
    ],
    improvements: [
      "Registro de leitura agora usa data, livro, capítulos, versículos e uma observação opcional, sem pedir minutos.",
      "Catálogo bíblico completo com os 66 livros agrupados por Antigo e Novo Testamento.",
      "Progresso calculado por versículos únicos, sem contar leituras repetidas duas vezes.",
      "Dias lidos e ofensiva calculados no fuso horário do usuário, a partir de uma única fonte de dados.",
      "Versão atual visível na tela de Ajustes.",
    ],
    fixes: [
      "Correção de links do contexto bíblico quando a referência estava incompleta ou inválida.",
      "Correção de informações antigas guardadas no dispositivo que podiam exibir o versículo errado.",
      "Correção de erros na tela de estatísticas ao alternar períodos e no histórico de leituras.",
    ],
    security: [
      "Regras de acesso aos dados revisadas para que cada pessoa veja somente as próprias leituras.",
      "Validação reforçada dos registros enviados ao servidor, incluindo datas e referências bíblicas.",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-08-18",
    title: "Leituras mais confiáveis e área administrativa",
    summary:
      "Registro de leitura mais robusto, sugestões de leitura e ferramentas internas de acompanhamento do aplicativo.",
    features: [
      "Sugestões de próxima leitura com base no seu histórico.",
      "Área administrativa privada para acompanhamento do aplicativo.",
    ],
    improvements: [
      "Registro de leitura passou a ser salvo de forma única e consistente, evitando duplicidades.",
      "Estatísticas com cálculos revisados por livro e por divisão bíblica.",
    ],
    fixes: ["Correção de falhas ao abrir as telas de Progresso e Estatísticas."],
    security: ["Acesso administrativo restrito e verificado no servidor."],
  },
  {
    version: "1.4.0",
    date: "2026-08-17",
    title: "Responsividade e legibilidade",
    summary:
      "Revisão completa do layout para telas pequenas, tablets e desktop, com textos mais legíveis.",
    improvements: [
      "Layout adaptado de 320px até telas grandes.",
      "Tipografia fluida e cards redesenhados para evitar cortes de texto.",
      "Navegação inferior respeitando as áreas seguras dos celulares.",
      "Gráficos adaptados a diferentes larguras.",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-08-17",
    title: "Suporte e primeiras notas de atualização",
    summary: "Canal de suporte oficial e o primeiro histórico de atualizações do aplicativo.",
    features: [
      "Página de suporte com atendimento por WhatsApp.",
      "Primeira versão das notas de atualização.",
      "Atalho de novidades na navegação.",
    ],
    improvements: [
      "Acessibilidade das opções da tela de Ajustes.",
      "Navegação entre páginas públicas e privadas.",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-08-10",
    title: "Estatísticas e histórico",
    summary: "Acompanhamento visual da sua constância na leitura.",
    features: [
      "Tela de estatísticas com gráficos de leitura.",
      "Histórico detalhado das atividades.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-08-01",
    title: "Lançamento do Bible Habit",
    summary: "Primeira versão pública, com planos de leitura, grupos e ofensiva diária.",
    features: [
      "Planos de leitura personalizados.",
      "Grupos para leitura em comunidade.",
      "Ofensiva diária para manter a constância.",
    ],
  },
];

/** Versão atual do aplicativo (sempre a primeira das notas). */
export const APP_VERSION = RELEASE_NOTES[0]!.version;

/** Nome amigável para exibição, ex.: "Bible Habit — versão 1.6.0". */
export const APP_VERSION_LABEL = `Bible Habit — versão ${APP_VERSION}`;

/** Chave local usada para lembrar a última versão vista (sem dados sensíveis). */
export const LAST_SEEN_VERSION_KEY = "bible-habit:last-seen-version";

/** Compara duas versões semânticas: >0 se a for maior, <0 se b for maior, 0 se iguais. */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    String(v)
      .trim()
      .split(".")
      .map((part) => {
        const n = Number.parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
      });
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

/** Histórico ordenado com a versão mais recente no topo. */
export function getReleaseHistory(): ReleaseNote[] {
  return [...RELEASE_NOTES].sort((a, b) => compareVersions(b.version, a.version));
}

/** Versão mais recente das notas. */
export function getLatestRelease(): ReleaseNote {
  return getReleaseHistory()[0]!;
}

/** Indica se existe atualização não visualizada, dado o valor salvo localmente. */
export function hasUnseenRelease(lastSeenVersion: string | null | undefined): boolean {
  if (!lastSeenVersion || typeof lastSeenVersion !== "string") return true;
  if (!/^\d+(\.\d+)*$/.test(lastSeenVersion.trim())) return true;
  return compareVersions(APP_VERSION, lastSeenVersion) > 0;
}
