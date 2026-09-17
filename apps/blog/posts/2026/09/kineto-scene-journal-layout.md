---
title: Kineto 저널을 씬 단위 스크롤 화면으로 확장하기
tags:
  - next
  - react
  - typescript
  - css
  - frontend
published: true
date: 2026-09-16 15:58:45
description: 세 장의 정적 카드로 시작한 Kineto를 씬 단위 저널로 확장하며 스크롤 인덱스, 미디어 변형, 숫자 대비와 반응형 제목 배치를 다듬은 과정을 기록한다.
---

## Table Of Contents

## 세 장짜리 화면을 여러 씬으로 늘리기

Kineto의 첫 화면에는 세 장의 카드가 절대 위치로 놓여 있었다. 카드 수가 고정되어 있을 때는 각 카드에 별도 클래스를 붙여도 충분했다.

```text
journal-stage
├─ journal-card-one
├─ journal-card-two
└─ journal-card-three
```

저널을 20개로 늘리자 카드 위치, 현재 페이지, 모바일 배치를 함께 계산해야 했다. 전체 기록을 한 화면에 쌓으면 카드 좌표가 길어지고 왼쪽 RailIndex도 무엇을 세는지 모호해진다.

저널 다섯 개를 한 씬으로 묶었다.

```text
20 journals
  → 5 journals per scene
  → 4 journal-page scenes
  → RailIndex 01–04
```

씬은 스크롤과 인덱스의 단위다. 카드는 씬 안에서 자리를 배정받는다. 이 구분 덕분에 저널 개수가 늘어나도 한 씬의 CSS는 다섯 슬롯만 관리한다.

---

## 배열을 다섯 개씩 나눠 씬을 만든다

`JOURNALS_PER_SCENE`을 레이아웃 상수로 두고 범용 `chunk()` 함수에서 사용한다.

```ts
export const JOURNALS_PER_SCENE = 5

export function chunk<T>(items: T[], size = JOURNALS_PER_SCENE): T[][] {
  return Array.from({length: Math.ceil(items.length / size)}, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  )
}
```

`Contents`는 저널 배열을 씬 배열로 바꾼다. 씬 내부의 `slotIndex`는 카드 위치를 고르는 데 사용한다.

```tsx
const scenes = chunk(pages, JOURNALS_PER_SCENE)

return (
  <div className="journal-list">
    {scenes.map((scene, sceneIndex) => (
      <section
        className="journal-page"
        key={sceneIndex}
        data-kineto-page={sceneIndex + 1}
      >
        {scene.map((page, slotIndex) => (
          <article
            className="journal-card"
            data-slot={slotIndex + 1}
            key={page.id}
          >
            {/* card content */}
          </article>
        ))}
      </section>
    ))}
  </div>
)
```

CSS는 `data-slot`에 따라 카드 좌표를 정한다.

```css
.journal-card[data-slot='1'] {
  top: 7%;
  left: 5.5%;
}

.journal-card[data-slot='2'] {
  top: 23%;
  right: 16%;
}

.journal-card[data-slot='5'] {
  top: 78%;
  left: 30%;
}
```

데이터를 추가해도 여섯 번째 카드를 위한 좌표는 만들지 않는다. 여섯 번째 저널은 다음 씬의 1번 슬롯을 사용한다.

전체 씬 수도 같은 상수로 계산한다.

```tsx
const totalScenes = Math.ceil(pages.length / JOURNALS_PER_SCENE)

<KinetographStudio totalIndex={totalScenes} />
```

RailIndex의 `total`에는 저널 수인 20이 아니라 씬 수인 4가 들어간다.

---

## RailIndex가 03에서 멈춘 원인

처음에는 씬 번호에 `sceneIndex`를 그대로 넣었다.

```tsx
data-kineto-page={sceneIndex}
```

네 씬의 DOM 값은 `0, 1, 2, 3`이 된다. RailIndex는 1부터 시작하는 번호를 기대하며 0을 유효한 값으로 처리하지 않는다.

```ts
const declaredIndex = Number(page.dataset.kinetoPage)
const pageIndex =
  Number.isFinite(declaredIndex) && declaredIndex > 0
    ? declaredIndex
    : index + 1
```

첫 씬의 0은 fallback인 1로 바뀌고, 둘째 씬도 선언값 1을 사용한다.

| 씬   | 잘못된 DOM 값 | RailIndex가 사용한 값 |
| ---- | ------------- | --------------------- |
| 첫째 | 0             | 1                     |
| 둘째 | 1             | 1                     |
| 셋째 | 2             | 2                     |
| 넷째 | 3             | 3                     |

첫째와 둘째 씬이 같은 번호를 사용해서 스크롤을 끝까지 내려도 active 상태는 `03`에서 멈췄다. DOM 번호를 1부터 시작하도록 바꿨다.

```tsx
data-kineto-page={sceneIndex + 1}
```

수정 후에는 네 씬이 `1, 2, 3, 4`로 이어진다. 스크롤 위치 계산과 `totalScenes`도 같은 씬 단위를 사용한다.

