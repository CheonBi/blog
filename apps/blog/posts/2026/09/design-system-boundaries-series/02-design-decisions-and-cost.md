---
title: 설계 결정 일곱 가지와 정직한 비용
tags:
  - design-system
  - frontend
  - architecture
  - devops
published: true
date: 2026-09-22 10:30:00
description: SEED Design이 토큰 DSL과 headless 분리, CDN 배포, AI 에이전트 표면에서 내린 선택 일곱 가지를 이유와 함께 정리하고, 컴포넌트 하나를 추가할 때 손대야 하는 지점을 센다.
series: 경계를 긋는 디자인 시스템
seriesOrder: 2
---

## Table Of Contents

> 시리즈: [경계를 긋는 디자인 시스템](/series/design-system-boundaries)  
> 이전 글: [디자인 시스템을 만드는 공장 뜯어보기](/2026/09/design-system-boundaries-series/01-seed-generation-pipeline)  
> 다음 글: [디자인 시스템의 진짜 문제는 바꾸는 것이다](/2026/09/design-system-boundaries-series/03-the-real-problem-is-changing)

앞 글에서 SEED Design의 5단 파이프라인을 층별로 읽었다. 이 글은 그 구조가 나오기까지 어떤 선택을 했는지, 그리고 그 선택을 유지하는 데 얼마가 드는지를 정리한다.

각 결정마다 **왜 그렇게 했는지**를 먼저 적고 **규모가 다른 팀에도 유효한지**를 따로 판단한다. 설계 결정은 진공에서 좋고 나쁜 게 아니라 제약 조건의 함수이기 때문에 제약이 다르면 같은 결정이 손해가 된다.

## 결정 1 — 토큰을 YAML DSL로 쓴다

JSON도 TypeScript도 아니고 자체 YAML DSL이다. 그리고 토큰 엔진(`ecosystem/rootage`)과 토큰 데이터(`packages/rootage`)를 다른 패키지로 분리했다. 엔진의 README가 원칙을 명시한다.

> Rootage는 특정 디자인 시스템에 종속되지 않는 범용 디자인 토큰 생성 도구입니다.
> **하지 말아야 할 것:** 디자인 시스템별 로직 포함 / 디자인 시스템 이름이나 규칙 하드코딩 / 토큰 사용 패턴에 대한 가정

디자인 시스템 고유 로직은 `--generator` CLI 옵션으로 주입한다.

**왜.** 엔진을 범용으로 두면 다른 팀이나 다른 제품이 같은 엔진으로 자기 토큰을 만들 수 있다. 실제로 Lynx 라인이 이 분리 덕에 복제됐다. 엔진에 "carrot"이라는 단어가 한 번이라도 들어갔다면 두 번째 라인은 포크가 됐을 것이다.

**다른 규모에서는.** 분리 원칙 자체는 유효하다. 다만 자체 DSL까지 만들 필요는 없다. W3C Design Tokens Community Group 포맷에 Style Dictionary 조합이면 같은 경계를 훨씬 싸게 얻는다.

## 결정 2 — 컴포넌트 디자인을 코드가 아니라 데이터로 선언한다

104개의 ComponentSpec YAML이다. 앞 글에서 본 `slots × variants × states → 토큰` 구조다.

**왜.** 디자이너와 개발자 사이의 번역 손실을 없애고 누락된 조합을 기계가 검증하고 플랫폼별 구현을 같은 원천에서 파생시키기 위해서다. 웹과 Lynx 두 라인이 같은 스펙을 읽는다.

**다른 규모에서는.** 조건부다. YAML 명세가 흑자로 돌아서는 손익분기점은 **플랫폼이 둘 이상**이거나 **컴포넌트가 50개 이상**일 때다. 그 아래에서는 YAML을 쓰고 생성기를 유지하는 비용이 얻는 것보다 크다.

## 결정 3 — 생성물과 원천을 물리적으로도 제도적으로도 격리한다

`.gitattributes` 단일 원천, `AGENTS.md`의 수정 금지 경로 명시, 편집 시점에 도는 `generated-files-guard.ts` 훅. 세 겹이다.

**왜.** 디자인 시스템이 망가지는 1순위 원인은 생성물을 직접 고치고 다음 빌드에서 그 수정이 날아가는 것이다. 한 겹으로는 막히지 않는다는 걸 아는 구성이다.

**다른 규모에서는.** 규모와 무관하게 즉시 유효하고 비용이 거의 0이다. 이 시리즈에서 가장 먼저 도입할 항목으로 꼽는다.

## 결정 4 — Headless를 43개 패키지로 쪼갠다

