// ════════════════════════════════════════════════════
//  CALENDAR MODULE
//  Grille semaine 8h-22h, drag & drop, modal événement
// ════════════════════════════════════════════════════

const HOUR_START = 8;
const HOUR_END   = 22;
const HOUR_PX    = 60; // hauteur d'une heure en px

let currentWeekStart = getMonday(new Date());
let weekEvents = [];
let dragState = null;
let editingEventId = null;

// ─── POPULATE CATEGORY SELECT ────────────────────────
function populateCatSelects() {
  const selects = ['ev-categorie', 'todo-cat'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.label;
      sel.appendChild(opt);
    });
  });
}

// ─── DATE HELPERS ────────────────────────────────────
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

function formatWeekLabel(monday) {
  const sunday = addDays(monday, 6);
  const opt = { day: 'numeric', month: 'long' };
  return `Semaine du ${monday.toLocaleDateString('fr-FR', opt)} au ${sunday.toLocaleDateString('fr-FR', opt)}`;
}

// ─── LOAD WEEK ───────────────────────────────────────
async function loadWeek() {
  const start = new Date(currentWeekStart);
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, 7);

  document.getElementById('week-label').textContent = formatWeekLabel(currentWeekStart);
  weekEvents = await fetchEvents(start.toISOString(), end.toISOString());
  renderCalendar();
}

// ─── RENDER ──────────────────────────────────────────
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = isoDate(new Date());

  // ── HEADER ──
  const corner = document.createElement('div');
  corner.className = 'cal-corner';
  grid.appendChild(corner);

  const dayHeaders = [];
  for (let d = 0; d < 7; d++) {
    const date = addDays(currentWeekStart, d);
    const hdr = document.createElement('div');
    hdr.className = 'cal-day-header' + (isoDate(date) === today ? ' today' : '');
    hdr.innerHTML = `
      <div class="day-name">${DAY_NAMES[d]}</div>
      <div class="day-num">${date.getDate()}</div>
    `;
    grid.appendChild(hdr);
    dayHeaders.push(date);
  }

  // ── TIME COL + DAY COLS ──
  const timeCol = document.createElement('div');
  timeCol.className = 'cal-time-col';

  const dayCols = [];
  for (let d = 0; d < 7; d++) {
    const col = document.createElement('div');
    col.className = 'cal-day-col';
    col.dataset.dayIndex = d;
    dayCols.push(col);
    grid.appendChild(col); // placeholder, will fix order below
  }

  // Rebuild in correct order: timeCol, then 7 dayCols
  grid.innerHTML = '';
  // Header
  grid.appendChild(corner);
  for (let d = 0; d < 7; d++) {
    const date = addDays(currentWeekStart, d);
    const hdr = document.createElement('div');
    hdr.className = 'cal-day-header' + (isoDate(date) === today ? ' today' : '');
    hdr.innerHTML = `<div class="day-name">${DAY_NAMES[d]}</div><div class="day-num">${date.getDate()}</div>`;
    grid.appendChild(hdr);
  }

  // Time col
  const tCol = document.createElement('div');
  tCol.className = 'cal-time-col';
  for (let h = HOUR_START; h < HOUR_END; h++) {
    const slot = document.createElement('div');
    slot.className = 'cal-time-slot';
    slot.textContent = `${h}h`;
    tCol.appendChild(slot);
  }
  grid.appendChild(tCol);

  // Day columns with click-to-create + current time line
  const newDayCols = [];
  for (let d = 0; d < 7; d++) {
    const date = addDays(currentWeekStart, d);
    const col = document.createElement('div');
    col.className = 'cal-day-col';
    col.dataset.dayIndex = d;
    col.dataset.date = isoDate(date);

    // Hour lines (click to create)
    for (let h = HOUR_START; h < HOUR_END; h++) {
      const line = document.createElement('div');
      line.className = 'cal-hour-line';
      line.style.top = `${(h - HOUR_START) * HOUR_PX}px`;
      line.dataset.hour = h;
      line.dataset.date = isoDate(date);
      line.addEventListener('click', (e) => {
        if (e.target === line) {
          openEventModal(null, isoDate(date), h);
        }
      });
      col.appendChild(line);
    }

    // Current time indicator
    if (isoDate(date) === today) {
      const now = new Date();
      const top = (now.getHours() + now.getMinutes()/60 - HOUR_START) * HOUR_PX;
      if (top >= 0 && top <= (HOUR_END - HOUR_START) * HOUR_PX) {
        const line = document.createElement('div');
        line.className = 'current-time-line';
        line.style.top = `${top}px`;
        col.appendChild(line);
      }
    }

    grid.appendChild(col);
    newDayCols.push(col);
  }

  // ── RENDER EVENTS ──
  weekEvents.forEach(ev => {
    const start = new Date(ev.start_time);
    const end   = new Date(ev.end_time);
    const dayIndex = (start.getDay() + 6) % 7; // 0=Mon
    const col = newDayCols[dayIndex];
    if (!col) return;

    const topH    = start.getHours() + start.getMinutes()/60 - HOUR_START;
    const heightH = (end - start) / 3600000;
    const top     = Math.max(0, topH * HOUR_PX);
    const height  = Math.max(20, heightH * HOUR_PX - 2);

    const cat = getCat(ev.categorie);
    const el = document.createElement('div');
    el.className = 'cal-event';
    el.style.top    = `${top}px`;
    el.style.height = `${height}px`;
    el.style.background = cat.bg;
    el.style.borderLeftColor = cat.color;
    el.style.color = cat.color;
    el.dataset.id = ev.id;
    el.innerHTML = `
      <div class="cal-event-title">${ev.titre}</div>
      <div class="cal-event-time">${formatTime(start)} – ${formatTime(end)}</div>
    `;
    el.addEventListener('click', (e) => { e.stopPropagation(); openEventModal(ev); });
    el.addEventListener('mousedown', (e) => startDrag(e, ev, el, col, newDayCols));
    col.appendChild(el);
  });

  // Set col heights
  const totalH = (HOUR_END - HOUR_START) * HOUR_PX;
  newDayCols.forEach(c => { c.style.height = `${totalH}px`; });
  tCol.style.height = `${totalH}px`;
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

