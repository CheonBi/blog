---
title: 기본 썸네일 생성 분석
tags:
  - typescript
  - next
  - react
  - network
published: true
date: 2026-09-03 15:32:00
description: yceffort 님이 제작하신 블로그 기본 썸네일 생성을 나중에 커스터마이징 할 수 있게 코드를 분석해본다.
---

## Table of Contents

## 기본 썸네일 생성 원리

이 문서는 Blog 앱이 포스트에 썸네일을 연결하는 과정을 설명한다.

대상 코드는 다음과 같다.

- [`src/utils/Post.ts`](../src/utils/Post.ts): 포스트를 읽고 썸네일 URL을 결정한다.
- [`src/utils/postPaths.ts`](../src/utils/postPaths.ts): Markdown 파일 경로를 포스트 slug로 변환한다.
- [`src/components/PostCard.tsx`](../src/components/PostCard.tsx): 홈의 포스트 카드에서 썸네일을 출력한다.
- [`src/components/PostRow.tsx`](../src/components/PostRow.tsx): 목록의 포스트 행에서 썸네일을 출력한다.
- [`src/app/api/og/art/route.tsx`](../src/app/api/og/art/route.tsx): slug를 seed로 사용해 1200×630 아트 이미지를 생성한다.
- [`src/utils/ogSharpUnblock.ts`](../src/utils/ogSharpUnblock.ts): `next/og` 렌더링 전에 Sharp의 SVG 로더를 다시 허용한다.
- [`next.config.ts`](../next.config.ts): 생성 썸네일 URL을 `next/image`가 사용할 수 있도록 허용한다.

## 현재 상태 요약

현재 코드는 다음 우선순위를 갖는다.

1. `public/thumbnails/{slug}.png` 파일을 찾는다.
2. 파일이 있으면 정적 이미지 URL을 사용한다.
3. 파일이 없으면 `/api/og/art?...` 생성 URL을 사용한다.

`/api/og/art` Route Handler는 `next/og`의 `ImageResponse`를 사용해 실제 이미지를 반환한다. 따라서 로컬 PNG가 없는 포스트도 생성 썸네일을 표시할 수 있다. 생성기는 포스트 제목을 조회하지 않고 slug만 받으므로, 포스트 카드용 fallback은 글자가 없는 추상 아트로 생성된다.

## 전체 흐름

```text
Markdown 파일
    │
    ▼
getAllPosts(locale)
    │  파일 경로를 slug로 변환
    ▼
public/thumbnails/{slug}.png 존재 여부 확인
    │
    ├─ 존재함 ───────► /thumbnails/{slug}.png
    │
    └─ 존재하지 않음 ─► /api/og/art?v=4&slug={encoded-slug}
                              │
                              ▼
                       /api/og/art가 이미지 반환
                              │
                              ▼
                       PostCard / PostRow가 <Image>로 출력
```

생성 URL을 사용하는 경우에도 `getAllPosts()`가 곧바로 이미지 바이트를 생성하지는 않는다. 이 함수는 나중에 요청할 URL 문자열만 포스트 데이터에 넣는다. 브라우저가 URL을 요청하면 `/api/og/art` 서버 라우트가 그때 JSX 기반 디자인을 렌더링해 이미지 응답을 만든다.

## 1. 포스트 파일을 읽는 단계

`Post.ts`의 `getAllPosts()`는 다음 경로 아래의 Markdown과 MDX 파일을 찾는다.

```ts
const POST_ROOT = path.join(process.cwd(), 'posts')
const files = sync(`${POST_ROOT}/**/*.md*`).toReversed()
```

Blog 앱의 실행 위치가 `apps/blog`이므로 `process.cwd()`가 `apps/blog`를 가리킬 때 포스트 루트는 다음과 같다.

```text
apps/blog/posts
```

예를 들어 다음 파일이 있다고 하자.

```text
apps/blog/posts/2026/09/blog-01-linear-referencing.md
```

`pathToSlug()`는 포스트 루트 뒤의 경로에서 확장자를 제거한다.

```text
2026/09/blog-01-linear-referencing
```

영문 번역 파일도 같은 slug를 사용한다.

```text
posts/2026/09/blog-01-linear-referencing.en.md
→ 2026/09/blog-01-linear-referencing
```

따라서 한국어 파일과 영문 파일의 slug가 같으면 생성 썸네일 seed도 같다. 현재 `buildArtThumbnail()`은 locale을 seed에 포함하지 않으므로 두 언어가 같은 아트 썸네일을 공유하도록 설계되어 있다.

## 2. 로컬 썸네일을 먼저 찾는 단계

