// localStorage 접근을 안전하게 감싸고 'wedding:' 네임스페이스를 붙이는 헬퍼.
// 사파리 프라이빗 모드 등에서 localStorage 접근이 예외를 던지면 이후 모든
// 호출을 조용히 no-op 처리해 페이지 전체가 백지가 되는 것을 막는다.
// calendar.js·timeline.js가 공통으로 로드해서 쓴다 (shared-id.js와 같은 방식).
const WeddingStore = (function () {
  const PREFIX = 'wedding:';
  const MIGRATE_FLAG = PREFIX + 'migrated';
  // 이 접두사들로 시작하는 기존 키(네임스페이스 도입 전)를 1회 이전한다.
  const LEGACY_PREFIXES = ['bride-', 'groom-', 'link-', 'calendar-', 'timeline-'];

  let available = false;
  try {
    const probeKey = PREFIX + '__probe__';
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    available = true;
  } catch (e) {
    available = false;
  }

  if (available && !localStorage.getItem(MIGRATE_FLAG)) {
    try {
      const legacyKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && LEGACY_PREFIXES.some(p => key.indexOf(p) === 0)) legacyKeys.push(key);
      }
      legacyKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) localStorage.setItem(PREFIX + key, value);
        localStorage.removeItem(key);
      });
      localStorage.setItem(MIGRATE_FLAG, '1');
    } catch (e) {
      // 이전은 best-effort — 실패해도 이후 읽기/쓰기 동작에는 영향 없다
    }
  }

  function get(key) {
    if (!available) return null;
    try {
      return localStorage.getItem(PREFIX + key);
    } catch (e) {
      return null;
    }
  }

  function set(key, value) {
    if (!available) return;
    try {
      localStorage.setItem(PREFIX + key, value);
    } catch (e) {
      // 쓰기 실패(구형 iOS 프라이빗 모드의 QuotaExceededError 등)는 무시
    }
  }

  function remove(key) {
    if (!available) return;
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      // ignore
    }
  }

  return { available: available, get: get, set: set, remove: remove };
})();