// ─── DRAG & DROP ─────────────────────────────────────
function startDrag(e, ev, el, originCol, allCols) {
  e.preventDefault();
  const rect = el.getBoundingClientRect();
  const offsetY = e.clientY - rect.top;

  dragState = { ev, el, originCol, allCols, offsetY };
  el.classList.add('dragging');

  function onMove(e2) {
    if (!dragState) return;
    // Find which col is under cursor
    const col = allCols.find(c => {
      const r = c.getBoundingClientRect();
      return e2.clientX >= r.left && e2.clientX <= r.right;
    });
    if (!col) return;

    const colRect = col.getBoundingClientRect();
    const relY = e2.clientY - colRect.top - dragState.offsetY;
    const newHour = HOUR_START + relY / HOUR_PX;
    const snapped = Math.round(newHour * 4) / 4; // snap to 15min
    const top = (snapped - HOUR_START) * HOUR_PX;
    el.style.top = `${Math.max(0, top)}px`;

    // Move el to new col visually
    if (col !== el.parentElement) {
      col.appendChild(el);
    }
    dragState.currentCol = col;
    dragState.snappedHour = Math.max(HOUR_START, Math.min(HOUR_END - 1, snapped));
  }

  async function onUp() {
    if (!dragState) return;
    el.classList.remove('dragging');

    const { ev: event, currentCol, snappedHour } = dragState;
    dragState = null;

    if (currentCol && snappedHour !== undefined) {
      const originalStart = new Date(event.start_time);
      const originalEnd   = new Date(event.end_time);
      const duration = (originalEnd - originalStart) / 60000; // minutes

      const newDate = currentCol.dataset.date;
      const h = Math.floor(snappedHour);
      const m = Math.round((snappedHour - h) * 60);

      const newStart = new Date(`${newDate}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
      const newEnd   = new Date(newStart.getTime() + duration * 60000);

      await updateEvent(event.id, {
        start_time: newStart.toISOString(),
        end_time:   newEnd.toISOString(),
      });
      await loadWeek();
    }

    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ─── EVENT MODAL ─────────────────────────────────────
function openEventModal(ev = null, dateStr = null, hour = 9) {
  editingEventId = ev ? ev.id : null;
  const isEdit = !!ev;

  document.getElementById('event-modal-title').textContent = isEdit ? 'Modifier l\'événement' : 'Nouvel événement';
  document.getElementById('ev-delete-btn').classList.toggle('hidden', !isEdit);

  if (ev) {
    const s = new Date(ev.start_time);
    const e = new Date(ev.end_time);
    document.getElementById('ev-titre').value     = ev.titre;
    document.getElementById('ev-categorie').value = ev.categorie;
    document.getElementById('ev-start').value     = formatTime(s);
    document.getElementById('ev-end').value       = formatTime(e);
    document.getElementById('ev-notes').value     = ev.notes || '';
    // store date for saving
    document.getElementById('ev-start').dataset.date = isoDate(s);
  } else {
    const h2 = hour < 21 ? hour + 1 : hour;
    document.getElementById('ev-titre').value     = '';
    document.getElementById('ev-categorie').value = CATEGORIES[0].id;
    document.getElementById('ev-start').value     = `${String(hour).padStart(2,'0')}:00`;
    document.getElementById('ev-end').value       = `${String(h2).padStart(2,'0')}:00`;
    document.getElementById('ev-notes').value     = '';
    document.getElementById('ev-start').dataset.date = dateStr || isoDate(new Date());
  }

  document.getElementById('event-modal').classList.remove('hidden');
  document.getElementById('ev-titre').focus();
}

// Save
document.getElementById('ev-save-btn').addEventListener('click', async () => {
  const titre     = document.getElementById('ev-titre').value.trim();
  const categorie = document.getElementById('ev-categorie').value;
  const startVal  = document.getElementById('ev-start').value;
  const endVal    = document.getElementById('ev-end').value;
  const notes     = document.getElementById('ev-notes').value.trim();
  const dateStr   = document.getElementById('ev-start').dataset.date;

  if (!titre || !startVal || !endVal) return;

  const start_time = `${dateStr}T${startVal}:00`;
  const end_time   = `${dateStr}T${endVal}:00`;

  const payload = { titre, categorie, start_time, end_time, notes };

  if (editingEventId) {
    await updateEvent(editingEventId, payload);
  } else {
    await createEvent(payload);
  }

  closeModal('event-modal');
  await loadWeek();
  refreshCurrentStats();
});

// Delete
document.getElementById('ev-delete-btn').addEventListener('click', async () => {
  if (!editingEventId) return;
  if (!confirm('Supprimer cet événement ?')) return;
  await deleteEvent(editingEventId);
  closeModal('event-modal');
  await loadWeek();
  refreshCurrentStats();
});

// ─── NAV BUTTONS ─────────────────────────────────────
document.getElementById('prev-week').addEventListener('click', () => {
  currentWeekStart = addDays(currentWeekStart, -7);
  loadWeek();
});
document.getElementById('next-week').addEventListener('click', () => {
  currentWeekStart = addDays(currentWeekStart, 7);
  loadWeek();
});
document.getElementById('today-btn').addEventListener('click', () => {
  currentWeekStart = getMonday(new Date());
  loadWeek();
});
document.getElementById('new-event-btn').addEventListener('click', () => {
  openEventModal(null, isoDate(new Date()), 9);
});

// ─── MODAL CLOSE ─────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.modal;
    if (id) closeModal(id);
  });
});

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});