`Post.ts`는 썸네일 디렉터리를 다음처럼 계산한다.

```ts
const THUMB_DIR = `${process.cwd()}/public/thumbnails`
```

이후 slug 전체를 파일 경로 뒤에 붙여 PNG 파일이 있는지 확인한다.

```ts
const thumbnail = fs.existsSync(`${THUMB_DIR}/${slug}.png`)
  ? `/thumbnails/${slug}.png`
  : buildArtThumbnail(slug)
```

따라서 slug가 다음과 같다면:

```text
2026/09/blog-01-linear-referencing
```

앱은 다음 파일을 찾는다.

```text
apps/blog/public/thumbnails/2026/09/blog-01-linear-referencing.png
```

파일이 존재하면 브라우저에 전달하는 URL은 다음과 같다.

```text
/thumbnails/2026/09/blog-01-linear-referencing.png
```

Next.js에서 `public` 디렉터리는 웹 루트(`/`)로 노출된다. 그러므로 파일 시스템의 `public/thumbnails`는 URL의 `/thumbnails`에 대응한다.

### 파일명이 중요한 이유

다음 파일은 현재 규칙에 맞지 않는다.

```text
public/thumbnails/blog-01-linear-referencing.png
public/thumbnails/2026-09-blog-01-linear-referencing.png
public/thumbnails/2026/09/blog-01-linear-referencing.jpg
```

현재 코드는 slug 전체 경로를 사용하고 `.png`만 확인한다. 위 파일만 있으면 로컬 썸네일을 찾지 못하고 생성 URL로 넘어간다.

## 3. 기본 썸네일 URL을 만드는 단계

로컬 PNG가 없으면 `buildArtThumbnail()`이 실행된다.

```ts
const ART_VERSION = 4

export function buildArtThumbnail(seed: string): string {
  return `/api/og/art?v=${ART_VERSION}&slug=${encodeURIComponent(seed)}`
}
```

예를 들어 seed가 다음과 같으면:

```text
2026/09/blog-01-linear-referencing
```

반환 URL은 다음 형태가 된다.

```text
/api/og/art?v=4&slug=2026%2F09%2Fblog-01-linear-referencing
```

### `slug`를 URL 인코딩하는 이유

slug에는 `/`가 들어간다. 이 값을 query string에 그대로 넣으면 서버가 경로 구분자로 오해하거나 값이 여러 부분으로 나뉠 수 있다. `encodeURIComponent()`는 `/`를 `%2F`로 바꾸어 seed 전체를 하나의 query parameter 값으로 보낸다.

API에서는 query string을 다시 읽어 원래 seed를 얻는다.

```ts
const url = new URL(request.url)
const seed = url.searchParams.get('slug')
```

### `v=4`의 역할

`v`는 아트 디자인이 바뀌었을 때 캐시를 무효화하기 위한 버전 값이다.

예를 들어 디자인을 변경한 뒤에도 URL이 계속 같으면 브라우저, CDN, Next 이미지 최적화 캐시가 이전 이미지를 계속 제공할 수 있다. 이때 `ART_VERSION`을 `4`에서 `5`로 올리면 URL이 바뀐다.

```text
/api/og/art?v=4&slug=...
/api/og/art?v=5&slug=...
```

Route Handler는 `v` 값을 디자인 계산에 사용하지 않는다. 대신 `v`가 URL에 포함되므로 버전을 올리면 브라우저와 CDN이 다른 리소스로 인식한다. Route Handler는 `ImageResponse`에 다음 캐시 헤더를 설정한다.

```http
Cache-Control: public, max-age=31536000, immutable
```

따라서 아트 디자인을 바꾼 뒤 `ART_VERSION`을 올리면 새 URL이 새 캐시 항목을 만든다. 버전을 올리지 않으면 기존 URL에 연결된 캐시가 남을 수 있다.

## 4. 컴포넌트가 썸네일을 출력하는 단계

`getAllPosts()`가 만든 `thumbnail` 값은 `frontMatter`에 들어간다.

```ts
frontMatter: {
  ...fm,
  tags,
  date: new Date(date).toISOString().substring(0, 19),
  thumbnail,
}
```

홈의 `PostCard`는 이 값을 `next/image`에 전달한다.

```tsx
{
  thumbnail && (
    <Image
      src={thumbnail}
      alt=""
      fill
      sizes="(min-width: 1024px) 33vw, 100vw"
      priority={priority}
    />
  )
}
```

목록의 `PostRow`도 같은 방식으로 사용한다.

```tsx
{thumbnail ? (
  <Image
    src={thumbnail}
    alt=""
    fill
    sizes="(min-width: 768px) 120px, 84px"
  />
) : (
  // thumbnail이 없을 때의 SVG placeholder
)}
```

