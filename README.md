# wedding-calendar

결혼 준비를 위한 체크리스트/도구 모음 사이트. GitHub Pages로 정적 호스팅한다.

- 배포 주소: https://seokrae.github.io/wedding-calendar/

## 구조

```
wedding-calendar/
├── index.html              홈 — 도구 목록 페이지
├── robots.txt              크롤링 허용 설정
├── pages/
│   ├── calendar.html        캘린더 도구 (신부용 ↔ 신랑용 탭)
│   ├── timeline.html        타임라인 도구 (신부용 전체요약+5칼럼/신랑용 5칼럼, 카테고리 서브탭)
│   ├── budget.html          예산 가이드 도구 (항목별 비용 범위 + 총액대)
│   └── glossary.html        용어 가이드 도구 (결혼 준비 용어 사전)
├── data/
│   ├── calendar-bride.js    신부용 캘린더 콘텐츠 (섹션별 체크리스트, 신랑 항목과 겹치는 일부는 link 필드로 표시)
│   ├── calendar-groom.js    신랑용 캘린더 콘텐츠 (항목 나열형 + tip/입력 필드, 신부 항목과 겹치는 일부는 link 필드로 표시)
│   ├── timeline-summary.js  타임라인 "캘린더 전체요약" 칼럼의 큐레이션 목록 (월별로 강조할 카테고리·brideIndexes만 가짐, 문구는 calendar-bride.js에서 그대로 가져옴)
│   ├── budget.js            예산 가이드 콘텐츠 (요약표 + 항목별 상세)
│   └── glossary.js          용어 가이드 콘텐츠 (섹션별 용어·정의)
├── assets/
│   ├── favicon.svg          브라우저 탭 아이콘
│   ├── og-image.svg / .png  링크 공유 시 뜨는 미리보기 이미지 (og:image)
│   ├── css/
│   │   ├── common.css       색상 변수, 리셋, 헤더/타이틀 공통 스타일
│   │   ├── home.css         홈 페이지(도구 카드 목록) 전용 스타일
│   │   ├── calendar.css     캘린더 도구 전용 스타일 (탭, 카드, tip 박스 등)
│   │   ├── timeline.css     타임라인 도구 전용 스타일 (dense·2칼럼·1칼럼 레이아웃, 카테고리 색점)
│   │   ├── budget.css       예산 가이드 전용 스타일 (요약표, 항목 카드)
│   │   └── glossary.css     용어 가이드 전용 스타일 (2단 컬럼 flow)
│   └── js/
│       ├── storage.js       localStorage 안전 래퍼 (wedding: 네임스페이스, 접근 차단 시 no-op)
│       ├── shared-id.js     신부/신랑 항목 중 같은 할 일을 가리키는 항목의 체크 id를 공유시키는 헬퍼 (resolveCheckId)
│       ├── share-image.js   우하단 FAB "이미지로 복사" 공통 렌더러 (Canvas 2D로 카드 이미지 생성 후 클립보드에 복사, 실패 시 PNG 다운로드 폴백)
│       ├── calendar.js      캘린더 렌더링 로직 (체크박스/입력값 저장)
│       ├── timeline.js      타임라인 렌더링 로직 (calendar-bride.js/calendar-groom.js 데이터를 원본 id 그대로 재사용해 캘린더 도구와 체크 연동)
│       ├── budget.js        예산 가이드 렌더링 로직
│       └── glossary.js      용어 가이드 렌더링 로직
└── README.md
```

빌드 과정 없는 순수 정적 사이트. `index.html`을 브라우저로 열거나 GitHub Pages URL로 바로 확인 가능.

## 새 도구 추가하는 법

1. `data/<도구명>.js` — 콘텐츠 데이터 작성
2. `assets/css/<도구명>.css` — 필요하면 전용 스타일 추가 (공통 스타일은 `common.css` 재사용)
3. `assets/js/<도구명>.js` — 렌더링 로직 작성. 체크·입력 저장이 필요하면 `localStorage`를 직접 쓰지 말고 `assets/js/storage.js`의 `WeddingStore`를 사용한다
4. `pages/<도구명>.html` — 위 파일들을 불러오는 페이지 작성. `<head>`에 `favicon.svg` 링크와 `description`/`og:*` 메타태그를 다른 페이지와 같은 형식으로 포함한다
5. `index.html`의 `.tool-list`에 카드 링크 추가

## 알려진 제약

- `calendar-bride.js`의 D-6개월 항목은 원본 이미지에서 중앙 뱃지("신부용")에 가려져 일부만 옮겨졌다. 원본 확인 후 보완 필요. (`calendar-groom.js`의 D-6개월은 확인 완료)
- `glossary.js`의 촬영·스냅 섹션(②③) 용어명과 `예식` 섹션의 "보증인원"/"미니멈개런티"는 원본 이미지로 확인된 것이 아니라 정의를 보고 일반적인 결혼 준비 용어로 채운 것이다 (`uncertainTerm` 표시, 화면에는 "?"로 노출). 원본 확인 전까지는 실제와 다를 수 있다.
- 체크 상태·입력 필드 값은 `localStorage`에 `wedding:` 접두사를 붙여 저장한다(`assets/js/storage.js`). 브라우저/기기 간 동기화되지 않으며, 프라이빗 모드 등으로 `localStorage` 접근 자체가 막힌 환경에서는 저장 없이 화면만 정상 표시된다(footer에 안내 문구가 대신 뜬다).
- `timeline-summary.js`에는 부모님 카테고리 항목이 없어, 타임라인의 부모님 탭에서는 전체요약 칼럼이 비어 있다 (부모님 전체 칼럼 자체는 정상 표시).
- `timeline-summary.js`의 항목은 `brideIndexes`로 `calendar-bride.js`의 실제 항목을 가리킬 뿐 문구를 따로 갖지 않는다 — 전체요약에 보이는 문구를 고치려면 `calendar-bride.js`를 고쳐야 한다. `text`가 남아있는 항목(D-6개월 신혼집 등)은 캘린더 원본에 대응 데이터 자체가 없는 예외다.
- 타임라인은 캘린더 도구의 신랑용 `fields`(일정·장소 텍스트 입력)를 다루지 않는다. 해당 입력은 캘린더 도구에서 진행한다.
- `calendar-bride.js`/`calendar-groom.js`의 항목에 `link` 필드가 있으면, 그 값이 같은 신부/신랑 항목끼리 체크 상태를 공유한다 (`assets/js/shared-id.js`의 `resolveCheckId`). 표현만 다르고 실질적으로 같은 할 일인 경우에만 붙이며, 범위가 다르거나 애매한 항목은 의도적으로 링크하지 않는다. `link` 값은 신부·신랑 데이터에 각각 정확히 1개씩만 나타나야 한다. 이 필드가 새로 붙거나 바뀐 항목은 저장 키가 바뀌므로 기존에 체크해둔 상태가 초기화된 것처럼 보일 수 있다.
