// 구조화된 레코드 배열(제목/D-day/섹션/항목 등)을 카드형 PNG 이미지로 그려
// 클립보드에 이미지로 복사하는 공통 렌더러. 외부 라이브러리(html2canvas 등)
// 없이 Canvas 2D로 직접 그린다 — calendar.js·timeline.js가 화면에 보이는
// 내용을 레코드로 변환해 넘기면 이 파일이 드로잉과 클립보드 쓰기를 담당한다.
const ShareImage = (function () {
  const WIDTH = 640;
  const PADDING = 28;
  const SCALE = 2; // 고해상도(레티나급) 출력을 위한 배율

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

  function layout(ctx, records, contentWidth) {
    const ink = cssVar('--ink');
    const ops = [];
    let y = PADDING;

    records.forEach(r => {
      if (r.type === 'title') {
        ctx.font = 'bold 20px "Apple SD Gothic Neo", sans-serif';
        y += 8;
        ops.push({ type: r.type, text: r.text, y, font: ctx.font, color: ink });
        y += 30;
      } else if (r.type === 'dday') {
        y += 14;
        ctx.font = 'bold 16px Georgia, "Times New Roman", serif';
        ops.push({ type: r.type, text: r.text, y, font: ctx.font, color: ink });
        y += 22;
      } else if (r.type === 'section') {
        ctx.font = 'bold 13px "Apple SD Gothic Neo", sans-serif';
        ops.push({ type: r.type, text: r.text, y, font: ctx.font, color: r.color || ink });
        y += 20;
      } else if (r.type === 'item') {
        ctx.font = '13px "Apple SD Gothic Neo", sans-serif';
        const lines = wrapText(ctx, r.text, contentWidth - 24);
        lines.forEach((line, li) => {
          ops.push({ type: 'item-line', text: line, checked: r.checked, y, first: li === 0, font: ctx.font });
          y += 19;
        });
      } else if (r.type === 'sub') {
        ctx.font = '11.5px "Apple SD Gothic Neo", sans-serif';
        const lines = wrapText(ctx, '– ' + r.text, contentWidth - 34);
        lines.forEach(line => {
          ops.push({ type: 'sub-line', text: line, y, font: ctx.font });
          y += 15;
        });
      } else if (r.type === 'note') {
        ctx.font = '11px "Apple SD Gothic Neo", sans-serif';
        ops.push({ type: r.type, text: r.text, y, font: ctx.font });
        y += 16;
      } else if (r.type === 'spacer') {
        y += r.size || 14;
      } else if (r.type === 'footer') {
        y += 10;
        ctx.font = '11px "Apple SD Gothic Neo", sans-serif';
        ops.push({ type: r.type, text: r.text, y, font: ctx.font });
        y += 16;
      }
    });

    return { ops, height: y + PADDING };
  }

  function draw(ctx, ops, contentWidth) {
    const ink = cssVar('--ink');
    const subInk = cssVar('--sub-ink');

    ops.forEach(op => {
      ctx.font = op.font;
      if (op.type === 'title' || op.type === 'dday') {
        ctx.fillStyle = op.color;
        ctx.fillText(op.text, PADDING, op.y);
      } else if (op.type === 'section') {
        ctx.fillStyle = op.color;
        ctx.fillText(op.text, PADDING, op.y);
        ctx.strokeStyle = op.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(PADDING, op.y + 6);
        ctx.lineTo(PADDING + contentWidth, op.y + 6);
        ctx.stroke();
      } else if (op.type === 'item-line') {
        if (op.first) {
          const boxY = op.y - 10;
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.3;
          ctx.strokeRect(PADDING, boxY, 12, 12);
          if (op.checked) {
            ctx.fillStyle = ink;
            ctx.fillRect(PADDING + 2.5, boxY + 2.5, 7, 7);
          }
        }
        ctx.fillStyle = op.checked ? subInk : ink;
        ctx.fillText(op.text, PADDING + 20, op.y);
        if (op.checked) {
          const w = ctx.measureText(op.text).width;
          ctx.strokeStyle = subInk;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(PADDING + 20, op.y - 4);
          ctx.lineTo(PADDING + 20 + w, op.y - 4);
          ctx.stroke();
        }
      } else if (op.type === 'sub-line') {
        ctx.fillStyle = subInk;
        ctx.fillText(op.text, PADDING + 22, op.y);
      } else if (op.type === 'note') {
        ctx.fillStyle = '#B5533E';
        ctx.fillText(op.text, PADDING, op.y);
      } else if (op.type === 'footer') {
        ctx.fillStyle = subInk;
        ctx.fillText(op.text, PADDING, op.y);
      }
    });
  }

  function renderToBlob(records) {
    const contentWidth = WIDTH - PADDING * 2;
    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d');
    const { ops, height } = layout(mctx, records, contentWidth);

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(WIDTH * SCALE);
    canvas.height = Math.ceil(height * SCALE);
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = cssVar('--bg');
    ctx.fillRect(0, 0, WIDTH, height);

    draw(ctx, ops, contentWidth);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }

  async function copyImageWithFeedback(records, feedbackEl) {
    function showFeedback(text) {
      if (!feedbackEl) return;
      feedbackEl.textContent = text;
      feedbackEl.classList.add('show');
      clearTimeout(feedbackEl._hideTimer);
      feedbackEl._hideTimer = setTimeout(() => feedbackEl.classList.remove('show'), 2500);
    }

    let blob;
    try {
      blob = await renderToBlob(records);
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

  return { copyImageWithFeedback, cssVar };
})();
