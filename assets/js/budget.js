(function () {
  const circled = '①②③④⑤⑥⑦';

  const summaryEl = document.getElementById('budget-summary');
  BUDGET.summary.forEach(s => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `<div class="no">${circled[s.no - 1]}</div><div class="label">${s.label}</div><div class="range">${s.range}</div>`;
    summaryEl.appendChild(cell);
  });

  const tiersEl = document.getElementById('budget-tiers');
  BUDGET.tiers.forEach(t => {
    const div = document.createElement('div');
    div.className = 'tier';
    div.innerHTML = `<b>${t.name}</b>${t.range}`;
    tiersEl.appendChild(div);
  });

  const sectionsEl = document.getElementById('budget-sections');
  BUDGET.sections.forEach(sec => {
    const card = document.createElement('div');
    card.className = 'budget-card';

    const h3 = document.createElement('h3');
    h3.textContent = `${circled[sec.no - 1]} ${sec.title}`;
    card.appendChild(h3);

    if (sec.note) {
      const note = document.createElement('div');
      note.className = 'section-note';
      note.textContent = sec.note;
      card.appendChild(note);
    }

    sec.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'budget-row';
      row.innerHTML = `<span class="b-label">${item.label}</span><span class="b-range">${item.range}</span>` +
        (item.note ? `<span class="b-note">${item.note}</span>` : '');
      card.appendChild(row);

      if (item.sub) {
        const sub = document.createElement('div');
        sub.className = 'budget-sub-note';
        sub.textContent = item.sub;
        card.appendChild(sub);
      }
    });

    const total = document.createElement('div');
    total.className = 'budget-total';
    total.innerHTML = `<span>합계</span><span>${sec.total}</span>`;
    card.appendChild(total);

    sectionsEl.appendChild(card);
  });
})();