현재 `getAllPosts()`는 로컬 파일이 없을 때도 `buildArtThumbnail()`이 반환한 URL을 넣는다. 따라서 일반적인 포스트에서는 `thumbnail`이 빈 값이 아니다. `/api/og/art`가 정상적으로 이미지를 반환한다면 SVG placeholder 분기까지 내려가지 않는다.

## 5. `next.config.ts` 설정의 역할

현재 설정에는 다음 항목이 있다.

```ts
images: {
  localPatterns: [
    { pathname: "/api/og/art" },
    { pathname: "/**", search: "" },
  ],
},
```

이 설정은 `next/image`가 사용할 수 있는 로컬 이미지 경로를 허용한다. `/api/og/art`를 목록에 넣었기 때문에 생성 API를 `Image`의 `src`로 사용할 수 있다.

하지만 `localPatterns`는 API 라우트를 만들지 않는다. 다음 두 작업은 서로 다르다.

| 작업            | 담당 코드                                 | 의미                                                         |
| --------------- | ----------------------------------------- | ------------------------------------------------------------ |
| 이미지 URL 허용 | `next.config.ts`의 `images.localPatterns` | `next/image`가 해당 URL을 사용하도록 검사 조건을 통과시킨다. |
| 이미지 생성     | `src/app/api/og/art/route.tsx`            | HTTP 요청을 받고 실제 이미지 응답을 만든다.                  |

현재 저장소에는 두 설정과 Route Handler가 모두 있다. `localPatterns`는 요청 허용을 담당하고, Route Handler는 허용된 요청에 실제 이미지 본문을 반환한다.

## 6. 현재 코드에서 실제로 일어나는 결과

포스트 `2026/09/blog-01-linear-referencing`를 예로 들면 다음과 같다.

### 로컬 파일이 있는 경우

```text
파일:
apps/blog/public/thumbnails/2026/09/blog-01-linear-referencing.png

thumbnail 값:
/thumbnails/2026/09/blog-01-linear-referencing.png

결과:
정적 PNG를 표시한다.
```

### 로컬 파일이 없는 경우

```text
thumbnail 값:
/api/og/art?v=4&slug=2026%2F09%2Fblog-01-linear-referencing

결과:
`/api/og/art`가 slug를 seed로 사용해 추상 아트를 생성하고 1200×630 이미지로 반환한다.
```

포스트 데이터 자체와 썸네일 요청은 별개의 흐름이다. 포스트 페이지가 정상적으로 열려도 이미지 API의 렌더링이나 외부 폰트 요청이 실패하면 썸네일만 실패할 수 있다. 브라우저 개발자 도구의 Network 탭에서 `/api/og/art` 요청을 확인하면 페이지 라우트 404와 이미지 생성 실패를 구분할 수 있다.

## 7. `/api/og/art`의 생성 원리

생성 API의 구현은 다음 파일에 있다.

```text
apps/blog/src/app/api/og/art/route.tsx
```

### 7.1 요청값 읽기

요청 URL에는 네 query parameter가 들어올 수 있다. Route Handler가 실제로 읽는 값은 `slug`, `title`, `tag`이고, `v`는 URL 버전에만 사용한다.

| 파라미터 | 현재 fallback에서 전달하는가 | 역할                                                                      |
| -------- | ---------------------------- | ------------------------------------------------------------------------- |
| `slug`   | 전달한다                     | 아트의 seed다. 값이 같으면 같은 디자인을 재현한다.                        |
| `v`      | 전달한다                     | URL 버전과 캐시 분리를 위한 값이다. 현재 디자인 계산에는 사용하지 않는다. |
| `title`  | 전달하지 않는다              | 직접 호출할 때 제목을 이미지 위에 표시할 수 있다.                         |
| `tag`    | 전달하지 않는다              | `title`이 있을 때 제목 위에 태그를 표시할 수 있다.                        |

`slug`가 없으면 Route Handler는 기본값 `yceffort`를 사용한다. 실제 포스트 카드 URL에는 항상 slug가 들어가므로 일반적인 경로에서는 기본값을 사용하지 않는다.

### 7.2 slug를 숫자 seed로 변환하기

생성기는 slug를 `hashCode()`로 정수로 바꾼다.

```ts
const hash = hashCode(slug)
const rand = mulberry32(hash)
const [c1, c2] = DUOS[hash % DUOS.length]
```

그 다음 `mulberry32()` 의사 난수 생성기를 사용한다. 이 방식은 `Math.random()`과 다르다. 같은 정수 seed로 시작하면 같은 난수 순서를 재현한다.

