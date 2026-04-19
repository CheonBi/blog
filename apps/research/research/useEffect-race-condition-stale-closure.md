---
title: useEffect — 안 쓰는 게 최선이다
marp: true
paginate: true
theme: yceffort
tags:
  - react
  - useEffect
date: 2026-04-18
description: '주니어를 졸업하려는 개발자를 위한 useEffect 딥다이브 — 안티패턴, race condition, stale closure, event vs effect, tearing, Suspense까지'
published: true
---

# useEffect — 안 쓰는 게 최선이다

안티패턴, race condition, stale closure — 그리고 그 너머

<!-- _class: invert -->

@yceffort

---

## 이 강의에서 다루는 것

1. useEffect의 원래 목적
2. **안 써야 하는 경우** — 안티패턴
3. **Race Condition** — 기본 + optimistic update
4. **Stale Closure** — Reactive vs Latest 값
5. **Event vs Effect** — useEffectEvent의 철학
6. **실행 타이밍 & Tearing**
7. **Suspense · `use()` · 커스텀 훅 설계**

---

## 이 강의의 메시지

> `useEffect`는 **탈출구**(escape hatch). 쓰는 순간 React 바깥 세계와 동기화 중이라는 뜻.

필요 없는데 쓰고 있다면 **원인 불명의 버그**가 숨어 있을 가능성이 높다.

그게 이 강의가 다루는 모든 것들이다.

---

## Part 0 — useEffect란 무엇인가

---

## 공식 정의

> **Effects let you synchronize a component with some external system.**

"외부 시스템":

- 브라우저 API (DOM, timer, observer)
- 네트워크 (fetch, WebSocket)
- 서드파티 라이브러리 (차트, 지도)

> 한 줄: **React 바깥과 맞추는 것.**

---

## 실행 타이밍 (기본)

```
1. state 변경 → 컴포넌트 함수 호출 (render)
2. React가 DOM에 반영 (commit)
3. 브라우저 paint
4. useEffect 실행
```

Effect 안에서 state를 바꾸면 **리렌더가 한 번 더** 일어난다. Effect가 많다 = 렌더가 여러 번. (세부 타이밍은 Part 5)

---

## 동기화 사이클

```jsx
useEffect(() => {
  const sub = subscribe() // 시작
  return () => sub.unsubscribe() // 정리
}, [deps])
```

- 처음 마운트
- deps가 바뀔 때마다 **(정리 → 시작)**
- 언마운트 시 정리

**시작과 정리가 짝을 이룬다** — 이게 Effect의 정신.

---

## Part 1 — 안 쓰는 게 최선이다

---

## 안티패턴 4가지

| 상황               | 대안                     |
| ------------------ | ------------------------ |
| props → state 복사 | props 그대로 사용        |
| 파생 state 계산    | 렌더 중 계산 / `useMemo` |
| 이벤트 반응        | 이벤트 핸들러            |
| 자식 → 부모 동기화 | state lifting            |

공통 원칙:

- **계산 가능한 값은 state가 아니다**
- **"사용자가 X했기 때문에"라면 Effect가 아니라 핸들러**

---

## 대표 사례: 파생 state

```jsx
// ❌ effect로 갱신 — 렌더가 한 번 더
function TodoList({todos, filter}) {
  const [visible, setVisible] = useState([])
  useEffect(() => {
    setVisible(todos.filter((t) => t.status === filter))
  }, [todos, filter])
  return <List items={visible} />
}

// ✅ 렌더 중 계산
function TodoList({todos, filter}) {
  const visible = todos.filter((t) => t.status === filter)
  return <List items={visible} />
}
```

---

## 대표 사례: 이벤트 반응

```jsx
// ❌ isBought state → effect로 알림
useEffect(() => {
  if (isBought) {
    showNotification(`${product.name} 구매 완료!`)
  }
}, [isBought])

// ✅ 핸들러에서 바로
const handleBuy = () => {
  showNotification(`${product.name} 구매 완료!`)
}
```

**"왜 이 알림이 떴는가"** 를 코드만 봐도 알 수 있어야 한다.

---

## 판별 플로우차트

