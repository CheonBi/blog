# CheonBi Blog

개인 글과 프로필을 담은 블로그입니다. 원본은
[yceffort/blog](https://github.com/yceffort/blog)이며 내부 `@yceffort/*` 이름과
라이선스는 유지합니다. 반영 기준과 보호 경로는 루트 `upstream-sync.json`에 있습니다.

Node `24.20.0`, pnpm `12.1.0`을 사용합니다. 화면은 StyleX, 마크다운은
저장소에 포함된 Rust/WASM으로 처리합니다. 일반 배포에 Rust 설치는 필요하지 않습니다.

## 실행

저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev:blog
pnpm build:blog
```

## 글 작성

글은 `posts/YYYY/MM/slug.md`, 시리즈 소개는 `series/slug.md`에 둡니다.
글의 경로가 공개 주소가 되므로 기존 글을 옮기면 리다이렉트도 필요합니다.

```yaml
---
title: 글 제목
tags:
  - javascript
published: true
date: 2026-11-04 09:00:00
description: 글의 요약
---
```

`published`는 따옴표 없는 `true` 또는 `false`를 사용합니다. 시리즈에는
등록된 `series` 이름과 `seriesOrder`를 지정합니다. 발표 자료는 Research의
파일 이름을 `slide`에 확장자 없이 연결합니다. 번역은 같은 경로의 `.en.md`로 둡니다.

코드, 표, 수식과 Mermaid를 지원합니다. MDX 컴포넌트는 정해진 컴포넌트만
사용할 수 있고 임의의 import/export나 JavaScript 표현식은 실행하지 않습니다.

```sh
pnpm lint
pnpm check:content
pnpm --filter @yceffort/markdown-rs parity
```

기존 15편의 본문과 작성일 보존은 이행 검사용 `pnpm check:content --baseline`으로
확인합니다. 글을 정상적으로 수정한 뒤에는 일반 `check:content`를 사용합니다.

[운영 연결](../../docs/operations.md), [동기화](../../docs/upstream-sync.md),
[검증 기록](../../docs/restoration-validation.md)을 함께 참고합니다.
