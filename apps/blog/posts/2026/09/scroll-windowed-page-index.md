---
title: 스크롤에 맞춰 5개씩 움직이는 페이지 인덱스 만들기
tags:
  - next
  - react
  - typescript
  - frontend
published: true
date: 2026-09-15 17:03:37
description: 스크롤 위치를 페이지 번호로 바꾸는 일반적인 방법과 Kineto의 씬 단위 RailIndex 구현을 정리한다.
---

## Table Of Contents

## 100개의 번호를 한꺼번에 보여줄 필요는 없다

영상 기록을 넘기면서 현재 위치를 알려주는 인덱스가 필요했다. 기록이 네 개일 때는 aside에 현재 번호와 전체 개수를 적는 것으로 충분했다.

```text
01
04
```

기록이 100개를 넘기면 같은 구조를 쓰기 어렵다. 번호를 모두 세로로 쌓으면 aside가 본문보다 길어지고, `overflow: hidden`으로 가려도 브라우저는 100개의 요소를 배치해야 한다. 현재 번호만 표시하면 앞뒤 기록의 범위를 알 수 없다.

화면에는 번호를 다섯 개만 남기기로 했다.

```text
01  ← 현재 페이지
02
03
04
05
```

사용자가 1번부터 5번까지 스크롤하는 동안 목록은 그대로 유지한다. 현재 페이지에 해당하는 번호만 굵게 바꾼다. 6번 페이지가 활성화되는 순간 다음 묶음을 표시한다.

```text
06  ← 현재 페이지
07
08
09
10
```

이 UI에는 두 종류의 변화가 있다.

- 같은 묶음 안에서는 active 번호만 바뀐다.
- 묶음의 경계를 넘으면 번호 목록 전체가 다음 다섯 개로 바뀐다.

CSS는 다섯 번호의 배치와 전환을 맡는다. 어떤 번호 다섯 개를 렌더링할지는 React가 계산한다.

---

## RailIndex는 두 계산을 연결한다

RailIndex는 스크롤 진행률을 숫자로 바꾸는 컴포넌트가 아니다. 현재 화면을 대표하는 콘텐츠 단위를 먼저 고르고, 그 단위의 번호가 들어 있는 작은 목록만 렌더링한다.

```text
스크롤 위치
  → 현재 콘텐츠 단위 찾기
  → activeIndex 계산
  → activeIndex가 속한 번호 묶음 계산
  → 번호 목록과 active 스타일 렌더링
```

앞부분은 scroll spy에 가깝고, 뒷부분은 windowed pagination에 가깝다. 두 계산을 분리하면 스크롤 감지 방식을 바꿔도 번호 묶음 계산은 그대로 쓸 수 있다.

### 일반적인 페이지 인덱스

본문이 문서 흐름을 따라 이어지고 `<section>` 하나가 번호 하나에 대응한다면 `IntersectionObserver`로 충분하다. 컨테이너 중앙에 좁은 감지 영역을 만들고, 그 영역에 들어온 section의 번호를 상태에 넣는다.

```tsx
useEffect(() => {
  const scrollRoot = document.querySelector<HTMLElement>('.content-list')
  const sections = scrollRoot?.querySelectorAll<HTMLElement>('[data-page]')

  if (!scrollRoot || !sections?.length) {
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries.find((entry) => entry.isIntersecting)

      if (current) {
        setActiveIndex(Number((current.target as HTMLElement).dataset.page))
      }
    },
    {
      root: scrollRoot,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    },
  )

  sections.forEach((section) => observer.observe(section))
  return () => observer.disconnect()
}, [])
```

브라우저가 교차 여부를 계산하므로 애플리케이션 코드에서 매 scroll 이벤트마다 모든 section의 좌표를 읽지 않아도 된다. 일정한 높이의 섹션이 차례대로 놓인 문서, 목차, 슬라이드형 페이지에 맞는다.

### Kineto에서 바뀌는 기준