`accordion`, `dialog`, `floating`, `prevent-scroll`, `presence` 같은 단위가 각각 독립 npm 패키지다.

**왜.** Lynx 때문이다. 웹 DOM이 없는 런타임에서도 상태 로직은 재사용해야 하니 스타일과 DOM 의존을 분리할 수밖에 없었다.

**다른 규모에서는.** 따라할 이유가 없다. 플랫폼이 웹 하나라면 Radix UI, Base UI, Ark UI 중 하나를 쓰는 편이 43개 패키지를 직접 유지보수하는 것보다 압도적으로 싸다.

이 결정은 이 글에서 가장 오해하기 쉬운 항목이다. 당근이 headless를 직접 만든 건 잘 만들 수 있어서가 아니라 **Lynx라는 제약 때문**이다. 제약이 없으면 만들 이유도 없다. 남의 저장소에서 결과물만 보고 따라가면 이유 없는 비용만 복제하게 된다.

## 결정 5 — 배포를 npm과 CDN으로 이중화한다

토큰 JSON을 npm과 별개로 Cloudflare R2에 불변 버전으로 저장하고 Worker로 서빙한다.

```text
/rootage/v{version}/{resource}.json   ← 1년 immutable 캐시
/rootage/latest/{resource}.json       ← 검증된 npm latest 포인터
/rootage/{resource}.json              ← 기존 소비자용 stable 별칭
```

운영 규율이 인상적이다.

- 모든 파일의 SHA-256을 완료 manifest에 기록하고 manifest 자체의 SHA-256은 stable 포인터에 기록한다.
- **완료 manifest가 없는 버전은 Worker가 공개하지 않는다.** 업로드가 중간에 끊겼을 때 부분 결과가 노출되지 않는다.
- stable 포인터는 ETag CAS로 갱신하고 412 충돌이 나면 재검증 후 한 번만 재시도한다.
- 최초 bootstrap은 이전 버전을 증명할 수 없으면 fail-closed로 멈춘다.
- PR snapshot은 `0.0.0-snapshot.pr-{번호}.sha-{40자리}` 버전을 쓰고 stable 포인터를 건드리지 않는다.

**왜.** iOS와 Android 네이티브 앱은 npm을 쓸 수 없다. 디자인 토큰을 런타임에 가져가야 하므로 CDN이 필요했다.

**다른 규모에서는.** 인프라 자체는 과잉이다. 다만 **"snapshot은 stable을 건드리지 않는다"**와 **"불완전한 배포는 공개하지 않는다"** 두 원칙은 어떤 규모의 어떤 배포 파이프라인에도 그대로 옮길 수 있다.

## 결정 6 — 배포 경로 자체를 코드로 검증한다

`bun version` 스크립트가 Changesets를 실행한 뒤 `version-change-policy.ts`를 돌린다. 각 패키지의 `package.json`, `CHANGELOG.md`, changeset, lockfile, 그리고 `packages/rootage/__generated__/**` 바깥에 변경이 있으면 거부한다.

**왜.** 릴리스 커밋에 의도하지 않은 변경이 섞여 들어가는 걸 사람의 주의력이 아니라 기계가 막는다.

**다른 규모에서는.** 유효하다. 스크립트 하나라 싸고 릴리스 사고의 한 종류를 통째로 없앤다.

## 결정 7 — AI 에이전트를 1급 소비자로 취급한다

SEED에서 가장 최근에 붙었고 모방 가치가 가장 높은 부분이다.

| 표면          | 실체                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| MCP 서버 2종  | `@seed-design/mcp` (Figma→코드), `@seed-design/docs-mcp` (문서 질의: `discover`, `docs`, `get-rootage`, `icon-tools`)       |
| `llms.txt`    | 문서 섹션별로 라우트 생성 (`/llms.txt`, `/react/llms.txt`, `/components/llms.txt`)                                          |
| `AGENTS.md`   | **34개.** 루트 → 패키지 → 하위 디렉터리로 계층화                                                                            |
| Skill         | **17개.** `seed-component-map`, `seed-token-analysis`, `seed-change-plan`, `seed-changeset`, `seed-submit-change`           |
| 분석 스크립트 | `component-map.ts <Name>` → 그 컴포넌트의 rootage·recipe·생성물·headless·구현·registry·docs·예제·테스트 경로를 한 번에 반환 |

`AGENTS.md`의 다음 문장이 철학을 그대로 보여준다.

> 루트에서 대상 경로까지 적용되는 `AGENTS.md`만 읽고, 요청과 직접 관련된 코드·설정·문서만 연다.
> 오탈자나 단순 문서 수정에 전체 저장소 맵이나 모든 문서를 요구하지 않는다.

