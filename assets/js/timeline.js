(function () {
  const CAT_VAR = {
    "예식 준비": "var(--cat-ceremony)",
    "스드메": "var(--cat-sdm)",
    "신혼집": "var(--cat-home)",
    "신혼여행": "var(--cat-honeymoon)",
    "부모님": "var(--cat-parents)"
  };
  const BRIDE_CATS = ["예식 준비", "스드메", "신혼집", "신혼여행", "부모님"];
  const CAT_KEY = {
    "예식 준비": "ceremony",
    "스드메": "sdm",
    "신혼집": "home",
    "신혼여행": "honeymoon",
    "부모님": "parents"
  };

  function itemText(item) {
    return typeof item === 'object' ? item.text : item;
  }

  // 캘린더 전체요약의 항목(상위 개념)이 카테고리 컬럼의 하위 항목 여러 개를
  // 아우르는 경우를 추적하는 목록. 하위 항목이 몇 개인지, 그중 몇 개가 체크됐는지를
  // 비교해 상위 체크박스를 전체 체크/부분 체크/미체크 상태로 맞춘다
  const groups = [];

  function isChecked(id) {
    return localStorage.getItem(id) === '1';
  }

  function setChecked(id, checked) {
    if (checked) localStorage.setItem(id, '1');
    else localStorage.removeItem(id);
    document.querySelectorAll(`input[data-sync-id="${id}"]`).forEach(el => {
      el.checked = checked;
    });
  }

  function refreshGroup(group) {
    const total = group.childIds.length;
    const checkedCount = group.childIds.filter(isChecked).length;
    group.cb.checked = checkedCount === total;
    group.cb.indeterminate = checkedCount > 0 && checkedCount < total;
  }

  function refreshAllGroups() {
    groups.forEach(refreshGroup);
  }

  function checkboxRow(id, text, dotColor, childIds) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'tl-check';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.syncId = id;

    if (childIds && childIds.length) {
      const group = { cb, childIds };
      groups.push(group);
      refreshGroup(group);
      cb.addEventListener('change', () => {
        childIds.forEach(cid => setChecked(cid, cb.checked));
        refreshAllGroups();
      });
    } else {
      cb.checked = isChecked(id);
      cb.addEventListener('change', () => {
        setChecked(id, cb.checked);
        refreshAllGroups();
      });
    }
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

  function emptyNote() {
    const div = document.createElement('div');
    div.className = 'tl-empty';
    div.textContent = '— 해당 없음';
    return div;
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

  function monthRow(dday, tag) {
    const row = document.createElement('div');
    row.className = 'tl-row';

    const ddayEl = document.createElement('div');
    ddayEl.className = 'tl-dday';
    if (tag) ddayEl.innerHTML = `${dday} <span class="tl-tag">[${tag}]</span>`;
    else ddayEl.textContent = dday;
    row.appendChild(ddayEl);

    return row;
  }

  function legend() {
    const wrap = document.createElement('div');
    wrap.className = 'tl-legend';
    BRIDE_CATS.forEach(cat => {
      const item = document.createElement('span');
      item.className = 'tl-legend-item';

      const dot = document.createElement('span');
      dot.className = 'tl-legend-dot';
      dot.style.background = CAT_VAR[cat];
      item.appendChild(dot);
      item.appendChild(document.createTextNode(cat));

      wrap.appendChild(item);
    });
    return wrap;
  }

  function columnShell(headerText, headerClass) {
    const wrap = document.createElement('div');

    const header = document.createElement('span');
    header.className = `tl-col-header ${headerClass}`;
    header.textContent = headerText;
    wrap.appendChild(header);

    const col = document.createElement('div');
    col.className = 'tl-column';
    wrap.appendChild(col);

    return { wrap, col, header };
  }

  function renderSummaryColumn(col, catFilter) {
    TIMELINE_SUMMARY.forEach((month, mi) => {
      // 원본 위치(ii)를 먼저 붙인 뒤 걸러야 카테고리로 필터링해도 항목의
      // localStorage id(timeline-summary-m{mi}-i{ii})가 흔들리지 않는다
      const items = month.items
        .map((it, ii) => ({ it, ii }))
        .filter(({ it }) => !catFilter || it.cat === catFilter);

      const row = monthRow(month.dday, month.tag);
      if (items.length) {
        const ul = document.createElement('ul');
        ul.className = 'tl-items';
        items.forEach(({ it, ii }) => {
          const id = `timeline-summary-m${mi}-i${ii}`;
          // items with known brideIndexes act as a parent over the matching
          // 카테고리 컬럼 entries, so its check state is derived from them
          const childIds = (it.cat === '스드메' || it.cat === '신혼집') && it.brideIndexes
            ? it.brideIndexes.map(idx => `bride-m${mi}-${it.cat}-${idx}`.replace(/\s/g, ''))
            : null;
          ul.appendChild(checkboxRow(id, it.text, CAT_VAR[it.cat] || 'var(--ink)', childIds));
        });
        row.appendChild(ul);
      } else {
        row.appendChild(emptyNote());
      }
      col.appendChild(row);
    });
  }

  function renderBrideCategoryColumn(col, cat) {
    CALENDAR_BRIDE.months.forEach((month, mi) => {
      const row = monthRow(month.dday);
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
      } else {
        row.appendChild(emptyNote());
      }
      col.appendChild(row);
    });
  }

  const columnsEl = document.getElementById('tl-columns');
  const categoryTabs = Array.from(document.querySelectorAll('#category-tabs button'));

  const state = {
    category: localStorage.getItem('timeline-category') || 'all'
  };

  function render() {
    // 탭을 바꿀 때마다 컬럼을 통째로 다시 그리므로, 이전 렌더에서 등록된
    // group을 비우지 않으면 화면에서 사라진 체크박스를 가리키는 좀비 group이
    // 쌓여 부분체크 계산이 어긋난다
    groups.length = 0;
    columnsEl.innerHTML = '';

    const catFilter = state.category === 'all' ? null : state.category;
    columnsEl.classList.toggle('dense', !catFilter);
    columnsEl.classList.toggle('two-col', !!catFilter);

    const summary = columnShell('캘린더 전체요약', 'summary');
    if (!catFilter) summary.wrap.insertBefore(legend(), summary.col);
    renderSummaryColumn(summary.col, catFilter);
    columnsEl.appendChild(summary.wrap);

    const cats = catFilter ? [catFilter] : BRIDE_CATS;
    cats.forEach(cat => {
      const column = columnShell(`${cat} 전체`, CAT_KEY[cat]);
      renderBrideCategoryColumn(column.col, cat);
      columnsEl.appendChild(column.wrap);
    });
  }

  categoryTabs.forEach(b => b.addEventListener('click', () => {
    state.category = b.dataset.category;
    localStorage.setItem('timeline-category', state.category);
    categoryTabs.forEach(x => x.classList.toggle('active', x === b));
    render();
  }));

  categoryTabs.forEach(b => b.classList.toggle('active', b.dataset.category === state.category));
  render();
})();