```
렌더 중 계산 가능?     → 렌더 중 (Effect ❌)
사용자 액션 반응?       → 이벤트 핸들러 (Effect ❌)
prop으로 state 동기화?  → state lifting (Effect ❌)
React 바깥과 동기화?    → useEffect ✅
```

이 플로우를 통과해야 비로소 Effect의 정당한 사용이다.

---

## 그럼에도 써야 하는 경우

| 상황                           | Effect? | 비고                                     |
| ------------------------------ | ------- | ---------------------------------------- |
| 브라우저 API (title, observer) | ✅      | cleanup 필수                             |
| 서드파티 라이브러리            | ✅      | 인스턴스 생성/파괴                       |
| 외부 스토어 구독               | △       | `useSyncExternalStore` 우선 (Part 5)     |
| 타이머                         | ✅      | stale closure 주의 (Part 3)              |
| 네트워크                       | △       | Server Component / `use()` 우선 (Part 6) |

---

## Part 2 — Race Condition

---

## 상황 재현

```jsx
useEffect(() => {
  fetch(`/search?q=${query}`)
    .then((r) => r.json())
    .then(setResults)
}, [query])
```

`a` → `ab` 빠르게 입력:

1. `a` fetch 시작 (3초)
2. `ab` fetch 시작 (1초)
3. `ab` 응답 먼저 표시 ✓
4. **`a` 응답 나중 도착 → 덮어씀** ✗

---

## 기본 해결: AbortController

```jsx
useEffect(() => {
  const controller = new AbortController()
  fetch(`/search?q=${query}`, {signal: controller.signal})
    .then((r) => r.json())
    .then(setResults)
    .catch((err) => {
      if (err.name !== 'AbortError') throw err
    })
  return () => controller.abort()
}, [query])
```

- 요청 자체 중단 → 서버 부하 감소
- 모바일 저속 네트워크 데이터 절약

---

## 한 발 더: 데이터 페칭 라이브러리

```jsx
// TanStack Query
const {data} = useQuery({
  queryKey: ['search', query],
  queryFn: ({signal}) =>
    fetch(`/search?q=${query}`, {signal}).then((r) => r.json()),
})
```

내부적으로는 `queryKey`마다 **AbortController + promise identity check**를 자동으로 걸어준다. 앞의 손으로 짠 패턴을 key 단위로 정규화한 것.

→ 요청 취소, 중복 제거, 캐싱, 재시도까지 한 번에.

---

## 더 미묘한 케이스 1 — Optimistic update

```jsx
// 좋아요: 즉시 UI 반영 → 서버 검증 → 실패 시 롤백
async function toggleLike(postId) {
  setLiked(true) // ① 낙관적 반영
  try {
    await api.like(postId) // ② 서버 요청
  } catch {
    setLiked(false) // ③ 롤백
  }
}
```

빠르게 두 번 눌렀을 때 **②가 엉켜서** 최종 상태가 서버와 어긋날 수 있다.

---

## Optimistic update 해결: 요청에 번호 붙이기

```jsx
let latestId = 0

async function toggleLike(postId) {
  const myId = ++latestId
  setLiked(true)
  try {
    await api.like(postId)
  } catch {
    if (myId === latestId) setLiked(false) // 내가 최신일 때만 롤백
  }
}
```

아이디어는 AbortController와 같다. **"내가 최신 요청인가"를 확인한 뒤 UI에 반영.** AbortController는 요청 자체를 중단시키고, 이 패턴은 결과가 돌아와도 무시한다.

> race condition은 fetch만의 문제가 아니다. **비동기 결과가 UI 상태를 덮어쓰는 모든 지점**에서 발생한다.

---

## Part 3 — Stale Closure

---

## 데모: 카운트가 안 올라간다

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1) // 이 count는 "첫 렌더의 0"
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return <div>{count}</div>
}
```

화면은 `0` → `1` 에서 멈춘다. 왜?

---

## 핵심: 매 렌더는 스냅샷

Dan Abramov의 [_A Complete Guide to useEffect_](https://overreacted.io/a-complete-guide-to-useeffect/):

> **Each render has its own props, state, effects, and event handlers.**

첫 렌더의 클로저는 **첫 렌더의 `count = 0`** 을 움켜쥔 채 interval 안에서 영원히 산다.

이게 stale closure — 오래된 스냅샷을 보는 함수.

---

## 해결 3종

```jsx
// 1. deps에 정직하게 — count 바뀔 때마다 interval 재등록
useEffect(() => {
  setInterval(/*...*/)
}, [count])

