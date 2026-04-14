// ════════════════════════════════════════════════════
//  KAÏS MODULE — La liste fun des aventures 💛
// ════════════════════════════════════════════════════

const KAIS_DEFAULTS = [
  { emoji: '🍝', titre: 'Aller manger à l\'italien',      sub: 'Toujours reporté 😂',      done: false },
  { emoji: '🎬', titre: 'Voir le film de Michael Jackson', sub: 'Toujours reporté 😂',      done: false },
  { emoji: '☕', titre: 'Tester des cafés à Marseille',   sub: 'Toujours reporté 😂',      done: false },
  { emoji: '🌊', titre: 'Se balader au bord de la mer',   sub: 'Toujours reporté 😂',      done: false },
  { emoji: '🎨', titre: 'Activité peinture / poterie',    sub: 'Toujours reporté 😂',      done: false },
  { emoji: '🥐', titre: 'Goûter chez 82',                 sub: 'Toujours reporté 😂',      done: false },
];

async function loadKais() {
  // Fetch from todos table with type='kais'
  let todos = await fetchTodos('kais');

  // If no kais todos yet, seed the defaults
  if (todos.length === 0) {
    for (const def of KAIS_DEFAULTS) {
      const created = await createTodo({
        titre: def.titre,
        categorie: 'detente',
        completed: false,
        type: 'kais',
        notes: def.emoji + '|' + def.sub,
      });
      if (created) todos.push(created);
    }
    // Re-fetch to get full data
    todos = await fetchTodos('kais');
  }

  renderKais(todos);
}

function renderKais(todos) {
  const grid = document.getElementById('kais-grid');
  grid.innerHTML = '';

  todos.forEach(todo => {
    const parts = (todo.notes || '🌟|Toujours reporté 😂').split('|');
    const emoji = parts[0] || '🌟';
    const sub   = parts[1] || 'Toujours reporté 😂';

    const card = document.createElement('div');
    card.className = 'kais-card' + (todo.completed ? ' done-card' : '');
    card.innerHTML = `
      <div class="kais-emoji">${emoji}</div>
      <div class="kais-title">${todo.titre}</div>
      <div class="kais-sub">${todo.completed ? '✅ Fait ! Bravo 🎉' : sub}</div>
      <div class="kais-badges">
        ${!todo.completed ? '<span class="kais-badge overdue">Toujours reporté 😂</span>' : '<span class="kais-badge planned">Accompli ! 🎉</span>'}
      </div>
      <div class="kais-actions">
        ${!todo.completed
          ? `<button class="kais-btn" data-action="schedule" data-id="${todo.id}">On le fait quand ? 😡</button>
             <button class="kais-btn primary-sm" data-action="done" data-id="${todo.id}">C'est fait ! ✅</button>`
          : `<button class="kais-btn" data-action="undone" data-id="${todo.id}">En fait non 😅</button>`
        }
      </div>
    `;

    // Actions
    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'done') {
          await updateTodo(id, { completed: true });
          await loadKais();
        } else if (action === 'undone') {
          await updateTodo(id, { completed: false });
          await loadKais();
        } else if (action === 'schedule') {
          const when = prompt('C\'est prévu pour quand ? 😄 (ex: samedi prochain, 15 juin…)');
          if (when) {
            // Update notes with the planned date
            const newNotes = `${emoji}|Prévu : ${when} 📅`;
            await updateTodo(id, { notes: newNotes });
            await loadKais();
          }
        }
      });
    });

    grid.appendChild(card);
  });
}
