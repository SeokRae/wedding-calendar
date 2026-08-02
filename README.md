# wedding-calendar

결혼 준비를 위한 체크리스트/도구 모음 사이트. GitHub Pages로 정적 호스팅한다.

- 배포 주소: https://seokrae.github.io/wedding-calendar/

## 구조

```
wedding-calendar/
├── index.html              홈 — 도구 목록 페이지
├── pages/
│   └── calendar.html        캘린더 도구 (신부용 ↔ 신랑용 탭)
├── data/
│   ├── calendar-bride.js    신부용 캘린더 콘텐츠 (섹션별 체크리스트)
│   └── calendar-groom.js    신랑용 캘린더 콘텐츠 (항목 나열형 + tip/입력 필드)
├── assets/
│   ├── css/
│   │   ├── common.css       색상 변수, 리셋, 헤더/타이틀 공통 스타일
│   │   ├── home.css         홈 페이지(도구 카드 목록) 전용 스타일
│   │   └── calendar.css     캘린더 도구 전용 스타일 (탭, 카드, tip 박스 등)
│   └── js/
│       └── calendar.js      캘린더 렌더링 로직 (체크박스/입력값 localStorage 저장)
└── README.md
```

빌드 과정 없는 순수 정적 사이트. `index.html`을 브라우저로 열거나 GitHub Pages URL로 바로 확인 가능.

## 새 도구 추가하는 법

1. `data/<도구명>.js` — 콘텐츠 데이터 작성
2. `assets/css/<도구명>.css` — 필요하면 전용 스타일 추가 (공통 스타일은 `common.css` 재사용)
3. `assets/js/<도구명>.js` — 렌더링 로직 작성
4. `pages/<도구명>.html` — 위 파일들을 불러오는 페이지 작성
5. `index.html`의 `.tool-list`에 카드 링크 추가

## 알려진 제약

- `calendar-bride.js`의 D-6개월 항목은 원본 이미지에서 중앙 뱃지("신부용")에 가려져 일부만 옮겨졌다. 원본 확인 후 보완 필요. (`calendar-groom.js`의 D-6개월은 확인 완료)
- 체크 상태·입력 필드 값은 `localStorage`에 저장되므로 브라우저/기기 간 동기화되지 않는다.
