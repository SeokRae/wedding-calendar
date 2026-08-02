// 각 항목의 brideIndexes는 data/calendar-bride.js의 해당 월·카테고리 배열
// 위치를 가리킨다. 이 파일의 항목 순서(배열 위치)는 곧 timeline.js가 만드는
// localStorage id(timeline-summary-m{월}-i{순서})의 일부이므로, 항목을
// 삽입·삭제·재정렬하면 이미 저장된 체크 상태가 다른 항목으로 어긋난다.
const TIMELINE_SUMMARY = [
  { dday: "D-12개월", tag: "상견례", items: [
    {cat:"예식 준비", text:"양가 상견례 일정 조율", brideIndexes:[2]},
    {cat:"예식 준비", text:"예식 시기·예산 범위 정하기", brideIndexes:[0,1]},
    {cat:"스드메", text:"웨딩 플래너 여부 결정", brideIndexes:[0]},
    {cat:"스드메", text:"웨딩 스냅·DVD 컨셉 정리", brideIndexes:[1,2]},
    {cat:"신혼집", text:"신혼집 자금 계획 정리", brideIndexes:[0]}
  ]},
  { dday: "D-11개월", tag: "웨딩홀", items: [
    {cat:"예식 준비", text:"웨딩홀 투어·예식 날짜 확정", brideIndexes:[0,3]},
    {cat:"예식 준비", text:"양가 상견례 진행", brideIndexes:[2]},
    {cat:"스드메", text:"스드메 견적 비교·드레스 투어", brideIndexes:[1,4]},
    {cat:"신혼집", text:"신혼집 주거 형태 결정", brideIndexes:[0]}
  ]},
  { dday: "D-10개월", tag: "스튜디오 촬영", items: [
    {cat:"예식 준비", text:"결혼 항목별 예산 정리", brideIndexes:[0]},
    {cat:"스드메", text:"촬영 컨셉 설정·작가 확정", brideIndexes:[0,1]},
    {cat:"신혼집", text:"신혼집 예산 계획·지역 후보 정리", brideIndexes:[0,1]},
    {cat:"신혼여행", text:"신혼여행 방향 설정 (자유여행·패키지)", brideIndexes:[0]}
  ]},
  { dday: "D-9개월", tag: "스드메", items: [
    {cat:"예식 준비", text:"웨딩홀 계약 확정", brideIndexes:[0]},
    {cat:"스드메", text:"신부 드레스 투어 후 업체 확정", brideIndexes:[0]},
    {cat:"스드메", text:"스튜디오 촬영 일정 최종 확정", brideIndexes:[2]},
    {cat:"스드메", text:"신랑 예복 준비 시작", brideIndexes:[3]},
    {cat:"신혼여행", text:"신혼여행 항공권 및 숙소 예약", brideIndexes:[0]}
  ]},
  { dday: "D-8개월", tag: "건강검진", items: [
    {cat:"예식 준비", text:"양가 하객 명단 1차 취합", brideIndexes:[1]},
    {cat:"예식 준비", text:"웨딩밴드 제작 및 구매", brideIndexes:[2]},
    {cat:"예식 준비", text:"결혼 전 건강검진 진행", brideIndexes:[0]},
    {cat:"스드메", text:"신랑·신부 한복 상담", brideIndexes:[0]},
    {cat:"신혼집", text:"신혼집 계약 조건 최종 확인", brideIndexes:[0]}
  ]},
  { dday: "D-7개월", tag: "예복·폐백", items: [
    {cat:"예식 준비", text:"폐백 여부 최종 결정", brideIndexes:[0]},
    {cat:"스드메", text:"스튜디오 촬영 드레스 셀렉·가봉", brideIndexes:[1]},
    {cat:"신혼집", text:"신혼집 계약 완료", brideIndexes:[1]}
  ]},
  { dday: "D-6개월", tag: "본식 준비", items: [
    // 캘린더 D-6은 원본 이미지 일부가 가려져 있어(partial:true) 예식 준비
    // 섹션에 "축가 후보 정리"만 남아있다. 사회·주례 항목은 데이터 자체가
    // 없어 매핑할 수 없으므로 문구를 실제 하위 항목에 맞춰 좁혔다
    {cat:"예식 준비", text:"축가 후보 정리", brideIndexes:[0]},
    {cat:"스드메", text:"스튜디오 촬영·원본 확인", brideIndexes:[2,3]},
    {cat:"신혼집", text:"신혼집 가전·가구 구매 계획"}
  ]},
  { dday: "D-5개월", tag: "청첩장", items: [
    {cat:"예식 준비", text:"청첩장 제작 (종이·모바일)", brideIndexes:[1]},
    {cat:"예식 준비", text:"답례품 후보 및 구성 확인", brideIndexes:[2]},
    {cat:"스드메", text:"스튜디오 촬영 사진 셀렉 확정", brideIndexes:[0]},
    {cat:"신혼집", text:"신혼집 입주전 하자 점검", brideIndexes:[0]}
  ]},
  { dday: "D-4개월", tag: "식순·의상", items: [
    {cat:"예식 준비", text:"본식 진행 순서·구성 정하기", brideIndexes:[0]},
    {cat:"스드메", text:"본식 헤어·메이크업 취합 후 확정", brideIndexes:[0]},
    {cat:"신혼집", text:"신혼집 인테리어 진행 여부 확인", brideIndexes:[1]},
    {cat:"신혼여행", text:"여권 유효기간·재발급 확인", brideIndexes:[0]}
  ]},
  { dday: "D-3개월", tag: "본식 확정", items: [
    {cat:"예식 준비", text:"주례·사회·축가 섭외 확정", brideIndexes:[2]},
    {cat:"예식 준비", text:"본식 식순 최종 확정", brideIndexes:[4]},
    {cat:"신혼집", text:"신혼집 입주 준비 시작", brideIndexes:[0]}
  ]},
  { dday: "D-2개월", tag: "식전 영상·예복", items: [
    {cat:"예식 준비", text:"하객 명단 최종 확정", brideIndexes:[2]},
    {cat:"예식 준비", text:"식전 영상 준비", brideIndexes:[4]},
    {cat:"스드메", text:"본식 신랑 예복 가봉 진행", brideIndexes:[0]},
    {cat:"신혼여행", text:"신혼여행 보험 가입 및 환전", brideIndexes:[0]}
  ]},
  { dday: "D-1개월", tag: "본식", items: [
    {cat:"예식 준비", text:"최종 리허설·동선 확인", brideIndexes:[0,1]},
    {cat:"예식 준비", text:"혼인서약서 최종 준비", brideIndexes:[3]},
    {cat:"스드메", text:"신부 본식 드레스 셀렉 및 가봉", brideIndexes:[0]},
    {cat:"신혼집", text:"신혼집 주소 이전 준비", brideIndexes:[0]}
  ]}
];