// 2. functional update — 클로저에 값 안 넣음 (권장)
setCount((prev) => prev + 1)

// 3. ref — 값을 "바깥 저장소"에
useEffect(() => {
  countRef.current = count
})
```

1번은 단순히 비효율이 아니라 **매 1초마다 타이머가 해제·재등록되어 타이밍이 어긋난다.** 그래서 보통 2번(functional update)이 권장된다.

---

## 여기서 멈추지 않는다

대부분의 가이드는 "해결 3종" 에서 끝난다. 하지만 진짜 질문은:

> **어떤 값은 deps에 넣고, 어떤 값은 넣지 말아야 하는가?**

이게 Part 4의 주제다.

---

## Part 4 — Reactive vs Latest

---

## 두 종류의 값

Effect 안에서 참조하는 값은 두 부류:

**Reactive value** — 바뀌면 effect를 **다시 실행해야** 하는 값

- 예: `roomId` — 방이 바뀌면 재연결해야 함

**Latest value** — 값은 최신으로 읽되 **재실행은 안 해야** 하는 값

- 예: `theme` — 메시지 로그에 현재 테마를 찍지만, 테마 바뀌었다고 재연결 X

---

## 기존 방식으로는 분리 불가

```jsx
useEffect(() => {
  const conn = connect(roomId)
  conn.on('message', (msg) => {
    log(`[${theme}] ${msg}`) // theme도 쓰임
  })
  return () => conn.disconnect()
}, [roomId, theme]) // ← theme 넣으면 재연결됨
// theme 빼면 → stale closure
```

ref로 우회는 가능하지만 수동이고 실수 쉽다.

---

## useEffectEvent (React 19.2)

```jsx
import {useEffectEvent} from 'react'

const onMessage = useEffectEvent((msg) => {
  log(`[${theme}] ${msg}`) // 항상 최신 theme
})

useEffect(() => {
  const conn = connect(roomId)
  conn.on('message', onMessage)
  return () => conn.disconnect()
}, [roomId]) // ✅ theme deps 없이 최신값 보장
```

`useEffectEvent`는 **"reactive가 아닌 값을 읽는 창구"**.

---

## 판단 기준

> **"이 값이 바뀌면, 내 effect는 처음부터 다시 시작돼야 하는가?"**

- **YES** → reactive → deps에 포함
- **NO** → latest → `useEffectEvent`로 읽기

참고: [Separating Events from Effects — React 공식](https://react.dev/learn/separating-events-from-effects)

---

## Setup / Cleanup은 쌍을 이뤄야 한다

Effect는 "한 번 실행되는 사이드이펙트"가 아니라 **"유지되는 연결"**. setup이 시작한 것은 cleanup이 정확히 되돌려야 한다.

```jsx
// ❌ setup은 구독을 만드는데 cleanup이 없음 → 리소스 누적
useEffect(() => {
  conn.on('msg', handler)
  // return이 없음
}, [])

