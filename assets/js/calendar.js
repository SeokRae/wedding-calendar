(function () {
  const DATA = { bride: CALENDAR_BRIDE, groom: CALENDAR_GROOM };
  const grid = document.getElementById('grid');
  const tabs = Array.from(document.querySelectorAll('.gender-tabs button'));

  function checkboxItem(id, text) {
    const label = document.createElement('label');
    label.className = 'item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = localStorage.getItem(id) === '1';
    cb.addEventListener('change', () => {
      if (cb.checked) localStorage.setItem(id, '1');
      else localStorage.removeItem(id);
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

  function renderBrideMonth(month, mi) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span class="dday">${month.dday}</span><span class="alt">or ${month.alt}</span>`;

    if (month.partial) card.appendChild(partialNote('var(--accent-bride)'));

    Object.entries(month.sections).forEach(([secName, items]) => {
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
        const id = `bride-m${mi}-${secName}-${ii}`.replace(/\s/g, '');

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

  function renderGroomMonth(month, mi) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span class="dday">${month.dday}</span><span class="alt">or ${month.alt}</span>`;

    if (month.partial) card.appendChild(partialNote('var(--accent-groom)'));

    const ul = document.createElement('ul');
    ul.className = 'items';
    ul.style.marginTop = '14px';

    month.blocks.forEach((block, bi) => {
      const li = document.createElement('li');

      if (block.type === 'item') {
        const id = `groom-m${mi}-item${bi}`;
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
          const wrap = document.createElement('div');
          wrap.className = 'field';

          const lab = document.createElement('label');
          lab.textContent = label;

          const input = document.createElement('input');
          input.type = 'text';
          input.value = localStorage.getItem(id) || '';
          input.addEventListener('input', () => {
            if (input.value) localStorage.setItem(id, input.value);
            else localStorage.removeItem(id);
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

  function render(gender) {
    grid.innerHTML = '';
    const renderMonth = gender === 'bride' ? renderBrideMonth : renderGroomMonth;
    DATA[gender].months.forEach((month, mi) => grid.appendChild(renderMonth(month, mi)));
  }

  function setGender(g) {
    localStorage.setItem('calendar-gender', g);
    tabs.forEach(b => b.classList.toggle('active', b.dataset.gender === g));
    render(g);
  }

  tabs.forEach(b => b.addEventListener('click', () => setGender(b.dataset.gender)));
  setGender(localStorage.getItem('calendar-gender') || 'bride');
})();