**에이전트의 컨텍스트를 예산으로 취급한다.** 39패키지 저장소에서 "전부 읽어보라"는 지시는 성립하지 않으니 "이런 종류의 변경이면 이 경로만 읽어라"라는 라우팅 테이블을 사람이 미리 깔아뒀다.

**왜.** 저장소가 사람 혼자 머릿속에 담을 수 있는 크기를 넘었기 때문이다. 흥미로운 건 이 표면이 저장소를 사람에게 설명하는 문서와 거의 같은 물건이라는 점이다.

**다른 규모에서는.** 가장 우선순위가 높다. 그 이유는 다음 글에서 따로 다룬다.

## 정직한 비용: 컴포넌트 하나를 추가하면

버튼 하나를 추가할 때 손대야 하는 지점을 세어 보면 이렇다.

1. `packages/rootage/components/*.yaml` — 스펙 작성 (action-button 기준 466줄)
2. `bun rootage:generate` — 생성
3. `packages/qvism-preset/src/recipes/*.ts` — 웹 레시피
4. `packages/lynx-qvism-preset/src/recipes/*.ts` — Lynx 레시피
5. `bun qvism:generate` — CSS 생성
6. `packages/react-headless/*/` — 필요하면 headless 패키지 신설
7. `packages/react/src/components/*/` — Styled 컴포넌트
8. `packages/lynx-react/src/components/*/` — Lynx 컴포넌트
9. `docs/content/` + `docs/registry/` — 문서, 복사용 스니펫, 예제
10. `.changeset/` — 릴리스 노트
11. 검증: `bun rootage:test`, `bun headless:test`, `bun react:test`, `bun test:lynx-react`, `bun docs:test`

**최소 8곳, 많으면 11곳이다.**

그래서 `seed-create-component`와 `seed-orchestrate-component` 같은 Skill이 존재한다. 뒤쪽은 작업을 여러 에이전트로 분할한다. **절차가 사람이 한 번에 처리하기 어려운 수준이라 자동화 도구를 따로 만들어야 했던 것이다.**

이건 비판이 아니다. 웹 89개와 Lynx 49개 컴포넌트를 54명이 4년 반 유지하려면 이 정도 구조가 필요하다. 조합 누락을 검증기가 잡아주는 이득이 스펙 466줄을 쓰는 비용보다 크다.

다만 같은 구조를 컴포넌트 12개짜리 저장소에 씌우면 컴포넌트보다 파이프라인이 더 무거워진다. 그 지점이 이 시리즈의 4편에서 다룰 문제다.

> 디자인 시스템 아키텍처는 컴포넌트 수와 플랫폼 수의 함수다. 남의 정답을 그대로 가져오면 자기 문제에 대해서는 틀린 답이 된다.

## 부록: 확인한 주요 경로

본문의 수치와 인용은 아래 경로에서 직접 확인했다.

| 주제          | 경로                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- |
| 저장소 지도   | `ARCHITECTURE.md`, `TECH.md`, `AGENTS.md`                                             |
| 토큰 원천     | `packages/rootage/*.yaml` (12파일), `collections.yaml`                                |
| 컴포넌트 스펙 | `packages/rootage/components/*.yaml` (104개)                                          |
| 토큰 엔진     | `ecosystem/rootage/{core,cli}`                                                        |
| 레시피 원천   | `packages/qvism-preset/src/recipes/*.ts` (79개)                                       |
| 레시피 엔진   | `ecosystem/qvism/{core,cli}`                                                          |
| 생성 CSS      | `packages/css/{vars,recipes}` (486파일)                                               |
| Headless      | `packages/react-headless/*` (43패키지)                                                |
| Styled React  | `packages/react/src/components/*` (89개)                                              |
| Lynx 라인     | `packages/lynx-{qvism-preset,css,react,react-headless}`                               |
| Figma 연동    | `scripts/figma-to-rootage.ts` (742줄), `ecosystem/figma-extractor`                    |
| 배포 CDN      | `tools/rootage-cdn/{README.md,TECH.md,src}`                                           |
| 생성물 경계   | `.gitattributes`                                                                      |
| AI 표면       | `packages/{mcp,docs-mcp}`, `skills/*` (17), `AGENTS.md` (34), `docs/app/**/llms.txt`  |
| 배포 규율     | `package.json`의 `version` 스크립트, `tools/rootage-cdn/src/version-change-policy.ts` |

기준 커밋은 `dev` 브랜치의 `6247f189b`이다.