Kineto는 저널 카드 다섯 개를 하나의 `journal-page` 씬에 배치한다. 카드들은 씬 안에서 서로 다른 높이와 위치를 가지며, 브라우저 창 대신 `.journal-list`가 스크롤된다. RailIndex의 번호 하나는 카드 하나가 아니라 씬 하나를 뜻한다.

| 구분        | 일반적인 구현               | Kineto 구현                           |
| ----------- | --------------------------- | ------------------------------------- |
| 번호 단위   | section 또는 콘텐츠 한 개   | 저널 5개를 담은 씬 한 개              |
| 스크롤 대상 | `window` 또는 일반 컨테이너 | 고정 화면 안의 `.journal-list`        |
| 감지 방식   | `IntersectionObserver`      | 컨테이너 기준선과 씬 중앙의 거리 비교 |
| DOM 표식    | `data-page={index + 1}`     | `data-kineto-page={sceneIndex + 1}`   |
| 전체 개수   | 콘텐츠 배열의 길이          | `ceil(저널 수 / 5)`                   |
| 갱신 제한   | 브라우저 observer           | `requestAnimationFrame`               |

번호 단위와 `total`의 단위를 맞춰야 한다. 저널이 20개라면 Kineto의 씬과 RailIndex 번호는 각각 4개다. `total={20}`을 넘기면 스크롤할 수 없는 05–20 번호가 생긴다.

---

## 필요한 상태를 세 개로 줄인다

인덱스를 계산하려면 다음 값이 필요하다.

```ts
const total = 100
const activeIndex = 1
const windowSize = 5
```

`total`은 전체 인덱스 수, `activeIndex`는 현재 번호다. `windowSize`는 한 번에 노출할 번호 개수다. Kineto에서는 앞의 두 값이 모두 씬 단위를 사용한다.

현재 묶음의 시작 번호는 다음 식으로 구한다.

```ts
const windowStart = Math.floor((activeIndex - 1) / windowSize) * windowSize + 1
```

페이지 번호는 1부터 시작하지만 배열 인덱스와 나눗셈은 0부터 세는 편이 쉽다. 먼저 `activeIndex - 1`로 0부터 시작하는 값으로 바꾸고, 현재 페이지가 몇 번째 묶음에 속하는지 계산한다. 마지막에 1을 더해 다시 페이지 번호로 돌려놓는다.

| activeIndex | 계산                           | windowStart |
| ----------- | ------------------------------ | ----------- |
| 1           | `floor((1 - 1) / 5) * 5 + 1`   | 1           |
| 5           | `floor((5 - 1) / 5) * 5 + 1`   | 1           |
| 6           | `floor((6 - 1) / 5) * 5 + 1`   | 6           |
| 37          | `floor((37 - 1) / 5) * 5 + 1`  | 36          |
| 100         | `floor((100 - 1) / 5) * 5 + 1` | 96          |

1번과 5번은 같은 `1–5` 묶음에 속한다. 6번에서 시작 번호가 6으로 바뀐다. 100번은 `96–100` 묶음에 들어간다.

---

## 현재 묶음만 만든다

시작 번호를 구했으면 화면에 그릴 번호 배열을 만든다.

```ts
const visibleIndices = Array.from(
  {
    length: Math.min(windowSize, total - windowStart + 1),
  },
  (_, index) => windowStart + index,
)
```

`total - windowStart + 1`은 마지막 묶음에 남은 페이지 수다. 전체 페이지가 102개라면 마지막 묶음은 세 개가 아니라 두 개다.

```text
96 97 98 99 100
101 102
```

`Math.min()`이 남은 페이지 수와 `windowSize` 중 작은 값을 고르기 때문에 103, 104, 105는 생성되지 않는다.

현재 구현은 100개의 번호를 만든 뒤 CSS로 95개를 숨기지 않는다. React가 현재 묶음에 속한 번호만 다섯 개 이하로 만든다. 페이지가 100개에서 1,000개로 늘어도 인덱스가 렌더링하는 `<li>` 개수는 같다.

번호 표기는 최소 두 자리로 맞춘다.

```ts
function formatIndex(value: number) {
  return String(value).padStart(2, '0')
}
```

