// ════════════════════════════════════════════════════
//  WELLBEING MODULE
// ════════════════════════════════════════════════════

async function loadWellbeing() {
  const { start, end } = getPeriodRange('week');
  const events = await fetchEventsRange(start.toISOString(), end.toISOString());

  const WORK_CATS    = ['droit','compta','msi','anglais','altern','perso'];
  const REST_CATS    = ['detente'];

  let workH = 0, restH = 0;
  events.forEach(ev => {
    const h = eventDurationH(ev);
    if (WORK_CATS.includes(ev.categorie)) workH += h;
    if (REST_CATS.includes(ev.categorie)) restH += h;
  });

  workH = +workH.toFixed(1);
  restH = +restH.toFixed(1);
  const total = workH + restH;

  document.getElementById('wb-work').textContent = `${workH}h`;
  document.getElementById('wb-rest').textContent = `${restH}h`;

  // Balance score
  let balanceLabel = '—';
  let balanceScore = 0;
  if (total > 0) {
    const ratio = restH / total;
    balanceScore = Math.round(ratio * 100);
    if (ratio < 0.1)      balanceLabel = '😰 Épuisée';
    else if (ratio < 0.2) balanceLabel = '😅 Surchargée';
    else if (ratio < 0.35) balanceLabel = '😊 Bon équilibre';
    else                  balanceLabel = '🌿 Super équilibrée';
  }
  document.getElementById('wb-balance').textContent = balanceLabel;

  // Bar
  const workPct = total > 0 ? Math.round(workH / total * 100) : 50;
  const restPct = 100 - workPct;
  document.getElementById('wb-bar-work').style.width = `${workPct}%`;
  document.getElementById('wb-bar-rest').style.width = `${restPct}%`;
  document.getElementById('wb-bar-work').textContent = workPct > 15 ? `Travail ${workPct}%` : '';
  document.getElementById('wb-bar-rest').textContent = restPct > 10 ? `Détente ${restPct}%` : '';

  // Message
  const msg = generateWbMessage(workH, restH);
  document.getElementById('wb-message').innerHTML = msg;

  // Objectives
  await loadObjectives();
}

function generateWbMessage(workH, restH) {
  if (workH === 0 && restH === 0) return '📅 Aucun créneau cette semaine pour l\'instant.';
  if (restH === 0) return `💼 Tu as travaillé <strong>${workH}h</strong> cette semaine mais <strong>0h de détente</strong> 🌿 — pense à toi !`;
  if (workH === 0) return `🌿 Toute détente cette semaine ! Un peu de travail ferait du bien 💪`;
  const ratio = restH / workH;
  if (ratio < 0.1) return `Tu as travaillé <strong>${workH}h</strong> cette semaine 💪 mais seulement <strong>${restH}h de détente</strong> 🌿 — mérite une pause !`;
  if (ratio < 0.25) return `<strong>${workH}h de travail</strong> ✨ et <strong>${restH}h de détente</strong> — bon rythme, continue !`;
  return `Super équilibre : <strong>${workH}h de travail</strong> 💼 et <strong>${restH}h de détente</strong> 🌿 — tu gères parfaitement ! 🌸`;
}

// ─── OBJECTIVES ─────────────────────────────────────
async function loadObjectives() {
  const objectives = await fetchObjectives();
  const list = document.getElementById('objectives-list');
  list.innerHTML = '';

  if (objectives.length === 0) {
    list.innerHTML = '<p style="color:var(--noir-soft);font-size:.875rem">Aucun objectif pour l\'instant. Ajoute-en un !</p>';
    return;
  }

  objectives.forEach(obj => {
    const item = document.createElement('div');
    item.className = 'obj-item';
    item.innerHTML = `
      <div class="obj-check ${obj.done ? 'done' : ''}" data-id="${obj.id}"></div>
      <span style="${obj.done ? 'text-decoration:line-through;color:var(--noir-soft)' : ''}">${obj.text}</span>
      <span class="obj-delete" data-id="${obj.id}">✕</span>
    `;
    item.querySelector('.obj-check').addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const newDone = !obj.done;
      await updateObjective(id, { done: newDone });
      await loadObjectives();
    });
    item.querySelector('.obj-delete').addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await deleteObjective(id);
      await loadObjectives();
    });
    list.appendChild(item);
  });
}

document.getElementById('add-objective-btn').addEventListener('click', () => {
  document.getElementById('obj-modal').classList.remove('hidden');
  document.getElementById('obj-text').value = '';
  document.getElementById('obj-text').focus();
});

document.getElementById('obj-save-btn').addEventListener('click', async () => {
  const text = document.getElementById('obj-text').value.trim();
  if (!text) return;
  await createObjective(text);
  closeModal('obj-modal');
  await loadObjectives();
});
