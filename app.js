// ════════════════════════════════════════════════════
//  APP ORCHESTRATOR
// ════════════════════════════════════════════════════

async function initApp() {
  // Setup
  populateCatSelects();
  document.getElementById('motivation-text').textContent = getDailyMotivation();

  // Load initial view
  await loadWeek();
  updateStreak();

  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');

      // Load data for the activated view
      if (view === 'stats')     await loadStats('week');
      if (view === 'wellbeing') await loadWellbeing();
      if (view === 'todos')     await loadTodos();
      if (view === 'kais')      await loadKais();
    });
  });
}

async function updateStreak() {
  const streak = await computeStreak();
  document.getElementById('streak-count').textContent = streak;
}

// ─── BROWSER NOTIFICATIONS ──────────────────────────
function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function scheduleEventReminders(events) {
  if (Notification.permission !== 'granted') return;
  events.forEach(ev => {
    const start = new Date(ev.start_time);
    const now = new Date();
    const diff = start - now - 10 * 60 * 1000; // 10 min before
    if (diff > 0 && diff < 3600000) { // in the next hour
      setTimeout(() => {
        new Notification(`⏰ ${ev.titre}`, {
          body: `Dans 10 minutes · ${getCat(ev.categorie).label}`,
          icon: '/favicon.ico',
        });
      }, diff);
    }
  });
}

// ─── KEYBOARD SHORTCUTS ─────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    const activeView = document.querySelector('.nav-item.active')?.dataset?.view;
    if (activeView === 'agenda') openEventModal(null, isoDate(new Date()), 9);
    if (activeView === 'todos')  document.getElementById('new-todo-btn').click();
  }
});

// ─── INIT ────────────────────────────────────────────
initAuth();

// Request notif permission after 2s
setTimeout(requestNotifPermission, 2000);