// ✅ setup 1회 = cleanup 1회, 완벽한 대칭
useEffect(() => {
  conn.on('msg', handler)
  return () => conn.off('msg', handler)
}, [])
```

대칭이 깨지는 가장 흔한 실수: 구독은 등록했는데 해제는 안 하기, 타이머는 시작했는데 clear는 안 하기.

---

## Strict Mode가 강제하는 규율

```
dev에서만: mount → unmount → mount (의도적으로 두 번)
```

개발 모드에서 React는 일부러 Effect를 한 번 더 돌려서 **setup/cleanup 쌍이 제대로 맞춰져 있는지** 드러낸다. 여기서 잡히는 버그:

- cleanup 없는 구독 → 두 번째 mount에서 리스너가 이중으로 붙음
- 네트워크 요청의 race condition → 같은 요청이 두 번 날아가 가시화됨
- setup이 모듈 레벨의 상태를 건드리는데 cleanup이 복구 안 함 → 두 번째 mount가 깨짐

프로덕션은 한 번이지만 개발 중 이중 실행은 **대칭이 무너지는 지점을 드러내는 장치**다.

---

## Part 5 — 실행 타이밍 & Tearing

---

## 세 가지 Effect 훅

```
render → [insertion effect] → DOM mutation → [layout effect] → paint → [effect]
```

| 훅                   | 타이밍                   | 용도                       |
| -------------------- | ------------------------ | -------------------------- |
| `useInsertionEffect` | DOM mutation **전**      | CSS-in-JS 스타일 주입      |
| `useLayoutEffect`    | DOM mutation 후 paint 전 | 레이아웃 측정 → state 반영 |
| `useEffect`          | paint **후**             | 대부분의 사이드이펙트      |

셋 다 commit 단계에 속하지만, **DOM 변경 전 / 변경 후 paint 전 / paint 후**로 세분화된 것.

---

## useLayoutEffect — 언제 필요한가

```jsx
function Tooltip({target}) {
  const [pos, setPos] = useState({top: 0, left: 0})
  const ref = useRef(null)

  useLayoutEffect(() => {
    const rect = target.getBoundingClientRect()
    const h = ref.current.offsetHeight
    setPos({top: rect.top - h, left: rect.left})
  }, [target])

  return (
    <div ref={ref} style={pos}>
      ...
    </div>
  )
}
```

`useEffect`면 → 잘못된 위치로 paint → 재계산 → **깜빡임**. layout effect는 paint 전 동기 실행.

---

## useInsertionEffect — CSS-in-JS의 해결사

```jsx
// styled-components 같은 라이브러리 내부
useInsertionEffect(() => {
  injectStyleSheet(rules) // commit 전에 DOM에 있어야
}, [rules])
```

왜 있는가:

- `useLayoutEffect`에서 스타일 주입하면 자식들이 **스타일 없이 측정**됨
- `useInsertionEffect`는 **DOM mutation 직전**에 실행 → 측정 시 스타일이 이미 있음

실무에서 직접 쓸 일은 거의 없다. **"왜 존재하는지" 이해**가 목적.

---

## Tearing — 동시성 모드의 숨은 적

```
1. 외부 스토어 값 = 10
2. 컴포넌트 A 렌더 → 10 읽음
3. (React가 양보, yield)
4. 외부 스토어 값 = 20 (다른 코드가 바꿈)
5. 컴포넌트 B 렌더 → 20 읽음
6. 같은 화면에 A=10, B=20  ← tearing
```

`useState + useEffect`로 외부 값을 구독하면 **이게 실제로 발생 가능**.

---

## useSyncExternalStore가 푸는 방식

```jsx
const value = useSyncExternalStore(
  subscribe, // 구독 등록/해제
  getSnapshot, // 현재 값 (동기)
  getServerSnapshot, // SSR용
)
```

- React가 렌더 중 일관성을 위해 `getSnapshot()`을 **동기적으로** 호출
- 같은 렌더 패스 안에서는 항상 같은 값
- 렌더 도중 값이 바뀌면 React가 자동으로 다시 렌더
- Zustand, Jotai, Redux 최신 버전이 내부적으로 사용

---

## 실사용 예시

```jsx
// navigator.onLine
const isOnline = useSyncExternalStore(
  (cb) => {
    window.addEventListener('online', cb)
    window.addEventListener('offline', cb)
    return () => {
      window.removeEventListener('online', cb)
      window.removeEventListener('offline', cb)
    }
  },
  () => navigator.onLine,
  () => true,
)
```

> **읽기 전용 외부 값을 구독**하는 모든 케이스 → 이걸로.

---

## Part 6 — Suspense · use() · 커스텀 훅

---

## render-as-you-fetch vs fetch-on-render

```
기존 (fetch-on-render):
  렌더 → mount → useEffect fetch → 로딩 상태
  [부모] → [자식 mount → fetch] → [손자 mount → fetch]  ← waterfall

모던 (render-as-you-fetch):
  렌더 시작과 동시에 fetch → Suspense로 대기
  [부모 렌더 순간 트리 전체의 fetch 트리거]
