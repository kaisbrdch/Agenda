// ════════════════════════════════════════════════════
//  TODOS MODULE
// ════════════════════════════════════════════════════

async function loadTodos() {
  const todos = await fetchTodos('classique');

  const pending = todos.filter(t => !t.completed);
  const done    = todos.filter(t => t.completed);

  renderTodoList('todos-pending', pending);
  renderTodoList('todos-done',    done);
}

function renderTodoList(containerId, todos) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';

  if (todos.length === 0) {
    el.innerHTML = '<p style="color:var(--noir-soft);font-size:.85rem;padding:.5rem 0">Rien ici ✨</p>';
    return;
  }

  todos.forEach(todo => {
    const cat = getCat(todo.categorie);
    const item = document.createElement('div');
    item.className = 'todo-item';

    const deadline = todo.deadline
      ? new Date(todo.deadline).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })
      : null;

    const isOverdue = todo.deadline && !todo.completed && new Date(todo.deadline) < new Date();

    item.innerHTML = `
      <div class="todo-check ${todo.completed ? 'done' : ''}" data-id="${todo.id}"></div>
      <div class="todo-text">
        <div class="todo-title ${todo.completed ? 'done' : ''}">${todo.titre}</div>
        ${deadline ? `<div class="todo-meta" style="${isOverdue ? 'color:var(--rose-deep)' : ''}">
          ${isOverdue ? '⚠️ ' : '📅 '}${deadline}
        </div>` : ''}
        <span class="todo-cat-badge" style="background:${cat.color}">${cat.label}</span>
      </div>
      <span class="todo-delete" data-id="${todo.id}">✕</span>
    `;

    item.querySelector('.todo-check').addEventListener('click', async (e) => {
      e.stopPropagation();
      await updateTodo(todo.id, { completed: !todo.completed });
      await loadTodos();
    });

    item.querySelector('.todo-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteTodo(todo.id);
      await loadTodos();
    });

    el.appendChild(item);
  });
}

// New todo button
document.getElementById('new-todo-btn').addEventListener('click', () => {
  document.getElementById('todo-modal').classList.remove('hidden');
  document.getElementById('todo-titre').value = '';
  document.getElementById('todo-deadline').value = '';
  document.getElementById('todo-titre').focus();
});

// Save todo
document.getElementById('todo-save-btn').addEventListener('click', async () => {
  const titre    = document.getElementById('todo-titre').value.trim();
  const cat      = document.getElementById('todo-cat').value;
  const deadline = document.getElementById('todo-deadline').value || null;

  if (!titre) return;

  await createTodo({ titre, categorie: cat, deadline, completed: false, type: 'classique' });
  closeModal('todo-modal');
  await loadTodos();
});
