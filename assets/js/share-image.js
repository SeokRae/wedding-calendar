// 캘린더 카드/타임라인 칼럼을 실제 화면과 같은 다단 그리드·배지·색상으로
// PNG 이미지에 직접 그려 클립보드에 복사하는 공통 렌더러.
//
// 원래는 실제 DOM을 SVG(foreignObject)로 감싸 캔버스에 그리는 방식을
// 시도했지만, Chrome은 foreignObject가 든 SVG를 캔버스에 그리면 그 캔버스를
// "오염(tainted)"된 것으로 취급해 toBlob/toDataURL을 막는다 — 이 정책에는
// 우회 방법이 없다. 그래서 카드·배지·점 같은 알려진 컴포넌트만 Canvas 2D로
// 직접 재현한다. calendar.js·timeline.js가 화면에 보이는 내용을 구조화된
// 데이터로 만들어 넘기면 이 파일이 그리기와 클립보드 쓰기를 담당한다.
const ShareImage = (function () {
  const SCALE = 2; // 고해상도 출력을 위한 배율

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function wrapText(ctx, text, maxWidth) {
    const chars = Array.from(text);
    const lines = [];
    let line = '';
    chars.forEach(ch => {
      const test = line + ch;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // records 항목 종류:
  //  - { type:'dday', text, color } 카드/칼럼 안의 D-day 소제목
  //  - { type:'section', text, color } 카테고리·팁 섹션 제목
  //  - { type:'item', text, checked, badge?:{text,bg|gradient}, dot?:color }
  //  - { type:'field', text } 체크박스 없는 라벨:값 한 줄 (신랑용 일정·장소 입력)
  //  - { type:'sub', text } 작은 들여쓰기 보조 설명
  //  - { type:'note', text } 경고색 안내문
  //  - { type:'legend', items:[{label,color}] } 범례
  //  - { type:'spacer', size }
  // indent: 이 블록의 모든 항목 줄이 공통으로 쓰는 본문 들여쓰기(px) —
  // dot이 있는 칼럼(캘린더 전체요약)은 더 크게 잡아 dot 자리를 확보한다.
  function layoutBlock(ctx, records, contentWidth, indent) {
    const ink = cssVar('--ink');
    const subInk = cssVar('--sub-ink');
    const ops = [];
    let y = 0;

    records.forEach(r => {
      if (r.type === 'dday') {
        y += 12;
        ctx.font = 'bold 15px Georgia, "Times New Roman", serif';
        ops.push({ type: 'dday', text: r.text, y, font: ctx.font, color: r.color || ink });
        y += 6;
        ops.push({ type: 'rule', y });
        y += 12;
      } else if (r.type === 'section') {
        ctx.font = 'bold 12px "Apple SD Gothic Neo", sans-serif';
        ops.push({ type: 'section', text: r.text, y, font: ctx.font, color: r.color || ink });
        y += 18;
      } else if (r.type === 'note') {
        ctx.font = '10.5px "Apple SD Gothic Neo", sans-serif';
        wrapText(ctx, r.text, contentWidth).forEach(line => {
          ops.push({ type: 'note', text: line, y, font: ctx.font });
          y += 14;
        });
      } else if (r.type === 'legend') {
        ctx.font = '10px "Apple SD Gothic Neo", sans-serif';
        ops.push({ type: 'legend', items: r.items, y, font: ctx.font });
        y += 20;
      } else if (r.type === 'item') {
        ctx.font = '12.5px "Apple SD Gothic Neo", sans-serif';
        const lines = wrapText(ctx, r.text, contentWidth - indent);
        lines.forEach((line, li) => {
          const isLast = li === lines.length - 1;
          ops.push({
            type: 'item-line', text: line, y, indent,
            checked: r.checked, first: li === 0,
            dot: li === 0 ? r.dot : null,
            badge: isLast ? r.badge : null,
            font: ctx.font
          });
          y += 17;
        });
      } else if (r.type === 'field') {
        ctx.font = '12.5px "Apple SD Gothic Neo", sans-serif';
        wrapText(ctx, r.text, contentWidth).forEach(line => {
          ops.push({ type: 'field', text: line, y, font: ctx.font });
          y += 17;
        });
      } else if (r.type === 'sub') {
        ctx.font = '10.5px "Apple SD Gothic Neo", sans-serif';
        wrapText(ctx, '– ' + r.text, contentWidth - indent - 6).forEach(line => {
          ops.push({ type: 'sub-line', text: line, y, indent, font: ctx.font });
          y += 13;
        });
      } else if (r.type === 'spacer') {
        y += r.size || 10;
      }
    });

    return { ops, height: y };
  }

  function badgeFill(ctx, badge, x, y, w, h) {
    if (badge.gradient) {
      const grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, badge.gradient[0]);
      grad.addColorStop(1, badge.gradient[1]);
      return grad;
    }
    return badge.bg;
  }

  function drawBlock(ctx, ops, contentWidth) {
    const ink = cssVar('--ink');
    const subInk = cssVar('--sub-ink');
    const border = cssVar('--border');

    ops.forEach(op => {
      if (op.font) ctx.font = op.font;

      if (op.type === 'dday') {
        ctx.fillStyle = op.color;
        ctx.fillText(op.text, 0, op.y);
      } else if (op.type === 'rule') {
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, op.y);
        ctx.lineTo(contentWidth, op.y);
        ctx.stroke();
      } else if (op.type === 'section') {
        ctx.fillStyle = op.color;
        ctx.fillText(op.text, 0, op.y);
        ctx.strokeStyle = op.color;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(0, op.y + 5);
        ctx.lineTo(contentWidth, op.y + 5);
        ctx.stroke();
      } else if (op.type === 'note') {
        ctx.fillStyle = '#B5533E';
        ctx.fillText(op.text, 0, op.y);
      } else if (op.type === 'legend') {
        let lx = 0;
        op.items.forEach(it => {
          ctx.fillStyle = it.color;
          ctx.beginPath();
          ctx.arc(lx + 3, op.y - 3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = subInk;
          ctx.fillText(it.label, lx + 10, op.y);
          lx += ctx.measureText(it.label).width + 22;
        });
      } else if (op.type === 'field') {
        ctx.fillStyle = ink;
        ctx.fillText(op.text, 0, op.y);
      } else if (op.type === 'sub-line') {
        ctx.fillStyle = subInk;
        ctx.fillText(op.text, op.indent, op.y);
      } else if (op.type === 'item-line') {
        if (op.first) {
          const boxY = op.y - 9;
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(0, boxY, 11, 11);
          if (op.checked) {
            ctx.fillStyle = ink;
            ctx.fillRect(2, boxY + 2, 7, 7);
          }
          if (op.dot) {
            ctx.fillStyle = op.dot;
            ctx.beginPath();
            ctx.arc(19, op.y - 4, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = op.checked ? subInk : ink;
        ctx.fillText(op.text, op.indent, op.y);
        if (op.checked) {
          const w = ctx.measureText(op.text).width;
          ctx.strokeStyle = subInk;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(op.indent, op.y - 4);
          ctx.lineTo(op.indent + w, op.y - 4);
          ctx.stroke();
        }
        if (op.badge) {
          const textW = ctx.measureText(op.text).width;
          ctx.font = 'bold 9px "Apple SD Gothic Neo", sans-serif';
          const bw = ctx.measureText(op.badge.text).width + 12;
          const bx = op.indent + textW + 8;
          roundedRectPath(ctx, bx, op.y - 11, bw, 15, 7.5);
          ctx.fillStyle = badgeFill(ctx, op.badge, bx, op.y - 11, bw, 15);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.textBaseline = 'middle';
          ctx.fillText(op.badge.text, bx + 6, op.y - 3.5);
          ctx.textBaseline = 'alphabetic';
        }
      }
    });
  }

  function drawHeaderPill(ctx, text, bg, x, y) {
    ctx.font = 'bold 13px "Apple SD Gothic Neo", sans-serif';
    const w = ctx.measureText(text).width + 28;
    roundedRectPath(ctx, x, y, w, 26, 13);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 14, y + 14);
    ctx.textBaseline = 'alphabetic';
    return 26;
  }

  function makeCanvas(width, height, bg) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * SCALE);
    canvas.height = Math.ceil(height * SCALE);
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    return { canvas, ctx };
  }

  function toBlob(canvas) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }

  // === 캘린더: 카드를 4단 그리드(실제 화면과 같은 열 수)로 배치 ===
  function renderCalendarBlob(title, cards) {
    const COLS = 4;
    const CARD_W = 300;
    const GAP = 20;
    const PAD = 26;
    const TITLE_H = 34;
    const ink = cssVar('--ink');
    const cardBg = cssVar('--card-bg');
    const border = cssVar('--border');

    const measure = document.createElement('canvas').getContext('2d');
    const laidOut = cards.map(card => layoutBlock(measure, card.records, CARD_W - 24, 18));

    const rows = [];
    for (let i = 0; i < laidOut.length; i += COLS) rows.push(laidOut.slice(i, i + COLS));
    const rowHeights = rows.map(row => Math.max(...row.map(c => c.height)) + 36); // 카드 padding

    const width = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
    const height = PAD * 2 + TITLE_H + rowHeights.reduce((a, b) => a + b + GAP, 0);

    const { canvas, ctx } = makeCanvas(width, height, cssVar('--bg'));
    ctx.font = 'bold 17px "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = ink;
    ctx.fillText(title, PAD, PAD + 14);

    let y = PAD + TITLE_H;
    rows.forEach((row, ri) => {
      const rh = rowHeights[ri];
      row.forEach((laid, ci) => {
        const x = PAD + ci * (CARD_W + GAP);
        roundedRectPath(ctx, x, y, CARD_W, rh, 10);
        ctx.fillStyle = cardBg;
        ctx.fill();
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.translate(x + 16, y + 22);
        drawBlock(ctx, laid.ops, CARD_W - 24);
        ctx.restore();
      });
      y += rh + GAP;
    });

    return toBlob(canvas);
  }

  // === 타임라인: 칼럼을 나란히(실제 화면과 같은 구성) 배치 ===
  function renderTimelineBlob(title, columns) {
    const COL_W = 300;
    const GAP = 28;
    const PAD = 26;
    const TITLE_H = 34;
    const HEADER_H = 40;
    const ink = cssVar('--ink');
    const border = cssVar('--border');

    const measure = document.createElement('canvas').getContext('2d');
    const laidOut = columns.map(col => layoutBlock(measure, col.records, COL_W - 14, col.indent || 18));

    const width = PAD * 2 + columns.length * COL_W + (columns.length - 1) * GAP;
    const height = PAD * 2 + TITLE_H + HEADER_H + Math.max(...laidOut.map(c => c.height)) + 10;

    const { canvas, ctx } = makeCanvas(width, height, cssVar('--bg'));
    ctx.font = 'bold 17px "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = ink;
    ctx.fillText(title, PAD, PAD + 14);

    columns.forEach((col, i) => {
      const x = PAD + i * (COL_W + GAP);
      const headerY = PAD + TITLE_H;
      drawHeaderPill(ctx, col.header, col.headerColor, x, headerY);

      const contentY = headerY + HEADER_H;
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, contentY);
      ctx.lineTo(x, contentY + laidOut[i].height + 10);
      ctx.stroke();

      ctx.save();
      ctx.translate(x + 14, contentY + 14);
      drawBlock(ctx, laidOut[i].ops, COL_W - 14);
      ctx.restore();
    });

    return toBlob(canvas);
  }

  async function finalizeAndCopy(blobPromise, feedbackEl) {
    function showFeedback(text) {
      if (!feedbackEl) return;
      feedbackEl.textContent = text;
      feedbackEl.classList.add('show');
      clearTimeout(feedbackEl._hideTimer);
      feedbackEl._hideTimer = setTimeout(() => feedbackEl.classList.remove('show'), 2500);
    }

    let blob;
    try {
      blob = await blobPromise;
    } catch (e) {
      blob = null;
    }
    if (!blob) {
      showFeedback('이미지 생성에 실패했습니다');
      return;
    }

    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showFeedback('이미지가 복사되었습니다');
        return;
      } catch (e) {
        // 클립보드 이미지 쓰기가 막힌 환경(권한 거부, 일부 모바일 브라우저)은
        // 아래 다운로드 폴백으로 넘어간다
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-checklist.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showFeedback('이미지를 다운로드했습니다');
  }

  function copyCalendarImage(title, cards, feedbackEl) {
    return finalizeAndCopy(renderCalendarBlob(title, cards), feedbackEl);
  }

  function copyTimelineImage(title, columns, feedbackEl) {
    return finalizeAndCopy(renderTimelineBlob(title, columns), feedbackEl);
  }

  return { copyCalendarImage, copyTimelineImage, cssVar };
})();