전체 페이지가 100개여도 첫 번호는 `001`이 아니라 `01`로 표시된다. `padStart(2, '0')`은 1부터 9까지만 0을 붙이고, 100 같은 세 자리 숫자는 그대로 둔다.

---

## 내부 스크롤 위치를 페이지 번호로 바꾼다

Kineto는 먼저 저널 배열을 다섯 개씩 잘라 씬을 만든다. `data-kineto-page`는 개별 카드가 아닌 `.journal-page`에 붙인다.

```tsx
const JOURNALS_PER_SCENE = 5
const scenes = chunk(pages, JOURNALS_PER_SCENE)

return scenes.map((scene, sceneIndex) => (
  <section
    className="journal-page"
    key={sceneIndex}
    data-kineto-page={sceneIndex + 1}
  >
    {scene.map((page, slotIndex) => (
      <JournalCard key={page.id} page={page} slot={slotIndex + 1} />
    ))}
  </section>
))
```

배열의 `sceneIndex`는 0부터 시작하고 RailIndex는 1부터 시작한다. 여기서 `+ 1`을 빼면 네 개의 씬이 `0, 1, 2, 3`으로 표시된다. RailIndex는 0을 유효한 번호로 보지 않고 첫 번째 요소의 fallback 값인 1을 사용한다. 첫째 씬과 둘째 씬이 모두 1이 되어 active 번호가 `01–03`까지만 움직이는 버그가 생긴다.

처음 구현은 브라우저 창을 스크롤했다. 기준선도 `window.innerHeight`로 계산했다.

```ts
const viewportAnchor = window.innerHeight * 0.45
```

화면을 고정하고 `.journal-list`만 스크롤하도록 레이아웃을 바꾸자 이 계산이 틀어졌다. 브라우저 창의 높이에는 헤더와 여백도 포함된다. 씬이 실제로 지나가는 영역은 `.journal-list` 안쪽뿐이다.

스크롤 컨테이너와 씬을 같은 좌표계에서 비교해야 한다. 먼저 컨테이너를 찾고 씬 조회 범위도 그 안으로 좁힌다.

```ts
const scrollRoot = document.querySelector<HTMLElement>('.journal-list')

if (!scrollRoot) {
  return
}

const sceneElements = Array.from(
  scrollRoot.querySelectorAll<HTMLElement>('[data-kineto-page]'),
)
```

`getBoundingClientRect()`는 요소 위치를 브라우저 viewport 좌표로 반환한다. 컨테이너의 `top`과 씬의 `top`도 같은 원점을 사용한다.

```text
브라우저 viewport의 top: 0

┌─ journal-list: rootBounds.top
│
│       기준선: rootBounds.top + clientTop + clientHeight × 0.5
│
└─ journal-list의 bottom
```

컨테이너 안쪽 높이의 50%를 기준선으로 잡는다.

```ts
const rootBounds = scrollRoot.getBoundingClientRect()
const viewportAnchor =
  rootBounds.top + scrollRoot.clientTop + scrollRoot.clientHeight * 0.5
```

`clientTop`은 위쪽 테두리 두께다. 현재 디자인에는 테두리가 없어 값이 0이지만, 기준선을 컨테이너의 실제 내용 영역에서 계산하려고 식에 포함했다.

여기에는 `scrollRoot.scrollTop`을 더하지 않는다. `scrollTop`은 스크롤 콘텐츠 내부 좌표이고 `getBoundingClientRect()`는 viewport 좌표다. 둘을 섞으면 스크롤한 거리를 두 번 반영한다.

### Kineto에서는 씬 중앙점을 비교한다

각 씬 안의 카드는 자유롭게 배치되지만 RailIndex는 카드 위치를 읽지 않는다. `.journal-page`의 중앙과 컨테이너 기준선 사이의 거리를 비교한다. 카드 배치를 바꿔도 씬 번호가 바뀌는 지점은 유지된다.

```ts
const bounds = sceneElement.getBoundingClientRect()
const sceneCenter = bounds.top + bounds.height / 2
const distance = Math.abs(sceneCenter - viewportAnchor)
```

