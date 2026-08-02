(function () {
  const CAT_VAR = {
    "예식 준비": "var(--cat-ceremony)",
    "스드메": "var(--cat-sdm)",
    "신혼집": "var(--cat-home)",
    "신혼여행": "var(--cat-honeymoon)",
    "부모님": "var(--cat-parents)"
  };

  function itemText(item) {
    return typeof item === 'object' ? item.text : item;
  }

  function checkboxRow(id, text, dotColor) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'tl-check';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = localStorage.getItem(id) === '1';
    cb.addEventListener('change', () => {
      if (cb.checked) localStorage.setItem(id, '1');
      else localStorage.removeItem(id);
    });
    label.appendChild(cb);

    if (dotColor) {
      const dot = document.createElement('span');
      dot.className = 'tl-dot';
      dot.style.background = dotColor;
      label.appendChild(dot);
    }

    const span = document.createElement('span');
    span.textContent = text;
    label.appendChild(span);

    li.appendChild(label);
    return li;
  }

  function subList(subs) {
    const ul = document.createElement('ul');
    ul.className = 'sub';
    subs.forEach(s => {
      const li = document.createElement('li');
      li.textContent = '– ' + s;
      ul.appendChild(li);
    });
    return ul;
  }

  const summaryCol = document.getElementById('col-summary');
  TIMELINE_SUMMARY.forEach((month, mi) => {
    const row = document.createElement('div');
    row.className = 'tl-row';

    const dday = document.createElement('div');
    dday.className = 'tl-dday';
    dday.innerHTML = `${month.dday} <span class="tl-tag">[${month.tag}]</span>`;
    row.appendChild(dday);

    const ul = document.createElement('ul');
    ul.className = 'tl-items';
    month.items.forEach((it, ii) => {
      const id = `timeline-summary-m${mi}-i${ii}`;
      ul.appendChild(checkboxRow(id, it.text, CAT_VAR[it.cat] || 'var(--ink)'));
    });
    row.appendChild(ul);
    summaryCol.appendChild(row);
  });

  const sdmCol = document.getElementById('col-sdm');
  const homeCol = document.getElementById('col-home');

  CALENDAR_BRIDE.months.forEach((month, mi) => {
    [[sdmCol, '스드메'], [homeCol, '신혼집']].forEach(([col, cat]) => {
      const row = document.createElement('div');
      row.className = 'tl-row';

      const dday = document.createElement('div');
      dday.className = 'tl-dday';
      dday.textContent = month.dday;
      row.appendChild(dday);

      const items = month.sections[cat];
      if (items && items.length) {
        const ul = document.createElement('ul');
        ul.className = 'tl-items';
        items.forEach((item, ii) => {
          // same id scheme as calendar.js's renderBrideMonth, so checking
          // an item here stays in sync with the calendar tool's bride view
          const id = `bride-m${mi}-${cat}-${ii}`.replace(/\s/g, '');
          const li = checkboxRow(id, itemText(item));
          if (typeof item === 'object' && item.sub) li.appendChild(subList(item.sub));
          ul.appendChild(li);
        });
        row.appendChild(ul);
      }
      col.appendChild(row);
    });
  });
})();