```

핵심 차이: **waterfall 제거**.

---

## use() hook

```jsx
function UserProfile({userPromise, postsPromise}) {
  const user = use(userPromise) // suspend
  const posts = use(postsPromise) // suspend
  return <Layout user={user} posts={posts} />
}

;<Suspense fallback={<Spinner />}>
  <UserProfile
    userPromise={fetchUser(id)} // 병렬 시작
    postsPromise={fetchPosts(id)} // 병렬 시작
  />
</Suspense>
```

**useEffect도, useState도 없음.** 로딩/에러는 Suspense / ErrorBoundary가 담당.

---

## 커스텀 훅 — 이펙트를 감춰라

```jsx
// ❌ 사용자가 effect를 관리
function useChat(roomId) {
  return {roomId, setMessages: ...}
}
// 사용처에서 useEffect로 subscribe 직접 호출...

// ✅ Effect를 훅 안에 캡슐화
function useChat(roomId) {
  const [messages, setMessages] = useState([])
  useEffect(() => {
    const conn = connect(roomId)
    conn.on('msg', (m) => setMessages((prev) => [...prev, m]))
    return () => conn.disconnect()
  }, [roomId])
  return messages
}
```

---

## 커스텀 훅 설계 원칙

1. **Effect를 반환값으로 돌려주지 마라** — 호출자가 다시 effect로 묶으면 타이밍이 꼬인다
2. **객체 props는 destructure** — `useHook({a, b})` 받으면 내부에서 꺼내서 각각 deps에
3. **한 훅 = 한 관심사** — 독립된 동기화는 여러 훅으로
4. **cleanup 경계를 명확히** — 훅이 제공한 리소스는 훅의 cleanup에서 회수

참고: [Reusing Logic with Custom Hooks — React 공식](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## Part 7 — 체크리스트

---

## useEffect 의사결정 순서

```
1. React 바깥과 동기화? 아니면 → Effect 아님
2. 외부 스토어 구독? → useSyncExternalStore
3. 데이터 페칭? → Server Component / use() / React Query
4. state/props 참조? → reactive vs latest 구분
                       latest는 useEffectEvent
5. cleanup이 idempotent? Strict Mode로 검증?
6. 레이아웃 측정? → useLayoutEffect
7. 한 Effect = 한 동기화. 독립된 건 분리.
```

---

## 한 줄 요약

> useEffect는 도구다. 진짜 실력은 **쓰지 않아도 되는 구조를 만드는 것**,
> 써야 할 때는 **reactive · latest · cleanup** 을 구분하는 것이다.

<!-- _class: invert -->

---

## Q&A

<!-- _class: invert -->

---

## Q. Effect 안에서 async 함수를 바로 쓸 수 없나요?

`useEffect`는 반환값으로 cleanup을 기대하는데 `async`는 Promise를 반환한다.

```jsx
// ❌ 직접 async 불가
useEffect(async () => { /* ... */ }, [])

// ✅ 내부에 async 선언
useEffect(() => {
  const run = async () => { setData(await fetch(...)) }
  run()
}, [])
```

이렇게 해도 race condition은 그대로 — Part 2 해결책과 함께.

---

## Q. deps 배열 ESLint 경고, 그냥 끄면 안 되나요?

대부분 **stale closure 버그를 심는 행위**. 경고가 뜨는 진짜 원인은 보통 둘 중 하나:

- 함수를 Effect 바깥에서 만들고 있다 → Effect 안으로 / `useCallback`
- 최신 state를 읽고 싶다 → `useEffectEvent`

> 비활성화보다 구조를 고치는 쪽을 먼저.

---

## Q. useSyncExternalStore vs useEffect?

| 구분                  | useEffect                | useSyncExternalStore |
| --------------------- | ------------------------ | -------------------- |
| 외부 스토어 구독      | tearing 위험             | ✅ 권장              |
| 브라우저 API 1회 설정 | ✅ (`document.title`)    | 부적합               |
| 네트워크 fetch        | 가능 (라이브러리가 나음) | 부적합               |
| 동시성 안전           | ❌                       | ✅                   |

**읽기 전용 외부 값 구독** → `useSyncExternalStore`, **부수 효과 + cleanup** → `useEffect`.

---

## Q. React Compiler가 나오면 이 내용도 사라지나요?

Compiler는 `useMemo` / `useCallback` 을 자동화하지만 **Effect 관련은 대부분 유효**:

- 안티패턴 (파생 state, 이벤트 로직) — 컴파일러가 고쳐주지 않음
- race condition — 설계 문제, 컴파일러 영역 밖
- reactive vs latest — `useEffectEvent`가 공식 해결책이지 컴파일러가 아님
- tearing — `useSyncExternalStore`가 답

---

## Q. 독립된 동기화를 한 Effect에 묶어도 되나요?

```jsx
// ❌ title과 WebSocket이 같이 묶임
useEffect(() => {
  document.title = `${user.name} - 마이페이지`
  const ws = new WebSocket(`/chat/${chatId}`)
  return () => ws.close()
}, [user.name, chatId])
```

`user.name`이 바뀌면 **WebSocket까지 재연결**됨.

> **각 Effect는 하나의 독립된 동기화 프로세스.**

---

## 독립 동기화는 Effect 쪼개기

```jsx
useEffect(() => {
  document.title = `${user.name} - 마이페이지`
}, [user.name])