모든 씬의 `distance`를 비교해서 가장 가까운 씬 번호를 현재 페이지로 사용한다.

```ts
let closestIndex: number | null = null
let closestDistance = Number.POSITIVE_INFINITY

sceneElements.forEach((sceneElement, index) => {
  const bounds = sceneElement.getBoundingClientRect()

  if (bounds.height === 0) {
    return
  }

  const declaredIndex = Number(sceneElement.dataset.kinetoPage)
  const pageIndex =
    Number.isFinite(declaredIndex) && declaredIndex > 0
      ? declaredIndex
      : index + 1

  const sceneCenter = bounds.top + bounds.height / 2
  const distance = Math.abs(sceneCenter - viewportAnchor)

  if (distance < closestDistance) {
    closestDistance = distance
    closestIndex = Math.min(total, Math.trunc(pageIndex))
  }
})
```

기준선을 위아래로 옮기고 싶다면 마지막 비율만 조정한다.

- `0.35`: 씬이 위쪽에 도달했을 때 번호가 바뀐다.
- `0.5`: 컨테이너 중앙에서 번호가 바뀐다.
- `0.65`: 다음 씬이 아래쪽에 들어올 때 번호가 바뀐다.

현재 레이아웃은 `0.5`를 사용한다. 카드 크기나 간격을 바꿔도 기준선은 `.journal-list` 중앙에 남는다.

### scroll 이벤트를 프레임당 한 번만 처리하기

브라우저는 스크롤하는 동안 짧은 간격으로 `scroll` 이벤트를 보낸다. 이벤트마다 모든 페이지의 위치를 계산하면 같은 화면 프레임 안에서 계산을 반복할 수 있다.

`requestAnimationFrame()`으로 한 프레임에 한 번만 위치를 확인한다.

```ts
useEffect(() => {
  let animationFrame = 0
  const scrollRoot = document.querySelector<HTMLElement>('.journal-list')

  if (!scrollRoot) {
    return
  }

  const updateActiveIndex = () => {
    animationFrame = 0

    const sceneElements =
      scrollRoot.querySelectorAll<HTMLElement>('[data-kineto-page]')

    // 기준선과 가장 가까운 씬을 찾아 activeIndex를 갱신한다.
  }

  const scheduleUpdate = () => {
    if (animationFrame === 0) {
      animationFrame = requestAnimationFrame(updateActiveIndex)
    }
  }

  scheduleUpdate()
  scrollRoot.addEventListener('scroll', scheduleUpdate, {passive: true})
  window.addEventListener('resize', scheduleUpdate)

  return () => {
    cancelAnimationFrame(animationFrame)
    scrollRoot.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
  }
}, [total])
```

스크롤 이벤트는 실제로 스크롤되는 `.journal-list`에서 받아야 한다. `scroll` 이벤트는 `window`까지 버블링되지 않는다. `passive: true`는 핸들러가 스크롤을 취소하지 않는다는 사실을 브라우저에 알려준다. cleanup에서는 예약한 프레임과 이벤트 리스너를 함께 제거한다.

상태도 값이 달라질 때만 갱신한다.

```ts
setObservedIndex((previousIndex) =>
  previousIndex === nextIndex ? previousIndex : nextIndex,
)
```

같은 페이지 안에서 스크롤할 때 발생하는 React 렌더링을 줄일 수 있다.

---

## 같은 묶음에서는 active 스타일만 바꾼다

렌더링 코드는 현재 번호에 `is-active` 클래스를 붙인다.

```tsx
<ol className="rail-index-list" key={windowStart} start={windowStart}>
  {visibleIndices.map((index) => (
    <li className={index === activeIndex ? 'is-active' : undefined} key={index}>
      {formatIndex(index)}
    </li>
  ))}
</ol>
```

기본 번호는 흐리게 두고 현재 번호의 색과 굵기를 바꾼다.

