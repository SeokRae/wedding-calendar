// 신부/신랑 항목 중 같은 할 일을 가리키는 것끼리 체크 상태를 공유시키는 헬퍼.
// 항목에 link 필드가 있으면 그 슬러그로 만든 공유 localStorage id를 쓰고,
// 없으면 각 화면이 원래 쓰던 id를 그대로 쓴다. calendar.js·timeline.js가
// 공통으로 로드해서 쓰므로 두 곳에 같은 함수를 복붙하지 않는다.
function resolveCheckId(defaultId, item) {
  return (item && typeof item === 'object' && item.link) ? 'link-' + item.link : defaultId;
}
