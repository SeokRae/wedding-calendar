(function () {
  const CAT_VAR = {
    "예식 준비": "var(--cat-ceremony)",
    "스드메": "var(--cat-sdm)",
    "신혼집": "var(--cat-home)",
    "신혼여행": "var(--cat-honeymoon)",
    "부모님": "var(--cat-parents)"
  };
  const CATS = ["예식 준비", "스드메", "신혼집", "신혼여행", "부모님"];
  const CAT_KEY = {
    "예식 준비": "ceremony",
    "스드메": "sdm",
    "신혼집": "home",
    "신혼여행": "honeymoon",
    "부모님": "parents"
  };
  const SOURCE_LABEL = { bride: '신부', groom: '신랑', both: '신랑·신부' };

  function itemText(item) {
    return typeof item === 'object' ? item.text : item;
  }

  function isChecked(id) {
    return WeddingStore.get(id) === '1';
  }

  function setChecked(id, checked) {
    if (checked) WeddingStore.set(id, '1');
    else WeddingStore.remove(id);
    document.querySelectorAll(`input[data-sync-id="${id}"]`).forEach(el => {
      el.checked = checked;
    });
  }

  function sourceBadge(source) {
    if (!source) return null;
    const span = document.createElement('span');
    span.className = 'tl-source tl-source-' + source;
    span.textContent = SOURCE_LABEL[source];
    return span;
  }

  function checkboxRow(id, text, dotColor, dotLabel, source) {
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
      if (dotLabel) dot.title = dotLabel;
      label.appendChild(dot);
    }

    const content = document.createElement('span');
    content.className = 'tl-check-content';
    const span = document.createElement('span');
    span.className = 'tl-check-text';
    span.textContent = text;
    content.appendChild(span);
    const badge = sourceBadge(source);
    if (badge) content.appendChild(badge);
    label.appendChild(content);

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
    CATS.filter(summaryHasCat).forEach(cat => {
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
      // 그 항목에 link가 있으면 신랑 쪽에도 같은 할 일이 있다는 뜻이므로
      // '신랑·신부' 배지를, 없으면 신부 큐레이션 전용 항목이므로 '신부'
      // 배지를 붙인다. brideIndexes가 없는 예외 항목(D-6 신혼집 등)도
      // 신부 큐레이션 전용이므로 '신부'로 표시한다
      const rows = [];
      month.items.forEach((it, ii) => {
        if (catFilter && it.cat !== catFilter) return;
        if (it.brideIndexes) {
          it.brideIndexes.forEach(idx => {
            const brideItem = (CALENDAR_BRIDE.months[mi].sections[it.cat] || [])[idx];
            const defaultId = `bride-m${mi}-${it.cat}-${idx}`.replace(/\s/g, '');
            const hasLink = typeof brideItem === 'object' && !!brideItem.link;
            rows.push({
              id: resolveCheckId(defaultId, brideItem),
              text: itemText(brideItem),
              cat: it.cat,
              source: hasLink ? 'both' : 'bride'
            });
          });
        } else {
          rows.push({ id: `timeline-summary-m${mi}-i${ii}`, text: it.text, cat: it.cat, source: 'bride' });
        }
      });

      const row = monthRow(month.dday, month.tag);
      if (rows.length) {
        const ul = document.createElement('ul');
        ul.className = 'tl-items';
        rows.forEach(r => {
          ul.appendChild(checkboxRow(r.id, r.text, CAT_VAR[r.cat] || 'var(--ink)', r.cat, r.source));
        });
        row.appendChild(ul);
      } else {
        row.appendChild(emptyNote());
      }
      col.appendChild(row);
    });
  }

  // 신부 sections와 신랑 blocks를 같은 카테고리끼리 한 칼럼에 합친다. 두
  // 항목이 같은 id로 묶이면(resolveCheckId가 link를 찾아 같은 id를 주면)
  // 신랑·신부가 같은 할 일을 가리키는 것이므로 한 줄로 합쳐 '신랑·신부'
  // 배지를 붙인다 — 이 id는 캘린더 도구에서도 그대로 쓰이므로, 어느 쪽
  // 화면에서 체크하든 체크 상태 자체가 하나로 공유된다(신랑만 체크했는데
  // 여기서는 안 된 것처럼 보이는 일이 생기지 않는다). link가 없어 한쪽
  // 데이터에만 있는 항목은 각각 '신부'/'신랑' 배지를 붙인다
  function renderCombinedCategoryColumn(col, cat) {
    CALENDAR_BRIDE.months.forEach((month, mi) => {
      const row = monthRow(month.dday);
      const brideItems = month.sections[cat] || [];
      const groomBlocks = CALENDAR_GROOM.months[mi].blocks
        .map((block, bi) => ({ block, bi }))
        .filter(({ block }) => block.cat === cat && block.type !== 'fields');

      const rows = [];
      const idToRow = new Map();

      brideItems.forEach((item, ii) => {
        const id = resolveCheckId(`bride-m${mi}-${cat}-${ii}`.replace(/\s/g, ''), item);
        const r = { id, text: itemText(item), sub: typeof item === 'object' ? item.sub : undefined, source: 'bride' };
        rows.push(r);
        idToRow.set(id, r);
      });

      const tipBlocks = [];
      groomBlocks.forEach(({ block, bi }) => {
        if (block.type === 'tip') {
          tipBlocks.push({ block, bi });
          return;
        }
        // 신랑용 id에는 bride와 달리 .replace(/\s/g, '')를 적용하지 않는다 —
        // calendar.js가 그렇게 만들지 않으므로 여기서도 그대로 맞춘다
        const id = resolveCheckId(`groom-m${mi}-item${bi}`, block);
        const existing = idToRow.get(id);
        if (existing) {
          existing.source = 'both';
          if (!existing.sub && block.sub) existing.sub = block.sub;
        } else {
          const r = { id, text: block.text, sub: block.sub, source: 'groom' };
          rows.push(r);
          idToRow.set(id, r);
        }
      });

      if (rows.length || tipBlocks.length) {
        const ul = document.createElement('ul');
        ul.className = 'tl-items';
        rows.forEach(r => {
          const li = checkboxRow(r.id, r.text, null, null, r.source);
          if (r.sub) li.appendChild(subList(r.sub));
          ul.appendChild(li);
        });
        tipBlocks.forEach(({ block, bi }) => {
          const label = document.createElement('li');
          label.className = 'tl-tip-label';
          label.textContent = 'tip ' + block.title;
          ul.appendChild(label);
          block.items.forEach((t, ti) => {
            ul.appendChild(checkboxRow(`groom-m${mi}-tip${bi}-${ti}`, t, null, null, 'groom'));
          });
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
    category: WeddingStore.get('timeline-category') || 'all'
  };

  function render() {
    columnsEl.innerHTML = '';

    const catFilter = state.category === 'all' ? null : state.category;
    columnsEl.classList.toggle('dense', !catFilter);
    columnsEl.classList.toggle('two-col', !!catFilter);

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

    const cats = catFilter ? [catFilter] : CATS;
    cats.forEach(cat => {
      const column = columnShell(`${cat} 전체`, CAT_KEY[cat]);
      renderCombinedCategoryColumn(column.col, cat);
      columnsEl.appendChild(column.wrap);
    });
  }

  function setActive(tabs, isActive) {
    tabs.forEach(x => {
      const active = isActive(x);
      x.classList.toggle('active', active);
      x.setAttribute('aria-pressed', String(active));
    });
  }

  categoryTabs.forEach(b => b.addEventListener('click', () => {
    state.category = b.dataset.category;
    WeddingStore.set('timeline-category', state.category);
    setActive(categoryTabs, x => x === b);
    render();
  }));

  setActive(categoryTabs, b => b.dataset.category === state.category);
  render();

  if (!WeddingStore.available) {
    const footer = document.querySelector('.site-footer');
    if (footer) footer.textContent = '이 브라우저에서는 체크 상태가 저장되지 않습니다 (프라이빗 모드이거나 사이트 데이터가 차단되어 있을 수 있습니다).';
  }
})();
