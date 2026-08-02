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

  function checkboxRow(id, text, dotColor) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'tl-check';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.syncId = id;
    cb.checked = isChecked(id);
    cb.addEventListener('change', () => setChecked(id, cb.checked));
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

  function summaryHasCat(cat) {
    return TIMELINE_SUMMARY.some(month => month.items.some(it => it.cat === cat));
  }

  function legend() {
    const wrap = document.createElement('div');
    wrap.className = 'tl-legend';
    // 전체요약에 실제로 등장하는 카테고리만 표시한다 — 항목이 하나도 없는
    // 카테고리(예: 부모님)까지 넣으면 범례에 죽은 항목이 생긴다
    BRIDE_CATS.filter(summaryHasCat).forEach(cat => {
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
      // 큐레이션 항목(it)이 brideIndexes를 가지면, 그 인덱스가 가리키는 실제
      // 캘린더 항목을 찾아 원문 그대로 한 줄씩 보여준다 — 문구를 따로 갖지
      // 않으므로 캘린더 쪽 문구를 고치면 여기도 항상 그대로 반영된다.
      // brideIndexes가 없는 예외 항목(D-6 신혼집 등, 원본 캘린더에 대응하는
      // 데이터 자체가 없는 경우)만 자기 text를 그대로 쓴다
      const rows = [];
      month.items.forEach((it, ii) => {
        if (catFilter && it.cat !== catFilter) return;
        if (it.brideIndexes) {
          it.brideIndexes.forEach(idx => {
            const brideItem = (CALENDAR_BRIDE.months[mi].sections[it.cat] || [])[idx];
            // same id scheme as renderBrideCategoryColumn, so checking here
            // stays in sync with the calendar tool (and the groom side via
            // resolveCheckId when the underlying bride item has a link)
            const defaultId = `bride-m${mi}-${it.cat}-${idx}`.replace(/\s/g, '');
            rows.push({ id: resolveCheckId(defaultId, brideItem), text: itemText(brideItem), cat: it.cat });
          });
        } else {
          rows.push({ id: `timeline-summary-m${mi}-i${ii}`, text: it.text, cat: it.cat });
        }
      });

      const row = monthRow(month.dday, month.tag);
      if (rows.length) {
        const ul = document.createElement('ul');
        ul.className = 'tl-items';
        rows.forEach(r => {
          ul.appendChild(checkboxRow(r.id, r.text, CAT_VAR[r.cat] || 'var(--ink)'));
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
          const id = resolveCheckId(`bride-m${mi}-${cat}-${ii}`.replace(/\s/g, ''), item);
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

  function renderGroomCategoryColumn(col, cat) {
    CALENDAR_GROOM.months.forEach((month, mi) => {
      const row = monthRow(month.dday);
      // 원본 위치(bi)를 먼저 붙인 뒤 걸러야 calendar.js의 renderGroomMonth와
      // 동일한 groom-m{mi}-item{bi} / groom-m{mi}-tip{bi}-{ti} id가 나온다.
      // fields(일정·장소 텍스트 입력)는 체크박스가 아니라 제외한다
      const blocks = month.blocks
        .map((block, bi) => ({ block, bi }))
        .filter(({ block }) => block.cat === cat && block.type !== 'fields');

      if (blocks.length) {
        const ul = document.createElement('ul');
        ul.className = 'tl-items';
        blocks.forEach(({ block, bi }) => {
          if (block.type === 'item') {
            // 신랑용 id에는 bride와 달리 .replace(/\s/g, '')를 적용하지 않는다 —
            // calendar.js가 그렇게 만들지 않으므로 여기서도 그대로 맞춘다
            const id = resolveCheckId(`groom-m${mi}-item${bi}`, block);
            const li = checkboxRow(id, block.text);
            if (block.sub) li.appendChild(subList(block.sub));
            ul.appendChild(li);
          } else if (block.type === 'tip') {
            const label = document.createElement('li');
            label.className = 'tl-tip-label';
            label.textContent = 'tip ' + block.title;
            ul.appendChild(label);
            block.items.forEach((t, ti) => {
              ul.appendChild(checkboxRow(`groom-m${mi}-tip${bi}-${ti}`, t));
            });
          }
        });
        row.appendChild(ul);
      } else {
        row.appendChild(emptyNote());
      }
      col.appendChild(row);
    });
  }

  const columnsEl = document.getElementById('tl-columns');
  const genderTabs = Array.from(document.querySelectorAll('#gender-tabs button'));
  const categoryTabs = Array.from(document.querySelectorAll('#category-tabs button'));

  const state = {
    gender: localStorage.getItem('timeline-gender') || 'bride',
    category: localStorage.getItem('timeline-category') || 'all'
  };

  function render() {
    columnsEl.innerHTML = '';

    const catFilter = state.category === 'all' ? null : state.category;
    const isBride = state.gender === 'bride';
    columnsEl.classList.toggle('dense', !catFilter);
    columnsEl.classList.toggle('two-col', !!catFilter && isBride);
    columnsEl.classList.toggle('one-col', !!catFilter && !isBride);

    if (isBride) {
      const summary = columnShell('캘린더 전체요약', 'summary');
      if (!catFilter) {
        summary.wrap.insertBefore(legend(), summary.col);
      } else if (!summaryHasCat(catFilter)) {
        const note = document.createElement('div');
        note.className = 'tl-empty';
        note.textContent = '전체요약에는 아직 이 카테고리 항목이 없습니다. 오른쪽에서 전체 항목을 확인하세요.';
        summary.wrap.insertBefore(note, summary.col);
      }
      renderSummaryColumn(summary.col, catFilter);
      columnsEl.appendChild(summary.wrap);
    }

    const cats = catFilter ? [catFilter] : BRIDE_CATS;
    cats.forEach(cat => {
      const column = columnShell(`${cat} 전체`, CAT_KEY[cat]);
      if (isBride) renderBrideCategoryColumn(column.col, cat);
      else renderGroomCategoryColumn(column.col, cat);
      columnsEl.appendChild(column.wrap);
    });
  }

  genderTabs.forEach(b => b.addEventListener('click', () => {
    state.gender = b.dataset.gender;
    localStorage.setItem('timeline-gender', state.gender);
    genderTabs.forEach(x => x.classList.toggle('active', x === b));
    render();
  }));

  categoryTabs.forEach(b => b.addEventListener('click', () => {
    state.category = b.dataset.category;
    localStorage.setItem('timeline-category', state.category);
    categoryTabs.forEach(x => x.classList.toggle('active', x === b));
    render();
  }));

  genderTabs.forEach(b => b.classList.toggle('active', b.dataset.gender === state.gender));
  categoryTabs.forEach(b => b.classList.toggle('active', b.dataset.category === state.category));
  render();
})();
