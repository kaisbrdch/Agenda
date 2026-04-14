// ════════════════════════════════════════════════════
//  CONFIG SUPABASE — À REMPLIR AVEC TES PROPRES CLÉS
//  Remplace les valeurs ci-dessous par celles de ton
//  projet Supabase (Settings > API)
// ════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://twulkippnxxzzqlkvopr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dWxraXBwbnh4enpxbGt2b3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODQwNjksImV4cCI6MjA5MTc2MDA2OX0.3sJd4QQYTnuWzwjx-wrbGfeZRdUBB26j9-bWNzhvas0';

// Initialisation du client Supabase
const supabaseClient  = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── CATÉGORIES ─────────────────────────────────────
const CATEGORIES = [
  { id: 'droit',   label: '⚖️ Droit',            color: '#C9968B', bg: 'rgba(201,150,139,0.18)' },
  { id: 'compta',  label: '💰 Comptabilité',      color: '#8A9E6A', bg: 'rgba(138,158,106,0.18)' },
  { id: 'msi',     label: '📊 MSI',               color: '#6A8EA8', bg: 'rgba(106,142,168,0.18)' },
  { id: 'anglais', label: '🇬🇧 Anglais',          color: '#A87898', bg: 'rgba(168,120,152,0.18)' },
  { id: 'altern',  label: '💻 Alternance',        color: '#7868A8', bg: 'rgba(120,104,168,0.18)' },
  { id: 'perso',   label: '🧠 Travail personnel', color: '#A88858', bg: 'rgba(168,136,88,0.18)'  },
  { id: 'detente', label: '🌿 Détente',           color: '#68A868', bg: 'rgba(104,168,104,0.18)' },
];

// Helper : retourne une catégorie par id
function getCat(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

// ─── MESSAGES MOTIVATION ────────────────────────────
const MOTIVATIONS = [
  "Tu es capable de tout ce que tu entreprends. 🌸",
  "Chaque heure de travail t'approche de tes objectifs. ✨",
  "Le DSCG, c'est pour toi. Continue ! 💪",
  "Petits pas, grandes victoires. 🌱",
  "Tu es brillante, et ce n'est pas un hasard. ⭐",
  "Focus. Respire. Tu gères. 🧘",
  "Aujourd'hui est une nouvelle chance de progresser. 🌅",
  "La constance bat le talent. Tu as les deux. 🏆",
  "Tes efforts d'aujourd'hui, tes résultats de demain. 🚀",
  "Un chapitre à la fois, une victoire à la fois. 📖",
];

function getDailyMotivation() {
  const idx = new Date().getDate() % MOTIVATIONS.length;
  return MOTIVATIONS[idx];
}