RailIndex의 묶음 계산과 일반적인 `IntersectionObserver` 방식은 [스크롤에 맞춰 5개씩 움직이는 페이지 인덱스 만들기](/2026/09/scroll-windowed-page-index)에 따로 정리했다.

---

## 브라우저 창 대신 내부 스크롤 영역을 측정한다

Kineto는 화면 전체를 `100svh`로 고정하고 `.journal-list`만 스크롤한다.

```css
.journal-shell {
  height: 100svh;
  min-height: 0;
  overflow: hidden;
}

.journal-list {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}
```

이 구조에서 `window.innerHeight`를 기준으로 현재 씬을 고르면 헤더와 바깥 여백까지 계산에 들어간다. 기준선은 실제 스크롤 컨테이너의 중앙에 둔다.

```ts
const rootBounds = scrollRoot.getBoundingClientRect()
const viewportAnchor =
  rootBounds.top + scrollRoot.clientTop + scrollRoot.clientHeight * 0.5
```

각 씬의 중앙과 기준선 사이의 거리를 구하고 가장 가까운 씬을 active 상태로 사용한다.

```ts
const bounds = page.getBoundingClientRect()
const sceneCenter = bounds.top + bounds.height / 2
const distance = Math.abs(sceneCenter - viewportAnchor)
```

스크롤 이벤트는 `.journal-list`에 등록한다. `requestAnimationFrame()`은 한 프레임 안에서 같은 좌표를 여러 번 읽는 일을 막는다.

```ts
const scheduleUpdate = () => {
  if (animationFrame === 0) {
    animationFrame = requestAnimationFrame(updateActiveIndex)
  }
}

scrollRoot.addEventListener('scroll', scheduleUpdate, {passive: true})
```

---

## 카드가 화면을 떠날 때 속도와 초점을 바꾼다

각 카드에는 CSS scroll-driven animation을 연결했다. 카드가 화면 위쪽으로 나갈수록 이동 거리를 키우고 opacity를 낮춘다. 마지막 구간에는 blur를 추가한다.

```css
.journal-card {
  animation: scroll-reveal;
  animation-duration: 1ms;
  animation-fill-mode: both;
  animation-timeline: view();
  animation-range: entry 45% exit 75%;
}

@keyframes scroll-reveal {
  45% {
    opacity: 1;
    transform: translate3d(0, -2px, 0);
    filter: blur(0);
  }

  77% {
    opacity: 0.46;
    transform: translate3d(0, -65px, 0);
    filter: blur(0);
  }

  100% {
    opacity: 0;
    transform: translate3d(0, -190px, 0);
    filter: blur(18px);
  }
}
```

`animation-timeline: view()`가 시간 대신 viewport 안의 위치를 애니메이션 진행률로 사용한다. 빠르게 사라지는 구간을 뒤쪽에 몰아 카드가 한동안 제자리에 머물다가 화면 밖으로 빠져나가는 느낌을 만들었다.

동작 줄이기 설정에서는 이동과 blur를 끈다.

```css
@media (prefers-reduced-motion: reduce) {
  .journal-card {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
```

---

## 미디어 배경을 카드마다 바꾼다

카드가 모두 같은 `media-river`를 사용하면 씬이 데이터 목록처럼 보였다. 세 가지 미디어 클래스를 배열에 넣고 렌더링할 때 하나를 고른다.

```ts
const MEDIA_CLASSES = ['media-river', 'media-night', 'media-rain'] as const

export function getRandomMediaClass() {
  return MEDIA_CLASSES[Math.floor(Math.random() * MEDIA_CLASSES.length)]
}
```

```tsx
<div className={`journal-media ${getRandomMediaClass()}`} aria-hidden="true">
  <span>Frame {page.id}</span>
</div>
```

`Contents`는 Server Component다. 정적 빌드에서는 빌드할 때 고른 조합이 다음 빌드까지 유지된다. 요청마다 서버 렌더링하는 페이지에서는 조합도 요청마다 바뀐다. 같은 저널에 같은 배경을 유지해야 한다면 무작위 선택 대신 ID를 사용한다.

```ts
function getMediaClass(id: number) {
  return MEDIA_CLASSES[(id - 1) % MEDIA_CLASSES.length]
}
```

현재 구현은 렌더링 시점에 조합을 고르는 방식을 사용한다.

---

## 숫자의 성격과 배경 대비를 함께 조정한다

기존 카드 번호는 Arial bold였다. 크기가 작고 본문 UI와 비슷해서 이미지 위에서 번호가 묻혔다. 이미 wordmark에 불러온 `Instrument Serif`를 번호에도 사용했다.

```css
.card-number {
  color: var(--ink);
  font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.65rem, 2.5vw, 2.35rem);
  font-weight: 500;
  font-variant-numeric: oldstyle-nums;
  letter-spacing: 0.015em;
  line-height: 1;
}
```