useEffect(() => {
  const ws = new WebSocket(`/chat/${chatId}`)
  return () => ws.close()
}, [chatId])
```

Effect를 나누는 건 **성능 최적화가 아니라 정확성**의 문제.

---

## Q. `use(fetchUser(id))` — 매 렌더마다 새 promise 아닌가요?

맞다. 그대로 쓰면 **렌더마다 새 요청**이 나간다.

```jsx
// ❌ 렌더마다 fetchUser 재호출 → 무한 Suspense
function UserProfile({id}) {
  const user = use(fetchUser(id))
  return <div>{user.name}</div>
}
```

해결은 **promise를 렌더 바깥에서 안정시키는 것** — 다음 슬라이드에서.

---

## `use()` — promise를 안정시키는 두 가지 방법

```jsx
// ✅ Server Component — 요청당 한 번만 실행
async function Page({id}) {
  const userPromise = fetchUser(id)
  return <UserProfile userPromise={userPromise} />
}

// ✅ React.cache — 같은 인자면 같은 promise 반환
const getUser = cache((id) => fetch(`/api/user/${id}`).then((r) => r.json()))
```

> `use()`는 promise를 **기다리는 창구**일 뿐. promise를 **언제 만들지**는 우리가 책임져야 한다.

---

## Q. Server Component가 Effect를 대체한다는 게?

과거:

```jsx
function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then(setData)
  }, [])
  if (!data) return <Spinner />
  return <Posts data={data} />
}
```

---

## Server Component 패턴

```jsx
async function Page() {
  const data = await fetchPosts()
  return <Posts data={data} />
}
```

- **Effect 없음, useState 없음, 로딩 상태 없음**
- race condition 원천 차단
- 번들 사이즈도 감소

> 데이터 페칭에 한해서는 **Effect 없는 세계**가 이미 와 있다.

---

## 더 읽을거리 — 필수

- [You Might Not Need an Effect — React 공식](https://react.dev/learn/you-might-not-need-an-effect)
- [A Complete Guide to useEffect — Dan Abramov](https://overreacted.io/a-complete-guide-to-useeffect/)
- [Separating Events from Effects — React 공식](https://react.dev/learn/separating-events-from-effects)

### 심화

- [Hooks, Dependencies and Stale Closures — tkdodo](https://tkdodo.eu/blog/hooks-dependencies-and-stale-closures)
- [Simplifying useEffect — tkdodo](https://tkdodo.eu/blog/simplifying-use-effect)

---

## 더 읽을거리 — 최신 & 도구

### React 19 이후

- [useEffectEvent (React 19.2) — LogRocket](https://blog.logrocket.com/react-useeffectevent/)
- [useSyncExternalStore Demystified — Kent C. Dodds](https://www.epicreact.dev/use-sync-external-store-demystified-for-practical-react-development-w5ac0)

### 도구

- [eslint-plugin-react-you-might-not-need-an-effect](https://www.npmjs.com/package/eslint-plugin-react-you-might-not-need-an-effect)
- [Reusing Logic with Custom Hooks — React 공식](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

# 감사합니다

<!-- _class: invert -->

@yceffort