이 특성 덕분에 다음 요청은 같은 디자인을 얻는다.

```text
/api/og/art?v=4&slug=2026%2F09%2Fblog-01-linear-referencing
/api/og/art?v=5&slug=2026%2F09%2Fblog-01-linear-referencing
```

두 URL의 `v`는 다르지만 slug가 같으므로 디자인은 같다. `v`는 캐시 URL만 바꾼다.

### 7.3 색상과 배경 선택하기

`DUOS`에는 두 색으로 구성된 색상 조합이 들어 있다. `hash % DUOS.length`로 한 조합을 고르므로 slug마다 기본 색이 달라진다.

`PAPERS`에는 밝은 배경과 어두운 배경이 가중치와 함께 정의되어 있다. `pickPaper()`는 가중치에 따라 다음 정보를 선택한다.

- 배경 CSS gradient
- 전경 요소를 덮는 scrim의 RGB 값
- 텍스트와 선에 사용할 밝기 모드

그 뒤 생성기는 의사 난수를 사용해 다음 요소의 위치와 크기를 정한다.

- 모서리에 놓는 흐릿한 blob
- 작은 원형 포인트
- 배경의 회전 밴드나 선
- 도형의 위치, 크기, 투명도

### 7.4 레이아웃 하나 선택하기

현재 `LAYOUTS`에는 12개의 배경 레이아웃이 등록되어 있다.

```ts
const LAYOUTS = [
  bandsLayout,
  ringsLayout,
  fieldLayout,
  columnsLayout,
  codePanelLayout,
  contoursLayout,
  gridChartLayout,
  glyphLayout,
  halftoneLayout,
  stripesLayout,
  bauhausLayout,
  stepsLayout,
]
```

선택된 레이아웃은 다음과 같은 SVG와 CSS 도형을 조합한다.

- `bandsLayout`: 넓은 색상 밴드와 연결 선
- `ringsLayout`: 원 또는 회전 사각형 링
- `fieldLayout`: 작은 도형이 흩어진 필드
- `columnsLayout`: 세로 기둥과 연결 선
- `codePanelLayout`: 코드 에디터처럼 보이는 패널
- `contoursLayout`: 등고선 형태의 곡선
- `gridChartLayout`: 격자와 꺾은선 그래프
- `glyphLayout`: 큰 원 또는 마름모 윤곽
- `halftoneLayout`: 색상과 크기가 달라지는 점 격자
- `stripesLayout`: 기울어진 줄무늬
- `bauhausLayout`: 원과 기하학 도형
- `stepsLayout`: 상승 또는 하강하는 계단형 막대

각 레이아웃은 같은 `rand()`를 공유한다. 따라서 slug가 바뀌면 레이아웃뿐 아니라 도형 개수, 위치, 크기, 회전, 투명도도 함께 달라진다.

### 7.5 제목을 표시하는 선택적 경로

현재 `buildArtThumbnail()`은 `slug`만 URL에 넣는다. 그래서 포스트 카드에서 생성되는 기본 썸네일에는 제목이 없다.

그러나 API를 다음처럼 직접 호출하면 제목과 태그를 포함할 수 있다.

```text
/api/og/art?slug=demo&title=기본%20썸네일&tag=design
```

`title`이 있을 때 Route Handler는 다음 작업을 한다.

1. Nanum Gothic Bold 폰트를 외부 CDN에서 가져온다.
2. `parseTitleEmphasis()`로 제목의 강조 부분을 나눈다.
3. 공백 기준으로 제목을 줄 단위 조각으로 배치한다.
4. 강조된 조각에 두 색의 gradient를 적용한다.
5. `tag`가 있으면 제목 위에 `◆ #TAG` 형태로 표시한다.

현재 포스트 fallback 요청에는 `title`이 없으므로 외부 폰트를 가져오지 않는다. 이 점이 카드용 추상 썸네일과 OG 메타데이터용 이미지의 차이다.

### 7.6 SVG를 이미지 응답으로 바꾸기

Route Handler는 JSX 안에서 `<svg>`, `<div>`, `<circle>`, `<rect>`, `<path>` 등을 조합한 뒤 `ImageResponse`에 전달한다.

```ts
return new ImageResponse(<div>{/* generated artwork */}</div>, {
  width: 1200,
  height: 630,
  headers: {
    "Cache-Control": "public, max-age=31536000, immutable",
  },
});
```

`ImageResponse`가 이 JSX를 이미지 응답으로 변환한다. 응답 크기는 항상 1200×630으로, Open Graph 이미지와 같은 비율이다. `ImageResponse`가 이미지 응답의 Content-Type을 설정하므로 Route Handler에서 PNG 바이트를 직접 조립하지 않는다.

