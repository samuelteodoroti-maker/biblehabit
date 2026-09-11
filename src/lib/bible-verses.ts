/**
 * Lista curada de referências para o "Versículo do dia".
 *
 * Cada item guarda a referência (livro USFM, capítulo e versículo) e o texto
 * em Almeida de domínio público (Almeida Revista e Corrigida / Almeida
 * Revista e Atualizada 1993 é obra licenciada da Sociedade Bíblica do Brasil e
 * NÃO é redistribuída aqui).
 *
 * Nenhum texto é gerado automaticamente: se uma referência não tiver texto
 * disponível, exibimos apenas a referência e o link para leitura autorizada.
 */
export interface DailyVerse {
  /** Código USFM estável do livro (GEN, PSA, JHN...). */
  bookId: string;
  /** Nome do livro em português, igual ao cânon. */
  book: string;
  chapter: number;
  verse: number;
  reference: string;
  /** Texto em Almeida de domínio público. */
  text: string;
  theme: string;
  active?: boolean;
}

type Seed = [bookId: string, book: string, chapter: number, verse: number, theme: string, text: string];

const SEEDS: Seed[] = [
  ["JHN", "João", 3, 16, "Amor", "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."],
  ["PSA", "Salmos", 23, 1, "Cuidado", "O Senhor é o meu pastor, nada me faltará."],
  ["PHP", "Filipenses", 4, 13, "Força", "Posso todas as coisas naquele que me fortalece."],
  ["ROM", "Romanos", 8, 28, "Providência", "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus."],
  ["JER", "Jeremias", 29, 11, "Esperança", "Porque eu bem sei os pensamentos que tenho a vosso respeito: pensamentos de paz e não de mal, para vos dar o fim que esperais."],
  ["MAT", "Mateus", 6, 33, "Prioridade", "Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas."],
  ["PSA", "Salmos", 46, 1, "Refúgio", "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia."],
  ["PRO", "Provérbios", 3, 5, "Confiança", "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento."],
  ["ISA", "Isaías", 40, 31, "Renovo", "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias."],
  ["JOS", "Josué", 1, 9, "Coragem", "Não to mandei eu? Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares."],
  ["PSA", "Salmos", 119, 105, "Palavra", "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."],
  ["2TI", "2 Timóteo", 1, 7, "Ânimo", "Porque Deus não nos deu espírito de covardia, mas de poder, de amor e de moderação."],
  ["GAL", "Gálatas", 5, 22, "Fruto", "Mas o fruto do Espírito é: amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade."],
  ["1CO", "1 Coríntios", 13, 4, "Amor", "O amor é paciente, é benigno; o amor não arde em ciúmes, não se ufana, não se ensoberbece."],
  ["HEB", "Hebreus", 11, 1, "Fé", "Ora, a fé é a certeza de coisas que se esperam, a convicção de fatos que se não veem."],
  ["PSA", "Salmos", 37, 4, "Deleite", "Deleita-te no Senhor, e ele satisfará os desejos do teu coração."],
  ["MAT", "Mateus", 11, 28, "Descanso", "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei."],
  ["EPH", "Efésios", 2, 8, "Graça", "Porque pela graça sois salvos, mediante a fé; e isto não vem de vós, é dom de Deus."],
  ["1PE", "1 Pedro", 5, 7, "Cuidado", "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós."],
  ["PSA", "Salmos", 121, 1, "Socorro", "Elevo os olhos para os montes: de onde me virá o socorro?"],
  ["JHN", "João", 1, 1, "Verbo", "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus."],
  ["JHN", "João", 14, 6, "Caminho", "Respondeu-lhe Jesus: Eu sou o caminho, e a verdade, e a vida; ninguém vem ao Pai senão por mim."],
  ["JHN", "João", 15, 5, "Comunhão", "Eu sou a videira, vós, os ramos. Quem permanece em mim, e eu, nele, esse dá muito fruto."],
  ["JHN", "João", 16, 33, "Paz", "No mundo, passais por aflições; mas tende bom ânimo! Eu venci o mundo."],
  ["PSA", "Salmos", 1, 1, "Sabedoria", "Bem-aventurado o homem que não anda no conselho dos ímpios."],
  ["PSA", "Salmos", 27, 1, "Luz", "O Senhor é a minha luz e a minha salvação; de quem terei medo?"],
  ["PSA", "Salmos", 34, 8, "Bondade", "Provai e vede que o Senhor é bom; bem-aventurado o homem que nele se refugia."],
  ["PSA", "Salmos", 91, 1, "Proteção", "O que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará."],
  ["PSA", "Salmos", 103, 2, "Gratidão", "Bendize, ó minha alma, ao Senhor, e não te esqueças de nem um só de seus benefícios."],
  ["PSA", "Salmos", 118, 24, "Alegria", "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele."],
  ["PSA", "Salmos", 139, 14, "Identidade", "Graças te dou, visto que por modo assombrosamente maravilhoso me formaste."],
  ["PSA", "Salmos", 143, 8, "Manhã", "Faze-me ouvir, pela manhã, a tua graça, pois em ti confio."],
  ["PRO", "Provérbios", 4, 23, "Coração", "Guarda o teu coração com toda a diligência, porque dele procede a vida."],
  ["PRO", "Provérbios", 16, 3, "Entrega", "Consagra ao Senhor as tuas obras, e os teus desígnios serão estabelecidos."],
  ["PRO", "Provérbios", 18, 10, "Segurança", "Torre forte é o nome do Senhor; para ela corre o justo e está seguro."],
  ["ECC", "Eclesiastes", 3, 1, "Tempo", "Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu."],
  ["ISA", "Isaías", 26, 3, "Paz", "Tu conservarás em perfeita paz aquele cujo propósito é firme e que confia em ti."],
  ["ISA", "Isaías", 41, 10, "Presença", "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus."],
  ["ISA", "Isaías", 43, 19, "Novidade", "Eis que faço coisa nova, que agora mesmo vai aparecer."],
  ["LAM", "Lamentações", 3, 22, "Misericórdia", "As misericórdias do Senhor são a causa de não sermos consumidos; renovam-se cada manhã."],
  ["MIC", "Miquéias", 6, 8, "Justiça", "Que é que o Senhor pede de ti, senão que pratiques a justiça, e ames a misericórdia, e andes humildemente com o teu Deus?"],
  ["HAB", "Habacuque", 3, 19, "Firmeza", "O Senhor Deus é a minha fortaleza; ele faz os meus pés como os da corça."],
  ["ZEP", "Sofonias", 3, 17, "Alegria", "O Senhor, teu Deus, está no meio de ti, poderoso para salvar."],
  ["DEU", "Deuteronômio", 31, 6, "Coragem", "Sede fortes e corajosos; o Senhor, vosso Deus, é quem vai convosco."],
  ["EXO", "Êxodo", 14, 14, "Confiança", "O Senhor pelejará por vós, e vós estareis em silêncio."],
  ["NUM", "Números", 6, 24, "Bênção", "O Senhor te abençoe e te guarde."],
  ["GEN", "Gênesis", 1, 1, "Criação", "No princípio, criou Deus os céus e a terra."],
  ["1CH", "1 Crônicas", 16, 11, "Busca", "Buscai o Senhor e a sua força; buscai perpetuamente a sua presença."],
  ["2CH", "2 Crônicas", 7, 14, "Restauração", "Se o meu povo se humilhar, orar e me buscar, então eu ouvirei dos céus."],
  ["NEH", "Neemias", 8, 10, "Força", "A alegria do Senhor é a vossa força."],
  ["JOB", "Jó", 19, 25, "Redenção", "Eu sei que o meu Redentor vive e que por fim se levantará sobre a terra."],
  ["MAT", "Mateus", 5, 16, "Testemunho", "Assim brilhe também a vossa luz diante dos homens."],
  ["MAT", "Mateus", 22, 37, "Amor", "Amarás o Senhor, teu Deus, de todo o teu coração, de toda a tua alma e de todo o teu entendimento."],
  ["MAT", "Mateus", 28, 20, "Presença", "E eis que estou convosco todos os dias até à consumação do século."],
  ["MRK", "Marcos", 11, 24, "Oração", "Tudo quanto em oração pedirdes, crede que recebestes, e será assim convosco."],
  ["LUK", "Lucas", 1, 37, "Poder", "Porque para Deus não há nada impossível."],
  ["LUK", "Lucas", 6, 31, "Relações", "Como quereis que os homens vos façam, assim fazei-o vós também a eles."],
  ["ACT", "Atos", 1, 8, "Missão", "Mas recebereis poder ao descer sobre vós o Espírito Santo."],
  ["ROM", "Romanos", 12, 2, "Transformação", "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente."],
  ["ROM", "Romanos", 15, 13, "Esperança", "Que o Deus da esperança vos encha de todo o gozo e paz no vosso crer."],
  ["1CO", "1 Coríntios", 10, 13, "Fidelidade", "Fiel é Deus, que não permitirá que sejais tentados além das vossas forças."],
  ["2CO", "2 Coríntios", 5, 17, "Nova vida", "Se alguém está em Cristo, é nova criatura; as coisas antigas já passaram."],
  ["2CO", "2 Coríntios", 12, 9, "Graça", "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza."],
  ["GAL", "Gálatas", 2, 20, "Identidade", "Já não sou eu quem vive, mas Cristo vive em mim."],
  ["EPH", "Efésios", 4, 32, "Perdão", "Antes, sede uns para com os outros benignos, perdoando-vos uns aos outros."],
  ["EPH", "Efésios", 6, 10, "Firmeza", "Fortalecei-vos no Senhor e na força do seu poder."],
  ["PHP", "Filipenses", 4, 6, "Oração", "Não andeis ansiosos de coisa alguma; em tudo, sejam conhecidas as vossas petições diante de Deus."],
  ["COL", "Colossenses", 3, 23, "Trabalho", "Tudo quanto fizerdes, fazei-o de todo o coração, como para o Senhor."],
  ["1TS", "1 Tessalonicenses", 5, 16, "Gratidão", "Regozijai-vos sempre. Orai sem cessar. Em tudo dai graças."],
  ["2TS", "2 Tessalonicenses", 3, 3, "Fidelidade", "Fiel é o Senhor, que vos confirmará e guardará do maligno."],
  ["1TI", "1 Timóteo", 4, 12, "Exemplo", "Sê o padrão dos fiéis na palavra, no procedimento, no amor, na fé e na pureza."],
  ["TIT", "Tito", 2, 11, "Graça", "Porquanto a graça de Deus se manifestou salvadora a todos os homens."],
  ["PHM", "Filemom", 1, 6, "Comunhão", "Para que a tua comunhão na fé se torne eficaz."],
  ["HEB", "Hebreus", 12, 1, "Perseverança", "Corramos, com perseverança, a carreira que nos está proposta."],
  ["HEB", "Hebreus", 13, 8, "Constância", "Jesus Cristo é o mesmo, ontem, hoje e eternamente."],
  ["JAS", "Tiago", 1, 5, "Sabedoria", "Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente."],
  ["1PE", "1 Pedro", 2, 9, "Vocação", "Vós, porém, sois raça eleita, sacerdócio real, nação santa, povo de propriedade exclusiva de Deus."],
  ["2PE", "2 Pedro", 3, 18, "Crescimento", "Antes, crescei na graça e no conhecimento de nosso Senhor e Salvador Jesus Cristo."],
  ["1JN", "1 João", 1, 9, "Perdão", "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar."],
  ["1JN", "1 João", 4, 19, "Amor", "Nós amamos porque ele nos amou primeiro."],
  ["2JN", "2 João", 1, 6, "Obediência", "E o amor é este: que andemos segundo os seus mandamentos."],
  ["3JN", "3 João", 1, 4, "Verdade", "Não tenho maior alegria do que esta: ouvir que meus filhos andam na verdade."],
  ["JUD", "Judas", 1, 24, "Firmeza", "Àquele que é poderoso para vos guardar de tropeços."],
  ["REV", "Apocalipse", 3, 20, "Convite", "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei."],
  ["REV", "Apocalipse", 21, 4, "Consolo", "E lhes enxugará dos olhos toda lágrima; e a morte já não existirá."],
  ["REV", "Apocalipse", 22, 21, "Graça", "A graça do Senhor Jesus seja com todos."],
];

export const ACTIVE_VERSES: DailyVerse[] = SEEDS.map(([bookId, book, chapter, verse, theme, text]) => ({
  bookId,
  book,
  chapter,
  verse,
  reference: `${book} ${chapter}:${verse}`,
  text,
  theme,
  active: true,
}));

/** Conjunto usado pela seleção diária (somente referências ativas). */
export const FULL_DATASET: DailyVerse[] = ACTIVE_VERSES.filter(v => v.active !== false);

/** Rótulo da tradução usada nos textos de domínio público. */
export const VERSE_TRANSLATION_LABEL = "Almeida (domínio público)";