```css
.rail-index-list li {
  display: grid;
  place-items: center;
  height: 1.2rem;
  opacity: 0.52;
  font-weight: 400;
  transition:
    color 220ms ease,
    opacity 220ms ease,
    transform 220ms ease;
}

.rail-index-list li.is-active {
  color: var(--ink);
  opacity: 1;
  font-weight: 700;
  transform: scale(1.06);
}
```

1번에서 5번까지 움직이는 동안 `windowStart`는 계속 1이다. `<ol>`도 유지되며 각 `<li>`의 active 클래스만 이동한다.

번호 목록은 시각적인 위치 표시이므로 스크린 리더가 번호를 하나씩 읽지 않게 `aria-hidden`을 붙인다. 현재 위치는 화면 밖 status 요소로 따로 전달한다.

```tsx
<ol className="rail-index-list" aria-hidden="true">
  {/* 화면에 보이는 번호 목록 */}
</ol>

<span className="rail-index-status" aria-live="polite" aria-atomic="true">
  {activeIndex} / {safeTotal} 페이지
</span>
```

---

## 묶음이 바뀔 때만 목록을 움직인다

`key={windowStart}`는 묶음 경계에서 목록을 새 DOM 요소로 교체한다.

```text
activeIndex 5 → windowStart 1
activeIndex 6 → windowStart 6
```

React는 key가 1인 목록을 제거하고 key가 6인 목록을 만든다. 새 목록에 진입 애니메이션이 한 번 실행된다.

```css
.rail-index-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  transform-origin: center;
  animation: rail-index-forward 420ms cubic-bezier(0.2, 0.78, 0.2, 1);
}

@keyframes rail-index-forward {
  from {
    opacity: 0;
    transform: translateY(1.2rem) rotateX(-16deg);
  }
}
```

이 방식은 active 번호가 한 칸 바뀔 때마다 목록 전체를 회전시키지 않는다. 5에서 6, 10에서 11처럼 slice 경계를 통과할 때만 묶음 전환을 보여준다.

움직임을 줄이도록 설정한 사용자에게는 애니메이션을 적용하지 않는다.

```css
@media (prefers-reduced-motion: reduce) {
  .rail-index-list,
  .rail-index-list li {
    transition: none;
    animation: none;
  }
}
```

---

## CSS Grid가 맡을 일과 React가 맡을 일

처음에는 aside 전체를 Grid로 만들고 인덱스를 아래쪽 행에 배치했다.

```css
.side-rail {
  display: grid;
  grid-template-rows: auto minmax(80px, 1fr) auto;
}
```

번호가 두 개일 때는 문제가 드러나지 않았다. 번호 목록을 그대로 늘리자 세 번째 행의 콘텐츠 높이도 같이 늘어났다. `subgrid`까지 섞이면 데스크톱의 세로 레일과 모바일의 가로 레일이 같은 행 구조를 공유하기 어려웠다.

aside는 축과 인덱스라는 두 영역만 배치하면 된다. 이 배치는 Flex로 단순화했다.

```css
.side-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rail-axis {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
}

.rail-index {
  margin-top: auto;
}
```

인덱스 내부에서는 Grid를 계속 사용한다. 여기에는 다섯 번호를 일정한 간격으로 세로 배치하는 일만 남았다. 화면 크기가 작아지면 목록을 가로 Flex로 전환한다.

```css
@media (max-width: 640px) {
  .side-rail {
    flex-direction: row;
  }

  .rail-index-list {
    display: flex;
    gap: 10px;
  }
}
```

레이아웃 도구가 표시할 데이터까지 결정하게 만들면 CSS 규칙이 현재 페이지 상태를 흉내 내야 한다. React가 `visibleIndices`를 계산하면 CSS는 배치와 표현에 집중할 수 있다.

---

## Next.js에서는 클라이언트 경계를 작게 둔다

저널 목록과 씬 개수는 서버에서 계산할 수 있다. 스크롤 위치는 DOM이 생긴 뒤에만 알 수 있으므로 `RailIndex`에만 `'use client'`를 선언한다.

```tsx
// Server Component
export default function Home() {
  const totalIndex = Math.ceil(pages.length / JOURNALS_PER_SCENE)

  return (
    <main className="journal-shell">
      <KinetographStudio currentIndex={1} totalIndex={totalIndex} />
      <ContentWrap />
    </main>
  )
}
```