Route Handler는 렌더링 전에 `unblockSvgLoader()`를 호출한다. Next 이미지 최적화가 Sharp를 먼저 사용한 프로세스에서는 SVG 로더가 차단될 수 있다. 이 함수는 같은 프로세스에서 `next/og`가 SVG를 래스터라이즈할 수 있도록 SVG 로더를 다시 허용한다.

개념적으로는 다음과 같은 계약을 갖는다.

```text
GET /api/og/art?v=4&slug=2026%2F09%2Fblog-01-linear-referencing

200 OK
Content-Type: image/png

<generated image bytes>
```

Route Handler가 정상적으로 응답하면 `ImageResponse`가 이미지 Content-Type과 본문을 반환한다. 렌더링 중 예외가 발생하면 Next.js는 오류 응답을 반환하고 `next/image`는 이를 이미지로 표시할 수 없다. 특히 배포 환경에서는 외부 폰트 요청, Sharp의 native 모듈, `next/og`의 런타임 지원 여부를 함께 확인해야 한다.

## 8. Front Matter의 `thumbnail` 필드와의 관계

`FrontMatter` 타입에는 `thumbnail?: string`이 정의되어 있다. 그러나 현재 `getAllPosts()`는 Markdown Front Matter의 `thumbnail` 값을 그대로 사용하지 않는다.

```ts
frontMatter: {
  ...fm,
  thumbnail,
}
```

객체에서 뒤에 작성한 `thumbnail`이 앞에서 펼친 `fm.thumbnail`을 덮어쓴다. 따라서 현재 우선순위는 다음과 같다.

```text
public/thumbnails/{slug}.png
    ↓ 없으면
/api/og/art?... fallback
```

Front Matter에 다음을 적어도:

```yaml
thumbnail: https://example.com/cover.png
```

현재 구현에서는 이 URL을 사용하지 않는다. 외부 URL이나 Front Matter의 썸네일을 지원하려면 `getAllPosts()`의 우선순위를 별도로 정의해야 한다.

예를 들어 의도한 우선순위가 다음과 같다면:

```text
Front Matter thumbnail
    ↓ 없으면
public/thumbnails/{slug}.png
    ↓ 없으면
/api/og/art?... fallback
```

코드도 이 순서에 맞게 조건을 작성해야 한다.

## 9. 확인 방법

개발 서버를 실행한 뒤 포스트에 연결된 썸네일 URL을 직접 확인한다.

```bash
pnpm --filter blog dev
```

로컬 파일이 있는 포스트는 다음 주소를 확인한다.

```text
http://localhost:3000/thumbnails/2026/09/blog-01-linear-referencing.png
```

생성 fallback은 다음 주소를 확인한다.

```text
http://localhost:3000/api/og/art?v=4&slug=2026%2F09%2Fblog-01-linear-referencing
```

Route Handler를 포함한 현재 구현은 두 번째 주소에서 생성 이미지를 반환해야 한다. 다음 조건을 확인한다.

- 응답 상태가 `200`인가?
- `Content-Type`이 `image/png`, `image/jpeg`, `image/svg+xml` 중 실제 본문과 일치하는가?
- 브라우저에서 이미지가 표시되는가?
- 같은 slug에 대해 매번 다른 이미지가 나오지 않는가?
- `ART_VERSION`을 바꿨을 때 같은 디자인의 새 URL이 별도 캐시 항목으로 처리되는가?

오류가 발생하면 먼저 다음 위치를 확인한다.

- `/api/og/art` 요청 자체가 404인가? Route Handler 경로와 배포 산출물을 확인한다.
- 응답이 500인가? 서버 로그에서 `next/og`, Sharp, 외부 폰트 요청 오류를 확인한다.
- API는 200인데 화면에만 안 보이는가? `next/image`의 원본 URL, `images.localPatterns`, 이미지 CSS 크기를 확인한다.

## 정리

```text
로컬 PNG 존재
→ /thumbnails/... 사용

로컬 PNG 없음
→ /api/og/art?... URL 사용
→ slug 기반 deterministic 아트 생성
→ ImageResponse로 1200×630 이미지 반환
```

`getAllPosts()`는 로컬 PNG가 있으면 그 파일을 사용하고, 없으면 slug를 담은 `/api/og/art` URL을 반환한다. API는 slug에서 재현 가능한 seed를 만들어 1200×630 이미지를 렌더링한다. `ART_VERSION`을 바꾸면 디자인은 유지하면서 새 캐시 URL을 만들 수 있다.
