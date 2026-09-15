---
title: 스크롤에 맞춰 5개씩 움직이는 페이지 인덱스 만들기
tags:
  - next
  - react
  - typescript
  - frontend
published: true
date: 2026-09-15 17:03:37
description: 긴 페이지 목록을 5개 단위로 잘라 표시하고, 스크롤 위치에 맞춰 현재 번호와 표시 구간을 갱신하는 방법을 정리한다.
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

## 필요한 상태를 세 개로 줄인다

인덱스를 계산하려면 다음 값이 필요하다.

```ts
const total = 100
const activeIndex = 1
const windowSize = 5
```

`total`은 전체 페이지 수, `activeIndex`는 현재 페이지 번호다. `windowSize`는 한 번에 노출할 번호 개수다.

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

## 스크롤 위치를 페이지 번호로 바꾼다

각 페이지의 루트 요소에 순서를 표시한다.

```tsx
{
  pages.map((page, index) => (
    <section key={page.id} data-kineto-page={index + 1}>
      <PageContent page={page} />
    </section>
  ))
}
```

인덱스 컴포넌트는 `[data-kineto-page]` 요소를 찾고, 각 요소의 위치를 `getBoundingClientRect()`로 읽는다.

뷰포트 정중앙보다 조금 위인 45% 지점을 기준선으로 사용했다.

```ts
const viewportAnchor = window.innerHeight * 0.45
```

기준선이 페이지의 위쪽과 아래쪽 사이에 들어오면 그 페이지를 현재 페이지로 정한다.

```ts
const bounds = page.getBoundingClientRect()

const containsAnchor =
  bounds.top <= viewportAnchor && bounds.bottom >= viewportAnchor
```

페이지 사이에 여백이 있어 기준선과 겹치는 요소가 없다면, 기준선에서 가장 가까운 페이지를 고른다.

```ts
const distance = containsAnchor
  ? 0
  : Math.min(
      Math.abs(bounds.top - viewportAnchor),
      Math.abs(bounds.bottom - viewportAnchor),
    )
```

화면의 50% 대신 45%를 사용한 이유는 사용자가 아래로 읽을 때 다음 콘텐츠를 조금 일찍 현재 항목으로 인식하기 때문이다. 카드 높이와 상단 헤더 크기에 따라 40%에서 55% 사이의 값을 직접 조정하면 된다.

### scroll 이벤트를 프레임당 한 번만 처리하기

브라우저는 스크롤하는 동안 짧은 간격으로 `scroll` 이벤트를 보낸다. 이벤트마다 모든 페이지의 위치를 계산하면 같은 화면 프레임 안에서 계산을 반복할 수 있다.

`requestAnimationFrame()`으로 한 프레임에 한 번만 위치를 확인한다.

```ts
useEffect(() => {
  let animationFrame = 0

  const updateActiveIndex = () => {
    animationFrame = 0

    const pages = document.querySelectorAll<HTMLElement>('[data-kineto-page]')

    // 기준선과 가장 가까운 페이지를 찾아 activeIndex를 갱신한다.
  }

  const scheduleUpdate = () => {
    if (animationFrame === 0) {
      animationFrame = requestAnimationFrame(updateActiveIndex)
    }
  }

  scheduleUpdate()
  window.addEventListener('scroll', scheduleUpdate, {passive: true})
  window.addEventListener('resize', scheduleUpdate)

  return () => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
  }
}, [total])
```

`passive: true`는 이 이벤트 핸들러가 스크롤을 취소하지 않는다는 사실을 브라우저에 알려준다. cleanup에서는 예약한 프레임과 이벤트 리스너를 함께 제거한다.

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

페이지 목록과 전체 개수는 서버에서 만들 수 있다. 스크롤 위치는 `window`와 DOM이 생긴 뒤에만 알 수 있으므로 인덱스 컴포넌트에 `'use client'`를 선언한다.

```tsx
// Server Component
export default async function ArchivePage() {
  const pages = await getPages()

  return (
    <main>
      <KinetographStudio currentIndex={1} totalIndex={pages.length} />

      {pages.map((page, index) => (
        <section key={page.id} data-kineto-page={index + 1}>
          <PageContent page={page} />
        </section>
      ))}
    </main>
  )
}
```

`KinetographStudio` 전체를 클라이언트 컴포넌트로 바꿀 필요는 없다. 상태와 스크롤 이벤트가 필요한 `RailIndex`만 클라이언트에서 실행한다. 서버는 페이지 데이터와 초기 인덱스를 props로 전달한다.

Next.js 라우트나 별도 스크롤 컨테이너가 현재 페이지 상태를 이미 관리한다면 DOM 위치를 다시 측정하지 않아도 된다. 그 상태를 `current` prop으로 넘기고, `visibleIndices` 계산만 재사용하면 된다.

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

스크롤 동작을 확인할 때는 페이지 요소에 `data-kineto-page`가 빠지지 않았는지 먼저 본다. 각 페이지의 높이가 0이면 위치 계산에서 제외해야 한다. 마지막으로 모바일에서 세로 목록이 가로 목록으로 바뀌는지, 동작 줄이기 설정에서 전환이 멈추는지 확인한다.

페이지 수가 커져도 인덱스가 처리하는 핵심 값은 현재 번호와 다섯 개짜리 배열이다. 전체 데이터 크기는 표시 영역의 DOM 크기를 바꾸지 않는다.