`totalIndex`에는 저널 수가 아니라 씬 수를 넣는다. 개발 중에 100, 347 같은 값을 넣어 번호 묶음의 경계를 시험할 수 있지만, 실제 데이터와 연결할 때는 `Math.ceil(pages.length / JOURNALS_PER_SCENE)` 또는 `scenes.length`를 사용해야 한다.

`currentIndex`는 DOM을 측정하기 전의 초기값이다. `RailIndex`가 `.journal-list`를 찾고 첫 측정을 마치면 `observedIndex`가 이 값을 대신한다. 서버가 URL이나 저장된 위치에서 시작 번호를 알고 있다면 그 값을 `currentIndex`로 전달할 수 있다.

`KinetographStudio` 전체를 클라이언트 컴포넌트로 바꿀 필요는 없다. 상태와 scroll listener가 필요한 `RailIndex`만 클라이언트에서 실행하고, 서버 컴포넌트는 저널 데이터와 씬 개수를 전달한다.

Next.js 라우트나 별도 스크롤 컨테이너가 현재 페이지 상태를 이미 관리한다면 DOM 위치를 다시 측정하지 않아도 된다. 그 상태를 `current` prop으로 넘기고, `visibleIndices` 계산만 재사용하면 된다.

### 다른 프로젝트에 적용하는 순서

1. 번호 하나가 무엇을 뜻하는지 정한다. section, 슬라이드, Kineto의 씬처럼 DOM 요소 하나와 대응해야 한다.
2. 대상 요소에 1부터 시작하는 `data-*` 번호를 붙인다.
3. 실제 스크롤 컨테이너를 `root`로 잡는다. 내부 스크롤이면 `window`를 사용하지 않는다.
4. 일반 문서 흐름에는 `IntersectionObserver`, 정확한 기준선이 필요한 레이아웃에는 좌표 비교를 사용한다.
5. `total`, `activeIndex`, DOM의 `data-*` 값이 같은 단위를 쓰는지 확인한다.
6. 마지막으로 window 계산과 CSS active 스타일을 붙인다.

---

## 경계값을 먼저 확인한다

전체 페이지가 347개이고 한 묶음이 다섯 개라면 다음 값을 확인한다.

| activeIndex | 화면에 표시할 번호 | active 번호 |
| ----------- | ------------------ | ----------- |
| 1           | 01–05              | 01          |
| 5           | 01–05              | 05          |
| 6           | 06–10              | 06          |
| 10          | 06–10              | 10          |
| 11          | 11–15              | 11          |
| 99          | 96–100             | 99          |
| 100         | 96–100             | 100         |
| 347         | 346–347            | 347         |

개발 중에는 `currentIndex`를 직접 바꾸면 slice 계산과 애니메이션을 빠르게 확인할 수 있다.

```tsx
<KinetographStudio currentIndex={5} totalIndex={347} />
<KinetographStudio currentIndex={6} totalIndex={347} />
```

현재 Kineto의 임시 데이터는 저널 20개를 씬당 5개씩 나눈다. 실제 연결값은 다음과 같다.

| 값                   | 결과           |
| -------------------- | -------------- |
| 저널 수              | 20             |
| 씬 수와 `totalIndex` | 4              |
| `data-kineto-page`   | 1, 2, 3, 4     |
| RailIndex 표시       | 01, 02, 03, 04 |

스크롤 동작을 확인할 때는 씬 요소에 `data-kineto-page`가 빠지지 않았는지 본다. 각 씬의 높이가 0이면 위치 계산에서 제외해야 한다. 모바일에서는 세로 목록이 가로 목록으로 바뀌는지, 동작 줄이기 설정에서는 전환이 멈추는지도 확인한다.

페이지 수가 커져도 인덱스가 처리하는 핵심 값은 현재 번호와 다섯 개짜리 배열이다. 전체 데이터 크기는 표시 영역의 DOM 크기를 바꾸지 않는다.
