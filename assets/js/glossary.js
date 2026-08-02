(function () {
  const container = document.getElementById('glossary');

  GLOSSARY.sections.forEach(sec => {
    const section = document.createElement('div');
    section.className = 'glossary-section' + (sec.unconfirmed ? ' unconfirmed' : '');

    const h3 = document.createElement('h3');
    h3.textContent = `${sec.no} ${sec.title}`;
    section.appendChild(h3);

    if (sec.unconfirmed) {
      const hint = document.createElement('div');
      hint.className = 'section-hint';
      hint.textContent = '※ 원본 이미지에서 뱃지에 가려 용어명을 확인하지 못했습니다';
      section.appendChild(hint);
    }

    sec.terms.forEach(t => {
      const row = document.createElement('div');
      row.className = 'glossary-row';

      const term = document.createElement('span');
      if (t.term) {
        term.className = 'glossary-term' + (t.uncertainTerm ? ' uncertain' : '');
        term.textContent = t.term + (t.uncertainTerm ? ' ?' : '');
      } else {
        term.className = 'glossary-term unknown';
        term.textContent = '(확인 필요)';
      }
      row.appendChild(term);

      const def = document.createElement('span');
      def.className = 'glossary-def';
      def.textContent = t.def;
      row.appendChild(def);

      section.appendChild(row);
    });

    container.appendChild(section);
  });
})();