`oldstyle-nums`를 지원하는 폰트는 숫자의 높낮이에 변화를 주어 오래된 인쇄물에 가까운 리듬을 만든다. 크기를 키우는 대신 weight는 500으로 낮춰 세리프 형태를 남겼다.

`media-night`의 배경은 검은색에 가까운 `#303a3d`에서 `#465154`로 밝아졌다.

```css
.media-night {
  background: #465154;
}
```

배경만 밝히면 검은 번호의 대비는 충분하지 않았다. `:has()`로 night 미디어를 포함한 카드만 골라 번호를 밝게 바꿨다.

```css
.journal-card:has(.media-night) .card-number {
  color: #f7f4ec;
  text-shadow:
    -1px -1px 0 rgb(18 23 25 / 0.72),
    1px -1px 0 rgb(18 23 25 / 0.72),
    -1px 1px 0 rgb(18 23 25 / 0.72),
    1px 1px 0 rgb(18 23 25 / 0.72);
}
```

밝은 번호와 어두운 1px 외곽선은 night 배경 위에서 형태를 분리한다. river와 rain 카드에서는 기본 잉크색을 유지한다.

---

## 제목과 카드를 같은 슬롯으로 관리한다

각 씬은 카드와 함께 다섯 개의 문장형 제목을 받는다. 제목에도 카드와 같은 1–5 슬롯을 붙였다.

```tsx
{
  titles
    .slice(
      JOURNALS_PER_SCENE * sceneIndex,
      JOURNALS_PER_SCENE * (sceneIndex + 1),
    )
    .map((title, slotIndex) => (
      <h1 className="stage-title" data-slot={slotIndex + 1} key={slotIndex}>
        {title}
      </h1>
    ))
}
```

처음 CSS에는 제목 1–4번 위치만 있었다. 다섯 번째 제목은 데스크톱에서 좌표 없이 놓였고, 모바일 Flex 레이아웃에서는 기본값인 `order: 0`을 사용해 씬 맨 앞에 붙었다.

### 데스크톱에서는 카드 반대편에 둔다

제목 폭과 글자 크기를 줄이고 좌우 8% 안쪽에 배치했다. 카드와 제목이 같은 높이에서 서로 반대편을 사용한다.

```css
.stage-title {
  position: absolute;
  z-index: 0;
  width: min(34vw, 520px);
  font-size: clamp(2.4rem, 4.8vw, 5.2rem);
  line-height: 1.06;
}

.stage-title[data-slot='1'] {
  top: 9%;
  right: 8%;
}

.stage-title[data-slot='2'] {
  top: 27%;
  left: 8%;
}

.stage-title[data-slot='5'] {
  top: 81%;
  right: 8%;
}
```

카드는 `z-index: 1`, 제목은 `z-index: 0`을 사용한다. 두 요소의 경계가 닿아도 제목이 카드 앞을 가리지 않는다. 다섯 번째 제목까지 좌표를 지정해 씬 끝에 붙는 문제도 없앴다.

### 모바일에서는 제목과 카드를 교대로 쌓는다

모바일에서는 절대 위치를 해제하고 Flex column으로 전환한다. 제목 폭을 82%로 제한하고 바깥쪽에도 12–20px의 여백을 남긴다.

```css
@media (max-width: 640px) {
  .journal-page {
    display: flex;
    flex-direction: column;
    gap: clamp(72px, 18vw, 96px);
  }

  .stage-title[data-slot] {
    position: relative;
    width: min(82%, 400px);
  }

  .stage-title[data-slot='5'] {
    order: 9;
  }

  .journal-card[data-slot='5'] {
    order: 10;
  }
}
```

각 제목은 같은 번호의 카드 바로 앞에 온다. 5번 슬롯의 order를 선언하면서 다섯 번째 제목이 씬 위쪽으로 이동하던 현상도 사라졌다.

---

## 확인할 값

임시 데이터 20개를 기준으로 다음 값이 맞아야 한다.

| 항목                  | 기대값     |
| --------------------- | ---------- |
| 저널 개수             | 20         |
| 씬당 저널             | 5          |
| 전체 씬               | 4          |
| `data-kineto-page`    | 1, 2, 3, 4 |
| 씬 안의 카드 슬롯     | 1–5        |
| 씬 안의 제목 슬롯     | 1–5        |
| RailIndex active 범위 | 01–04      |

데스크톱에서는 제목과 카드가 좌우 빈 공간을 나눠 쓰는지 확인한다. 모바일에서는 제목과 카드가 `제목 1 → 카드 1 → 제목 2 → 카드 2` 순서로 나타나야 한다. night 카드의 번호 대비와 동작 줄이기 설정도 함께 본다.

씬 단위를 먼저 정한 뒤 스크롤, 인덱스, 카드, 제목이 같은 단위를 사용하게 맞추니 각 수정이 다른 레이아웃을 흔들지 않았다. 이후 실제 저널 데이터를 연결해도 다섯 슬롯과 씬 개수 계산은 그대로 사용할 수 있다.
