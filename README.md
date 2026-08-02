# wedding-calendar

결혼 준비를 위한 체크리스트/도구 모음 사이트. GitHub Pages로 정적 호스팅한다.

- 배포 주소: https://seokrae.github.io/wedding-calendar/

## 구조

```
wedding-calendar/
├── index.html              홈 — 도구 목록 페이지
├── pages/
│   ├── calendar.html        캘린더 도구 (신부용 ↔ 신랑용 탭)
│   ├── timeline.html        타임라인 도구 (신부용 전체요약+5칼럼/신랑용 5칼럼, 카테고리 서브탭)
│   ├── budget.html          예산 가이드 도구 (항목별 비용 범위 + 총액대)
│   └── glossary.html        용어 가이드 도구 (결혼 준비 용어 사전)
├── data/
│   ├── calendar-bride.js    신부용 캘린더 콘텐츠 (섹션별 체크리스트)
│   ├── calendar-groom.js    신랑용 캘린더 콘텐츠 (항목 나열형 + tip/입력 필드)
│   ├── timeline-summary.js  타임라인 "캘린더 전체요약" 칼럼 콘텐츠
│   ├── budget.js            예산 가이드 콘텐츠 (요약표 + 항목별 상세)
│   └── glossary.js          용어 가이드 콘텐츠 (섹션별 용어·정의)
├── assets/
│   ├── css/
│   │   ├── common.css       색상 변수, 리셋, 헤더/타이틀 공통 스타일
│   │   ├── home.css         홈 페이지(도구 카드 목록) 전용 스타일
│   │   ├── calendar.css     캘린더 도구 전용 스타일 (탭, 카드, tip 박스 등)
│   │   ├── timeline.css     타임라인 도구 전용 스타일 (dense·2칼럼·1칼럼 레이아웃, 카테고리 색점)
│   │   ├── budget.css       예산 가이드 전용 스타일 (요약표, 항목 카드)
│   │   └── glossary.css     용어 가이드 전용 스타일 (2단 컬럼 flow)
│   └── js/
│       ├── calendar.js      캘린더 렌더링 로직 (체크박스/입력값 localStorage 저장)
│       ├── timeline.js      타임라인 렌더링 로직 (calendar-bride.js/calendar-groom.js 데이터를 원본 id 그대로 재사용해 캘린더 도구와 체크 연동)
│       ├── budget.js        예산 가이드 렌더링 로직
│       └── glossary.js      용어 가이드 렌더링 로직
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
- `budget.js`의 "본식 스냅" 섹션 노트("원판이란?")는 원본 이미지에서 문장이 잘려 일부만 옮겨졌다.
- `glossary.js`의 촬영·스냅 섹션(②③)은 원본에서 용어명 자체가 뱃지에 가려져 정의만 옮기고 용어명은 비워뒀다. `예식` 섹션의 "보증인원"/"미니멈개런티"는 정의만 보고 추정한 용어명이라 확인이 필요하다.
- 체크 상태·입력 필드 값은 `localStorage`에 저장되므로 브라우저/기기 간 동기화되지 않는다.
- `timeline-summary.js`에는 부모님 카테고리 항목이 없어, 타임라인의 부모님 탭에서는 전체요약 칼럼이 비어 있다 (부모님 전체 칼럼 자체는 정상 표시).
- 타임라인은 캘린더 도구의 신랑용 `fields`(일정·장소 텍스트 입력)를 다루지 않는다. 해당 입력은 캘린더 도구에서 진행한다.
