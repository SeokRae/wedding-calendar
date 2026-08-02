// 각 항목의 brideIndexes는 data/calendar-bride.js의 해당 월·카테고리 배열
// 위치를 가리킨다. timeline.js는 이 인덱스가 가리키는 실제 캘린더 항목을
// 원문 그대로 렌더링하므로, brideIndexes가 있는 항목은 별도 text를 갖지
// 않는다 — 문구를 여기서 다시 쓰면 캘린더 쪽을 고칠 때 두 곳을 같이
// 고쳐야 하는 이원화가 생긴다.
// text가 남아있는 항목은 캘린더 원본에 대응 데이터 자체가 없는 예외다
// (예: D-6개월은 원본 이미지 일부가 가려져 있어 일부 섹션이 통째로 없음).
// 이 파일의 항목 순서(배열 위치)는 곧 timeline.js가 만드는 localStorage
// id(timeline-summary-m{월}-i{순서}, text만 있는 예외 항목에 한함)의
// 일부이므로, 그런 항목을 삽입·삭제·재정렬하면 이미 저장된 체크 상태가
// 다른 항목으로 어긋난다.
const TIMELINE_SUMMARY = [
  { dday: "D-12개월", tag: "상견례", items: [
    {cat:"예식 준비", brideIndexes:[2]},
    {cat:"예식 준비", brideIndexes:[0,1]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[1,2]},
    {cat:"신혼집", brideIndexes:[0]}
  ]},
  { dday: "D-11개월", tag: "웨딩홀", items: [
    {cat:"예식 준비", brideIndexes:[0,3]},
    {cat:"예식 준비", brideIndexes:[2]},
    {cat:"스드메", brideIndexes:[1,4]},
    {cat:"신혼집", brideIndexes:[0]}
  ]},
  { dday: "D-10개월", tag: "스튜디오 촬영", items: [
    {cat:"예식 준비", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[0,1]},
    {cat:"신혼집", brideIndexes:[0,1]},
    {cat:"신혼여행", brideIndexes:[0]}
  ]},
  { dday: "D-9개월", tag: "스드메", items: [
    {cat:"예식 준비", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[2]},
    {cat:"스드메", brideIndexes:[3]},
    {cat:"신혼여행", brideIndexes:[0]}
  ]},
  { dday: "D-8개월", tag: "건강검진", items: [
    {cat:"예식 준비", brideIndexes:[1]},
    {cat:"예식 준비", brideIndexes:[2]},
    {cat:"예식 준비", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"신혼집", brideIndexes:[0]}
  ]},
  { dday: "D-7개월", tag: "예복·폐백", items: [
    {cat:"예식 준비", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[1]},
    {cat:"신혼집", brideIndexes:[1]}
  ]},
  { dday: "D-6개월", tag: "본식 준비", items: [
    {cat:"예식 준비", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[2,3]},
    // 캘린더 D-6은 원본 이미지 일부가 가려져 있어(partial:true) 신혼집
    // 섹션 자체가 없다 — 대응할 캘린더 데이터가 없는 문서화된 예외
    {cat:"신혼집", text:"신혼집 가전·가구 구매 계획"}
  ]},
  { dday: "D-5개월", tag: "청첩장", items: [
    {cat:"예식 준비", brideIndexes:[1]},
    {cat:"예식 준비", brideIndexes:[2]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"신혼집", brideIndexes:[0]}
  ]},
  { dday: "D-4개월", tag: "식순·의상", items: [
    {cat:"예식 준비", brideIndexes:[0]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"신혼집", brideIndexes:[1]},
    {cat:"신혼여행", brideIndexes:[0]}
  ]},
  { dday: "D-3개월", tag: "본식 확정", items: [
    {cat:"예식 준비", brideIndexes:[2]},
    {cat:"예식 준비", brideIndexes:[4]},
    {cat:"신혼집", brideIndexes:[0]}
  ]},
  { dday: "D-2개월", tag: "식전 영상·예복", items: [
    {cat:"예식 준비", brideIndexes:[2]},
    {cat:"예식 준비", brideIndexes:[4]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"신혼여행", brideIndexes:[0]}
  ]},
  { dday: "D-1개월", tag: "본식", items: [
    {cat:"예식 준비", brideIndexes:[0,1]},
    {cat:"예식 준비", brideIndexes:[3]},
    {cat:"스드메", brideIndexes:[0]},
    {cat:"신혼집", brideIndexes:[0]}
  ]}
];
