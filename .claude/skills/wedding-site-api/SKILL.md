---
name: wedding-site-api
description: >
  이 정적 웨딩 사이트가 페이지 간에 공유하는 내부 JS 모듈("API")·데이터 파일 스키마·localStorage 키 규칙을 정리한 참고 노트.
  calendar.js/timeline.js/budget.js/glossary.js, data/*.js, assets/js/{storage,shared-id,share-image}.js를 고치기 전에 참조.
  "이미지로 복사" 기능, 체크 상태 공유(link 필드), 카테고리 색상(CSS 변수) 관련 작업 시에도 사용.
  Keywords: 내부 API, 데이터 스키마, WeddingStore, resolveCheckId, ShareImage, localStorage, 이미지로 복사, share-image
---

# wedding-site-api — 이 사이트의 내부 API 참고 노트

순수 정적 사이트라 외부/백엔드 API는 없다. 대신 여러 페이지(`calendar.html`, `timeline.html`, `budget.html`, `glossary.html`)가
공유하는 내부 JS 모듈과 `data/*.js` 스키마가 사실상의 "API" 역할을 한다. 이 계약을 모르고 DOM 클래스명이나 데이터
구조를 바꾸면 체크 상태 저장이나 "이미지로 복사" 기능이 조용히 깨질 수 있다.

## 페이지별 스크립트 로드 순서

뒤에 오는 스크립트가 앞선 스크립트의 전역을 그대로 참조하므로 순서를 바꾸면 안 된다.

- `calendar.html`: `data/calendar-bride.js` → `data/calendar-groom.js` → `assets/js/storage.js` → `assets/js/shared-id.js` → `assets/js/share-image.js` → `assets/js/calendar.js`
- `timeline.html`: `data/calendar-bride.js` → `data/calendar-groom.js` → `data/timeline-summary.js` → `assets/js/storage.js` → `assets/js/shared-id.js` → `assets/js/share-image.js` → `assets/js/timeline.js`
- `budget.html`: `data/budget.js` → `assets/js/budget.js`
- `glossary.html`: `data/glossary.js` → `assets/js/glossary.js`

## 공용 JS 모듈 API

### `WeddingStore` (`assets/js/storage.js`)
- `get(key)` / `set(key, value)` / `remove(key)` / `available`(bool)
- 모든 키에 `wedding:` 네임스페이스를 자동으로 붙이고, 구버전 키(`bride-`/`groom-`/`link-`/`calendar-`/`timeline-` 접두)를 최초 1회 자동 이전한다.
- 사파리 프라이빗 모드 등 `localStorage` 접근이 막힌 환경에서는 `available=false`가 되고 이후 모든 호출이 조용히 no-op — 페이지 전체가 백지가 되는 것을 막기 위함.

### `resolveCheckId(defaultId, item)` (`assets/js/shared-id.js`)
- `item.link`가 있으면 `'link-' + item.link`를 공유 체크 id로 반환, 없으면 `defaultId`를 그대로 반환.
- 신부용·신랑용 항목 중 같은 할 일을 가리키는 것끼리 체크 상태를 동기화하는 용도. `data/*.js`에서 항목에 `link` 필드를 추가하면 자동으로 연결된다.

### `ShareImage` (`assets/js/share-image.js`)
- 공개 API: `copyCalendarImage(title, cards, feedbackEl)` / `copyTimelineImage(title, columns, feedbackEl)` / `cssVar(name)`
- 캔버스 2D로 실제 화면과 같은 다단 그리드·배지·색상을 다시 그려 PNG로 클립보드에 복사한다. (DOM을 SVG `foreignObject`로 감싸 캔버스에 그리는 방식은 Chrome이 캔버스를 "오염(tainted)" 처리해 막기 때문에 이 방식을 쓴다.)
- 입력은 `data/*.js` 원본이 아니라 **화면에 렌더링된 DOM을 읽어 만든 `records` 배열**이다. `calendar.js`의 `buildShareCards()`, `timeline.js`의 `buildShareColumns()`/`buildColumn()` 참고.
- `records` 항목 타입: `dday` / `section` / `item(checked, badge?, dot?)` / `field` / `sub` / `note` / `legend` / `spacer`
- **주의**: `.dday`, `.section-title`, `ul.items`, `.partial-note` 같은 DOM 클래스명을 바꾸면 `buildShareCards`/`buildColumn`도 함께 고쳐야 "이미지로 복사" 기능이 안 깨진다 — data → DOM → canvas 3단 변환이라 DOM 구조 자체가 계약의 일부다.

## 데이터 파일 스키마 (`data/*.js`)

### `CALENDAR_BRIDE` / `CALENDAR_GROOM` (`data/calendar-bride.js`, `data/calendar-groom.js`)
```
{
  icons: { 카테고리명: emoji },
  months: [
    { dday, alt, sections: { 카테고리명: [item, ...] } }
  ]
}
```
`item`은 문자열 또는 `{ text, link }`. `link`가 있으면 신부/신랑 동일 슬러그로 체크 상태를 공유한다(`resolveCheckId` 참고).

### `TIMELINE_SUMMARY` (`data/timeline-summary.js`)
```
[
  { dday, tag, items: [
      { cat, brideIndexes: [n, ...] } |
      { cat, text }   // 캘린더 원본에 대응 데이터가 없는 예외 항목만
  ]}
]
```
- `brideIndexes`는 `CALENDAR_BRIDE`의 해당 월·카테고리 배열 위치를 가리킨다. `timeline.js`는 그 위치의 원문을 그대로 렌더링하므로 문구를 여기서 다시 쓰지 않는다(캘린더를 고치면 타임라인도 자동 반영).
- **주의**: `text`만 있는 예외 항목은 배열 위치가 localStorage id(`timeline-summary-m{월}-i{순서}`)의 일부다. 이런 항목을 삽입·삭제·재정렬하면 이미 저장된 체크 상태가 다른 항목으로 어긋난다.

### `BUDGET` (`data/budget.js`)
```
{ summary:[{no,label,range}], tiers:[{name,range}], sections:[{no,title,total,items:[{label,range,note}]}] }
```

### `GLOSSARY` (`data/glossary.js`)
```
{ sections:[{no,title,terms:[{term,def,uncertainTerm?}]}] }
```

## localStorage 키 규칙
- 전부 `wedding:` 접두(WeddingStore가 자동으로 붙임).
- 체크 상태: `bride-m{월}-{카테고리}-{i}` / `groom-m{월}-item{i}` / `link-{slug}`(공유 항목) / `timeline-summary-m{월}-i{i}`(타임라인 전용 예외 항목).
- 화면 상태: `calendar-gender`, `calendar-category`, `timeline-category`.

## CSS 변수 (`assets/css/common.css` `:root`)
`--bg`, `--card-bg`, `--border`, `--ink`, `--sub-ink`, `--accent-bride`, `--accent-groom`, `--cat-ceremony`, `--cat-sdm`, `--cat-home`, `--cat-honeymoon`, `--cat-parents` — `ShareImage.cssVar()`와 카테고리 배지 색이 여기서 읽는다. 새 카테고리를 추가하면 이 변수와 `data/*.js`의 카테고리명(icons 키)을 함께 갱신해야 한다.

## 페이지 공통 레이아웃 관례
서브페이지 공통 구조: `.top-row`(`.left`에 홈으로 가는 `.back-link` 알약형 버튼, `.right`에 다른 도구로 가는 순방향 링크나 안내 텍스트) → `.title-block`(`.pill` + `h1.page-title` + 탭들) → 본문 → `footer.site-footer`. 순방향 링크(예: 캘린더⇄타임라인)는 별도 클래스 없는 기본 `<a>`(밑줄 텍스트)로, 뒤로가기용 `.back-link`(알약형 버튼)와 스타일을 구분한다.

## 이 노트를 참조할 시점
- `calendar.js`/`timeline.js`/`budget.js`/`glossary.js` 또는 `data/*.js`를 고칠 때
- "이미지로 복사" FAB 기능을 건드릴 때
- 새 체크/저장 기능을 추가하거나 카테고리를 신설할 때
