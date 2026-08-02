(function () {
  const DATA = { bride: CALENDAR_BRIDE, groom: CALENDAR_GROOM };
  const grid = document.getElementById('grid');
  const genderTabs = Array.from(document.querySelectorAll('.gender-tabs button'));
  const categoryTabsEl = document.getElementById('category-tabs');
  const categoryTabs = Array.from(categoryTabsEl.querySelectorAll('button'));

  const state = {
    gender: WeddingStore.get('calendar-gender') || 'bride',
    category: WeddingStore.get('calendar-category') || 'all'
  };

  function checkboxItem(id, text) {
    const label = document.createElement('label');
    label.className = 'item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = WeddingStore.get(id) === '1';
    cb.addEventListener('change', () => {
      if (cb.checked) WeddingStore.set(id, '1');
      else WeddingStore.remove(id);
    });

    const span = document.createElement('span');
    span.textContent = text;

    label.appendChild(cb);
    label.appendChild(span);
    return label;
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

  function partialNote(color) {
    const note = document.createElement('div');
    note.className = 'partial-note';
    note.style.color = color;
    note.textContent = '※ 원본 이미지 일부가 가려져 있어 항목이 불완전합니다';
    return note;
  }

  function renderBrideMonth(month, mi, categoryFilter) {
    const entries = Object.entries(month.sections)
      .filter(([secName]) => categoryFilter === 'all' || secName === categoryFilter);
    if (!entries.length) return null;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span class="dday">${month.dday}</span><span class="alt">or ${month.alt}</span>`;

    if (month.partial) card.appendChild(partialNote('var(--accent-bride)'));

    entries.forEach(([secName, items]) => {
      const section = document.createElement('div');
      section.className = 'section';

      const title = document.createElement('div');
      title.className = 'section-title';
      title.style.color = 'var(--accent-bride)';
      title.innerHTML = `<span>${CALENDAR_BRIDE.icons[secName] || ''}</span><span>${secName}</span>`;
      section.appendChild(title);

      const ul = document.createElement('ul');
      ul.className = 'items';

      items.forEach((item, ii) => {
        const isObj = typeof item === 'object';
        const text = isObj ? item.text : item;
        const id = resolveCheckId(`bride-m${mi}-${secName}-${ii}`.replace(/\s/g, ''), item);

        const li = document.createElement('li');
        li.appendChild(checkboxItem(id, text));
        if (isObj && item.sub) li.appendChild(subList(item.sub));
        ul.appendChild(li);
      });

      section.appendChild(ul);
      card.appendChild(section);
    });

    return card;
  }

  function renderGroomMonth(month, mi, categoryFilter) {
    // keep each block's original index (bi) for its localStorage id, so
    // checked state stays put no matter which category filter is active
    const blocks = month.blocks
      .map((block, bi) => ({ block, bi }))
      .filter(({ block }) => categoryFilter === 'all' || block.cat === categoryFilter);
    if (!blocks.length) return null;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span class="dday">${month.dday}</span><span class="alt">or ${month.alt}</span>`;

    if (month.partial) card.appendChild(partialNote('var(--accent-groom)'));

    const ul = document.createElement('ul');
    ul.className = 'items';
    ul.style.marginTop = '14px';

    blocks.forEach(({ block, bi }) => {
      const li = document.createElement('li');

      if (block.type === 'item') {
        const id = resolveCheckId(`groom-m${mi}-item${bi}`, block);
        li.appendChild(checkboxItem(id, block.text));
        if (block.sub) li.appendChild(subList(block.sub));
      } else if (block.type === 'tip') {
        const box = document.createElement('div');
        box.className = 'tip-box';

        const title = document.createElement('div');
        title.className = 'tip-title';
        title.style.color = 'var(--accent-groom)';
        title.textContent = 'tip ' + block.title;
        box.appendChild(title);

        const tipUl = document.createElement('ul');
        tipUl.className = 'items';
        block.items.forEach((t, ti) => {
          const tipLi = document.createElement('li');
          tipLi.appendChild(checkboxItem(`groom-m${mi}-tip${bi}-${ti}`, t));
          tipUl.appendChild(tipLi);
        });
        box.appendChild(tipUl);
        li.appendChild(box);
      } else if (block.type === 'fields') {
        const box = document.createElement('div');
        box.className = 'fields-box';

        block.labels.forEach(label => {
          const id = `groom-m${mi}-field-${label}`;
          const inputId = `field-m${mi}-${bi}-${label}`;
          const wrap = document.createElement('div');
          wrap.className = 'field';

          const lab = document.createElement('label');
          lab.textContent = label;
          lab.htmlFor = inputId;

          const input = document.createElement('input');
          input.type = 'text';
          input.id = inputId;
          input.value = WeddingStore.get(id) || '';
          input.addEventListener('input', () => {
            if (input.value) WeddingStore.set(id, input.value);
            else WeddingStore.remove(id);
          });

          wrap.appendChild(lab);
          wrap.appendChild(input);
          box.appendChild(wrap);
        });

        li.appendChild(box);
      }

      ul.appendChild(li);
    });

    card.appendChild(ul);
    return card;
  }

  function render() {
    grid.innerHTML = '';
    const renderMonth = state.gender === 'bride' ? renderBrideMonth : renderGroomMonth;
    DATA[state.gender].months.forEach((month, mi) => {
      const card = renderMonth(month, mi, state.category);
      if (card) grid.appendChild(card);
    });
  }

  // 데이터를 다시 훑지 않고, 지금 화면에 렌더링된 카드(현재 필터·체크
  // 상태 그대로)를 그대로 읽어 이미지 렌더러용 카드 데이터로 옮긴다 —
  // 렌더링 로직과 별도로 유지보수할 필요가 없도록 항상 화면과 일치시키기
  // 위함.
  function accentColor() {
    return ShareImage.cssVar(state.gender === 'bride' ? '--accent-bride' : '--accent-groom');
  }

  function appendItemRecords(ul, records) {
    if (!ul) return;
    Array.from(ul.children).forEach(li => {
      const label = li.querySelector(':scope > label.item');
      if (label) {
        const cb = label.querySelector('input[type="checkbox"]');
        const text = label.querySelector('span').textContent.trim();
        records.push({ type: 'item', text, checked: cb.checked });
        const sub = li.querySelector(':scope > ul.sub');
        if (sub) Array.from(sub.children).forEach(s => records.push({ type: 'sub', text: s.textContent.trim().replace(/^–\s*/, '') }));
        return;
      }
      const tipBox = li.querySelector(':scope > .tip-box');
      if (tipBox) {
        const tipTitle = tipBox.querySelector('.tip-title');
        if (tipTitle) records.push({ type: 'section', text: tipTitle.textContent.trim(), color: accentColor() });
        appendItemRecords(tipBox.querySelector('ul.items'), records);
        return;
      }
      const fieldsBox = li.querySelector(':scope > .fields-box');
      if (fieldsBox) {
        fieldsBox.querySelectorAll('.field').forEach(field => {
          const lab = field.querySelector('label').textContent.trim();
          const val = field.querySelector('input').value.trim();
          records.push({ type: 'field', text: `${lab}: ${val || '(미입력)'}` });
        });
      }
    });
  }

  function buildShareCards() {
    const accent = accentColor();
    return Array.from(grid.children).map(card => {
      const records = [];
      const dday = card.querySelector('.dday').textContent.trim();
      const alt = card.querySelector('.alt').textContent.trim();
      records.push({ type: 'dday', text: `${dday}${alt ? ' ' + alt : ''}` });

      const partial = card.querySelector('.partial-note');
      if (partial) records.push({ type: 'note', text: partial.textContent.trim() });

      const sections = card.querySelectorAll(':scope > .section');
      if (sections.length) {
        sections.forEach(section => {
          records.push({ type: 'section', text: section.querySelector('.section-title').textContent.trim(), color: accent });
          appendItemRecords(section.querySelector('ul.items'), records);
        });
      } else {
        appendItemRecords(card.querySelector(':scope > ul.items'), records);
      }
      return { records };
    });
  }

  function setActive(tabs, isActive) {
    tabs.forEach(x => {
      const active = isActive(x);
      x.classList.toggle('active', active);
      x.setAttribute('aria-pressed', String(active));
    });
  }

  genderTabs.forEach(b => b.addEventListener('click', () => {
    state.gender = b.dataset.gender;
    WeddingStore.set('calendar-gender', state.gender);
    setActive(genderTabs, x => x === b);
    render();
  }));

  categoryTabs.forEach(b => b.addEventListener('click', () => {
    state.category = b.dataset.category;
    WeddingStore.set('calendar-category', state.category);
    setActive(categoryTabs, x => x === b);
    render();
  }));

  setActive(genderTabs, b => b.dataset.gender === state.gender);
  setActive(categoryTabs, b => b.dataset.category === state.category);
  render();

  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const genderLabel = state.gender === 'bride' ? '신부용' : '신랑용';
      const catLabel = state.category === 'all' ? '전체' : state.category;
      ShareImage.copyCalendarImage(`결혼 준비 캘린더 (${genderLabel} · ${catLabel})`, buildShareCards(), copyFeedback);
    });
  }

  if (!WeddingStore.available) {
    const footer = document.querySelector('.site-footer');
    if (footer) footer.textContent = '이 브라우저에서는 체크 상태와 입력값이 저장되지 않습니다 (프라이빗 모드이거나 사이트 데이터가 차단되어 있을 수 있습니다).';
  }
})();
