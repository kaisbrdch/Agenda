// ════════════════════════════════════════════════════
//  STATS MODULE
// ════════════════════════════════════════════════════

let currentPeriod = 'week';
let donutChart = null;
let lineChart  = null;

function getPeriodRange(period) {
  const now = new Date();
  let start, end;
  if (period === 'week') {
    start = getMonday(now);
    end = addDays(start, 7);
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
    end   = new Date(now.getFullYear() + 1, 0, 1);
  }
  return { start, end };
}

async function loadStats(period = currentPeriod) {
  currentPeriod = period;
  const { start, end } = getPeriodRange(period);
  const events = await fetchEventsRange(start.toISOString(), end.toISOString());

  // Hours per category
  const hours = {};
  CATEGORIES.forEach(c => { hours[c.id] = 0; });
  events.forEach(ev => { hours[ev.categorie] = (hours[ev.categorie] || 0) + eventDurationH(ev); });

  const totalH = Object.values(hours).reduce((a, b) => a + b, 0);

  renderDonut(hours, totalH);
  renderCategoryDetails(hours, totalH);
  await renderLineChart(period, start, end);
}

function renderDonut(hours, totalH) {
  const labels = CATEGORIES.map(c => c.label);
  const data   = CATEGORIES.map(c => +hours[c.id].toFixed(1));
  const colors = CATEGORIES.map(c => c.color);

  if (donutChart) donutChart.destroy();

  const ctx = document.getElementById('donut-chart');
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' }]
    },
    options: {
      cutout: '72%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 11 }, padding: 16, color: '#4A4440' }},
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.toFixed(1)}h (${totalH > 0 ? Math.round(ctx.parsed/totalH*100) : 0}%)`
          }
        }
      }
    }
  });
}

async function renderLineChart(period, start, end) {
  let labels = [];
  let datasets = [];

  if (period === 'week') {
    const days = [];
    for (let i = 0; i < 7; i++) days.push(addDays(start, i));
    labels = days.map(d => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));

    const catDatasets = CATEGORIES.map(cat => ({
      label: cat.label,
      data: days.map(day => {
        const dayStr = isoDate(day);
        const dayEvs = (window._statsEvents || []).filter(ev =>
          ev.categorie === cat.id && ev.start_time.slice(0,10) === dayStr
        );
        return +dayEvs.reduce((a, ev) => a + eventDurationH(ev), 0).toFixed(1);
      }),
      borderColor: cat.color,
      backgroundColor: cat.color + '20',
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
    }));
    datasets = catDatasets;
  } else if (period === 'month') {
    const weeks = [];
    let cursor = new Date(start);
    while (cursor < end) {
      weeks.push(new Date(cursor));
      cursor = addDays(cursor, 7);
    }
    labels = weeks.map((w,i) => `Sem. ${i+1}`);
    // Aggregate by week for each cat
    const events = await fetchEventsRange(start.toISOString(), end.toISOString());
    window._statsEvents = events;
    const catDatasets = CATEGORIES.map(cat => ({
      label: cat.label,
      data: weeks.map((w, i) => {
        const wEnd = addDays(w, 7);
        const evs = events.filter(ev => ev.categorie === cat.id && new Date(ev.start_time) >= w && new Date(ev.start_time) < wEnd);
        return +evs.reduce((a, ev) => a + eventDurationH(ev), 0).toFixed(1);
      }),
      borderColor: cat.color, backgroundColor: cat.color+'20', borderWidth: 2, pointRadius: 4, tension: 0.4,
    }));
    datasets = catDatasets;
  } else {
    labels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const events = await fetchEventsRange(start.toISOString(), end.toISOString());
    window._statsEvents = events;
    const catDatasets = CATEGORIES.map(cat => ({
      label: cat.label,
      data: Array.from({length:12},(_,m) => {
        const evs = events.filter(ev => ev.categorie === cat.id && new Date(ev.start_time).getMonth() === m);
        return +evs.reduce((a, ev) => a + eventDurationH(ev), 0).toFixed(1);
      }),
      borderColor: cat.color, backgroundColor: cat.color+'20', borderWidth: 2, pointRadius: 4, tension: 0.4,
    }));
    datasets = catDatasets;
  }

  if (lineChart) lineChart.destroy();
  const ctx = document.getElementById('line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 10 }, padding: 12, color: '#4A4440', boxWidth: 12 }},
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { family: 'DM Sans', size: 10 }, color: '#7A7270' }, grid: { color: 'rgba(200,185,175,0.15)' }},
        x: { ticks: { font: { family: 'DM Sans', size: 10 }, color: '#7A7270' }, grid: { display: false }},
      }
    }
  });
}

function renderCategoryDetails(hours, totalH) {
  const el = document.getElementById('category-details');
  el.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const h = hours[cat.id] || 0;
    const pct = totalH > 0 ? (h / totalH * 100) : 0;
    const item = document.createElement('div');
    item.className = 'cat-detail-item';
    item.innerHTML = `
      <div class="cat-detail-name">
        <span class="cat-dot" style="background:${cat.color}"></span>
        ${cat.label}
      </div>
      <div class="cat-bar-wrap">
        <div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
      </div>
      <div class="cat-hours">${h.toFixed(1)}h · ${Math.round(pct)}%</div>
    `;
    el.appendChild(item);
  });
}

// Period buttons
document.querySelectorAll('.btn-period').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-period').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadStats(btn.dataset.period);
  });
});

function refreshCurrentStats() {
  if (document.getElementById('view-stats').classList.contains('active')) {
    loadStats(currentPeriod);
  }
}
