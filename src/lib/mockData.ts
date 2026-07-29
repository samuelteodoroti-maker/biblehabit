// Mock data for the Bible reading tracker app
export const currentUser = {
  id: "u1",
  name: "João Silva",
  email: "joao@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao",
  streak: 14,
  totalDays: 87,
  youVersionLink: "",
};

// Heatmap: 90 dias fixos, determinístico. Datas em string ISO para evitar
// mismatch de hidratação SSR/CSR causado por `new Date()` em escopo de módulo.
const HEATMAP_END = "2026-07-29";
export const readingHeatmap = Array.from({ length: 90 }, (_, i) => {
  const end = new Date(HEATMAP_END + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate() - (89 - i));
  const seed = (i * 9301 + 49297) % 233280;
  const rand = seed / 233280;
  const value = rand > 0.75 ? 4 : rand > 0.55 ? 3 : rand > 0.35 ? 2 : rand > 0.2 ? 1 : 0;
  return { date: end.toISOString().slice(0, 10), value };
});

export const readingPlans = [
  {
    id: "p1",
    title: "Novo Testamento em 90 dias",
    description: "Leitura completa do NT, 3 capítulos por dia.",
    totalDays: 90,
    completedDays: 42,
    booksToday: "João 3-5",
    shareLink: "https://biblereader.app/join/nt90-abc123",
  },
  {
    id: "p2",
    title: "Salmos & Provérbios",
    description: "1 Salmo + 1 capítulo de Provérbios por dia.",
    totalDays: 60,
    completedDays: 18,
    booksToday: "Salmo 19 + Provérbios 19",
    shareLink: "https://biblereader.app/join/sp60-xyz789",
  },
  {
    id: "p3",
    title: "Evangelhos em 30 dias",
    description: "Mateus, Marcos, Lucas e João intensivo.",
    totalDays: 30,
    completedDays: 30,
    booksToday: "Concluído",
    shareLink: "https://biblereader.app/join/ev30-fin456",
  },
];

export const groups = [
  {
    id: "g1",
    name: "Célula Jovens",
    members: 12,
    avatar: "🔥",
    description: "Nosso grupo de jovens lendo juntos.",
  },
  {
    id: "g2",
    name: "Família Silva",
    members: 5,
    avatar: "🏡",
    description: "Devocional em família.",
  },
  {
    id: "g3",
    name: "Discipulado 2026",
    members: 8,
    avatar: "📖",
    description: "Grupo de discipulado do ano.",
  },
];

export const groupLeaderboard = [
  { id: "u1", name: "João Silva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao", chapters: 24, streak: 14 },
  { id: "u2", name: "Maria Costa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", chapters: 22, streak: 12 },
  { id: "u3", name: "Pedro Alves", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro", chapters: 18, streak: 7 },
  { id: "u4", name: "Ana Souza", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana", chapters: 15, streak: 5 },
  { id: "u5", name: "Lucas Lima", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucas", chapters: 10, streak: 3 },
];

export const groupMessages = [
  { id: "m1", userId: "u2", name: "Maria Costa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", text: "Bom dia! Terminei João 3 agora 🙏", time: "08:12" },
  { id: "m2", userId: "u3", name: "Pedro Alves", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro", text: "Que passagem incrível hoje!", time: "08:20" },
  { id: "m3", userId: "u1", name: "João Silva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=joao", text: "Concordo, versículo 16 é o resumo do evangelho.", time: "08:22" },
  { id: "m4", userId: "u4", name: "Ana Souza", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana", text: "Alguém pode compartilhar a reflexão de ontem?", time: "09:05" },
  { id: "m5", userId: "u2", name: "Maria Costa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", text: "Vou postar aqui em breve 📝", time: "09:07" },
];

export const achievements = [
  { id: "a1", title: "Primeiro Passo", description: "Registrou a primeira leitura", icon: "🌱", unlocked: true, unlockedAt: "2026-05-10" },
  { id: "a2", title: "7 Dias Seguidos", description: "Uma semana de ofensiva", icon: "🔥", unlocked: true, unlockedAt: "2026-05-17" },
  { id: "a3", title: "30 Dias Seguidos", description: "Um mês inteiro sem falhar", icon: "⚡", unlocked: true, unlockedAt: "2026-06-16" },
  { id: "a4", title: "Novo Testamento", description: "Concluiu o Novo Testamento", icon: "📖", unlocked: true, unlockedAt: "2026-07-01" },
  { id: "a5", title: "Primeiro Plano", description: "Concluiu o primeiro plano de leitura", icon: "🏆", unlocked: true, unlockedAt: "2026-06-20" },
  { id: "a6", title: "100 Dias", description: "Cem dias de leitura acumulados", icon: "💯", unlocked: false },
  { id: "a7", title: "Bíblia Completa", description: "Leu a Bíblia inteira", icon: "👑", unlocked: false },
  { id: "a8", title: "Mentor", description: "Convidou 5 amigos para um plano", icon: "🤝", unlocked: false },
];

export const activityLog = [
  { id: "l1", date: "2026-07-29", chapters: "João 3-5", plan: "Novo Testamento em 90 dias" },
  { id: "l2", date: "2026-07-28", chapters: "João 1-2", plan: "Novo Testamento em 90 dias" },
  { id: "l3", date: "2026-07-27", chapters: "Lucas 23-24", plan: "Novo Testamento em 90 dias" },
  { id: "l4", date: "2026-07-26", chapters: "Lucas 20-22", plan: "Novo Testamento em 90 dias" },
  { id: "l5", date: "2026-07-25", chapters: "Salmo 18 + Prov. 18", plan: "Salmos & Provérbios" },
  { id: "l6", date: "2026-07-24", chapters: "Lucas 17-19", plan: "Novo Testamento em 90 dias" },
  { id: "l7", date: "2026-07-23", chapters: "Lucas 14-16", plan: "Novo Testamento em 90 dias" },
];
