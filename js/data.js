// ════════════════════════════════════════════════════
//  DATA LAYER — Supabase CRUD
// ════════════════════════════════════════════════════

// ─── EVENTS ─────────────────────────────────────────

async function fetchEvents(startISO, endISO) {
  const { data, error } = await supabaseClient 
    .from('events')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('start_time', startISO)
    .lte('start_time', endISO)
    .order('start_time');
  if (error) { console.error(error); return []; }
  return data;
}

async function createEvent(payload) {
  const { data, error } = await supabaseClient 
    .from('events')
    .insert([{ ...payload, user_id: currentUser.id }])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

async function updateEvent(id, payload) {
  const { data, error } = await supabaseClient 
    .from('events')
    .update(payload)
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

async function deleteEvent(id) {
  const { error } = await supabaseClient 
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) console.error(error);
}

// ─── FETCH EVENTS RANGE (pour stats) ────────────────

async function fetchEventsRange(startISO, endISO) {
  const { data, error } = await supabaseClient 
    .from('events')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('start_time', startISO)
    .lte('end_time',   endISO);
  if (error) { console.error(error); return []; }
  return data;
}

// ─── TODOS ──────────────────────────────────────────

async function fetchTodos(type = 'classique') {
  const { data, error } = await supabaseClient 
    .from('todos')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('type', type)
    .order('created_at');
  if (error) { console.error(error); return []; }
  return data;
}

async function createTodo(payload) {
  const { data, error } = await supabaseClient 
    .from('todos')
    .insert([{ ...payload, user_id: currentUser.id }])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

async function updateTodo(id, payload) {
  const { data, error } = await supabaseClient 
    .from('todos')
    .update(payload)
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

async function deleteTodo(id) {
  const { error } = await supabaseClient 
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) console.error(error);
}

// ─── OBJECTIVES ─────────────────────────────────────

async function fetchObjectives() {
  const { data, error } = await supabaseClient 
    .from('objectives')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at');
  if (error) { console.error(error); return []; }
  return data;
}

async function createObjective(text) {
  const { data, error } = await supabaseClient 
    .from('objectives')
    .insert([{ text, user_id: currentUser.id, done: false }])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

async function updateObjective(id, payload) {
  const { error } = await supabaseClient 
    .from('objectives')
    .update(payload)
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) console.error(error);
}

async function deleteObjective(id) {
  const { error } = await supabaseClient 
    .from('objectives')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);
  if (error) console.error(error);
}

// ─── STREAK ─────────────────────────────────────────

async function computeStreak() {
  // Récupère tous les jours où il y a eu un événement
  const { data } = await supabaseClient 
    .from('events')
    .select('start_time')
    .eq('user_id', currentUser.id)
    .order('start_time', { ascending: false });

  if (!data || data.length === 0) return 0;

  const days = [...new Set(data.map(e => e.start_time.slice(0, 10)))];
  days.sort((a, b) => b.localeCompare(a));

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0,0,0,0);

  for (const day of days) {
    const d = new Date(day + 'T00:00:00');
    const diff = Math.round((cursor - d) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = d;
    } else {
      break;
    }
  }
  return streak;
}

// ─── HELPERS ────────────────────────────────────────

function eventDurationH(ev) {
  const s = new Date(ev.start_time);
  const e = new Date(ev.end_time);
  return Math.max(0, (e - s) / 3600000);
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}
