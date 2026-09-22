---
title: 디자인 시스템을 만드는 공장 뜯어보기
tags:
  - design-system
  - frontend
  - css
  - react
published: true
date: 2026-09-22 10:00:00
description: 당근 SEED Design의 5단 생성 파이프라인을 토큰 YAML부터 생성 CSS까지 층별로 읽고, 손으로 쓰는 것과 기계가 만드는 것의 경계를 확인한다.
series: 경계를 긋는 디자인 시스템
seriesOrder: 1
---

## Table Of Contents

> 시리즈: [경계를 긋는 디자인 시스템](/series/design-system-boundaries)  
> 다음 글: [설계 결정 일곱 가지와 정직한 비용](/2026/09/design-system-boundaries-series/02-design-decisions-and-cost)

디자인 시스템 레퍼런스는 많다. Material, Carbon, Primer, Polaris. 그런데 이들은 대부분 결과물만 공개한다. 컴포넌트 목록과 사용 가이드는 읽을 수 있지만, 그 컴포넌트가 어떤 원천에서 어떤 단계를 거쳐 나왔는지는 보이지 않는다. 디자인 시스템을 새로 만드는 쪽에서 정작 알고 싶은 건 그 과정이다.

[SEED Design](https://github.com/daangn/seed-design)은 파이프라인 전체가 공개돼 있다. Figma에서 토큰을 뽑는 스크립트, 토큰 DSL과 빌드 엔진, CSS 생성기, 배포 CDN, AI 에이전트용 문서까지 한 저장소에 들어 있다. "이런 컴포넌트를 만들어라"가 아니라 "디자인 시스템을 만드는 공장을 이렇게 짓는다"를 보여준다.

이 글은 그 공장을 층별로 읽는다. 각 층에서 확인할 것은 하나다. **어디까지가 사람이 쓰는 원천이고, 어디부터가 기계가 만드는 결과인가.**

## 먼저 규모를 확인한다

구조를 읽기 전에 그 구조가 감당하는 양을 알아야 한다. 아래 수치는 저장소에서 직접 센 값이다.

| 항목                           | 값                          |
| ------------------------------ | --------------------------- |
| 첫 커밋                        | 2021-03-11                  |
| 누적 커밋                      | 3,762                       |
| 기여자                         | 54명 (누적)                 |
| 워크스페이스 패키지            | 39개                        |
| 토큰 정의 (YAML)               | 12개 파일, 색상 199개       |
| 컴포넌트 스펙 (YAML)           | 104개                       |
| 스타일 레시피 (웹 / Lynx)      | 79개 / 48개                 |
| 생성된 CSS 파일                | 486개                       |
| React 컴포넌트 / Lynx 컴포넌트 | 89개 / 49개                 |
| Headless 패키지                | 43개 (각각 독립 npm 패키지) |
| 에이전트용 `AGENTS.md` / Skill | 34개 / 17개                 |

4년 반, 39패키지다. 기여자 54명은 누적 수치이고, 실제 분포는 훨씬 좁다. 최근 12개월 사람 커밋 1,096건 중 상위 3명이 약 91%를 썼다. 이 시스템은 54명이 달라붙어 만든 게 아니라 **전담 두세 명이 오래 만든 것** 이라고 생각된다.

규모를 먼저 적어두는 이유는 뒤에 나오는 설계들이 왜 그렇게 무거운지 설명하기 위해서다. 다만 무거움의 원인이 인원수가 아니라는 점은 미리 짚어둔다.

## 전체 파이프라인

SEED의 골격은 손으로 쓰는 것과 기계가 만드는 것을 끝까지 분리한 단방향 파이프라인이다.

```text
[Figma Variables]
   │  ecosystem/figma-extractor  +  scripts/figma-to-rootage.ts (742줄)
   ▼
[Rootage YAML]  ← 손으로 쓰는 단일 원천
   │  packages/rootage/*.yaml            (토큰 12파일)
   │  packages/rootage/components/*.yaml (컴포넌트 스펙 104개)
   │
   │  ecosystem/rootage (토큰 빌드 엔진)
   ▼
[__generated__/]  JSON · .mjs · .d.ts
   │
   │  packages/qvism-preset/src/recipes/*.ts  ← 손으로 쓰는 스타일 레시피
   │  ecosystem/qvism (레시피 → CSS 엔진)
   ▼
[@seed-design/css]  vars/ + recipes/ (486파일, 전부 생성물)
   │
   │  + packages/react-headless/* (43개, 손으로 씀)
   ▼
[@seed-design/react]  89개 컴포넌트 ──► 문서 · Registry · 예제
```

당근의 크로스플랫폼 런타임인 Lynx용 라인이 `lynx-qvism-preset → lynx-css → lynx-react`로 똑같은 모양으로 한 벌 더 존재한다. 원천은 Rootage 하나, 출력은 플랫폼 수만큼이다.

## 1층 — 토큰

`packages/rootage/color.yaml`은 870줄이다. 원시 값과 의미 값이 같은 파일 안에서 참조 관계로 연결된다.

```yaml
kind: Tokens
metadata: {id: color, name: Color, lastUpdated: 26-06-15}
data:
  collection: color
  tokens:
    $color.palette.carrot-600: # 원시: 실제 hex
      values: {theme-light: '#ff6f0f', theme-dark: '#...'}

    $color.bg.brand-solid: # 의미: 원시를 참조
      description: 브랜드와 관련된 요소들이 즉각적으로 인식될 수 있도록 돕습니다...
      values:
        theme-light: $color.palette.carrot-600
        theme-dark: $color.palette.carrot-700
```

색상 199개의 내부 비율이 이 파일에서 가장 중요한 정보다.

| 계층                                 | 개수 |
| ------------------------------------ | ---- |
| `$color.palette.*` (원시)            | 94   |
| `$color.bg.*` (의미)                 | 43   |
| `$color.manner-temp.*` (도메인 전용) | 20   |
| `$color.stroke.*`                    | 16   |
| `$color.fg.*`                        | 16   |
| `$color.banner.*`                    | 10   |

원시 94개에 의미 105개, 거의 1:1이다. 원시 토큰을 300개 만들어 두고 의미 토큰은 20개만 두는 구성이 흔한데, 그러면 필요한 의미 이름이 없어서 컴포넌트가 원시 토큰을 직접 참조하기 시작한다. 그 시점부터 테마 전환은 컴포넌트마다 예외를 갖는다.

`$color.manner-temp.*` 20개도 눈여겨볼 만하다. 범용 디자인 시스템을 표방하면서도 자기 도메인의 핵심 UI에는 전용 토큰 계층을 따로 팠다. 이 판단은 시리즈 3편에서 다시 다룬다.

토큰마다 한국어 `description`이 붙어 있다. 이 설명은 장식이 아니라 그대로 생성물로 흘러가고, 문서와 MCP 응답을 거쳐 LLM 컨텍스트까지 도달한다. 설명문 자체가 API 문서 역할을 한다.

한 가지 더, **모드는 토큰의 속성이 아니라 컬렉션의 속성이다.**

```yaml
- name: color
  modes: [theme-light, theme-dark]
- name: motion
  modes: [preferred, reduced] # 모션 민감성
- name: viewport-width
  modes: [base, sm, md, lg, xl] # 반응형
```

다크모드, 반응형, 접근성(모션 감소)이 전부 같은 "모드" 추상으로 통일돼 있다. 다크모드를 특별대우하지 않는다. 나중에 고대비 모드나 폰트 스케일을 추가할 때 구조를 건드리지 않아도 되는 이유가 여기에 있다.

## 2층 — 컴포넌트 스펙

`packages/rootage/components/action-button.yaml`은 466줄이다. 컴포넌트의 디자인 명세를 코드가 아니라 데이터로 선언한다.

```yaml
kind: ComponentSpec
metadata: {id: action-button, name: Action Button}
data:
  schema:
    slots: # 컴포넌트를 구성하는 파츠와 각 파츠가 가질 수 있는 속성
      root:
        {properties: {color: {type: color}, cornerRadius: {type: dimension}}}
      label: {properties: {color: {type: color}, fontWeight: {type: number}}}
      icon: {description: 'layout=iconOnly에서 사용되는 아이콘 슬롯입니다.'}
      prefixIcon:
        {
          description: '주로 액션의 의미를 보조합니다. suffixIcon과 함께 사용할 수 없습니다.',
        }
    variants:
      variant:
        values:
          brandSolid:
            {
              description: '브랜드의 핵심 가치를 전달하며 ... 한 화면에 하나만 사용하는 것을 권장합니다.',
            }
          neutralSolid: {description: '대부분의 화면에서 CTA로 사용합니다.'}
          criticalSolid:
            {
              description: '삭제나 초기화처럼 되돌릴 수 없는 중요한 작업에 사용합니다.',
            }
      size: {values: {xsmall, small, medium, large}}
      layout: {values: {withText, iconOnly}}

  definitions: # (variant × state × slot) → 토큰
    base:
      enabled: {root: {colorDuration: $duration.color-transition}}
      pressed: {root: {scaleScope: self}}
    variant=brandSolid:
      enabled:
        {
          root: {color: $color.bg.brand-solid},
          label: {color: $color.palette.static-white},
        }
      pressed: {root: {color: $color.bg.brand-solid-pressed}}
      disabled:
        {root: {color: $color.bg.disabled}, label: {color: $color.fg.disabled}}
      loading: {root: {color: $color.bg.brand-solid-pressed}}
```

이 구조가 만드는 효과는 네 가지다.

**`slots × variants × states`가 곱집합으로 전개된다.** 빠진 조합이 있으면 검증기가 잡는다. 사람이 CSS를 직접 짜면 `criticalSolid`의 `loading` 상태 같은 조합은 조용히 누락되고, 그 상태가 실제로 화면에 뜨는 날 발견된다.

**디자이너의 언어와 개발자의 언어가 같은 파일에 산다.** `description`에 "한 화면에 하나만", "되돌릴 수 없는 작업에" 같은 사용 가이드라인이 스펙 안에 들어 있다. Figma 문서 따로, Storybook 따로, 코드 따로 관리하다 서로 어긋나는 문제가 구조적으로 사라진다.

**값이 전부 토큰 참조다.** `#ff6f0f`가 아니라 `$color.bg.brand-solid`다. 브랜드 색을 바꾸면 104개 컴포넌트가 동시에 따라온다. 당연해 보이지만 컴포넌트 CSS에 hex가 한 번이라도 박히는 순간 이 성질은 깨진다.

**`strokeColor`나 `scaleScope` 같은 것까지 스펙에 있다.** 누르면 살짝 줄어드는 인터랙션마저 디자인 데이터로 선언돼 있다. 개발자 재량으로 남겨두지 않았다.

## 3층 — 레시피

스펙이 "무엇을"이라면 레시피는 "어떻게"다. 둘을 잇는 접착층이고, 손으로 쓴다.

```ts
import spec from '@seed-design/rootage-artifacts/components/action-button'

import {actionButton as vars} from '../vars/component'

const actionButton = defineRecipe({
  name: 'action-button',
  base: {
    display: 'inline-flex',
    position: 'relative',
    cursor: 'pointer',
    ...createFocusRingRestStyles(),
    [pseudo(focusVisible)]: createFocusRingStyles(),
    [pseudo(not(disabled), active)]: {...createScaleFeedbackStyles()},
    transition: `background-color ${vars.base.enabled.root.colorDuration} ${vars.base.enabled.root.colorTimingFunction}`,
  },
  variants: {
    variant: {
      brandSolid: {
        background: vars.variantBrandSolid.enabled.root.color, // 타입 안전한 생성 변수
        color: vars.variantBrandSolid.enabled.label.color,
        ...prefixIcon({
          color: vars.variantBrandSolid.enabled.prefixIcon.color,
        }),
      },
    },
  },
})
```

**레시피에는 값이 없다.** `vars.variantBrandSolid.enabled.root.color`처럼 스펙에서 생성된 타입 안전 변수만 참조한다. 스펙에 없는 상태를 쓰면 타입 에러가 난다. 디자인 스펙과 구현이 어긋나는 문제를 컴파일 타임에 잡는 구조다.

레시피가 다루는 건 토큰으로 표현할 수 없는 것들뿐이다. 레이아웃, 의사 선택자 조합, 트랜지션 합성, 포커스 링 같은 것이다.

의사 선택자 우선순위가 모바일 기준이라는 점도 기록해 둘 만하다. `hover`가 아니라 `active`(pressed)가 1급 시민이다. 당근의 주 전장이 모바일 앱이기 때문이다. 데스크톱 관제 화면이 주 전장인 시스템이라면 정반대로 가야 한다. 디자인 시스템의 기본값은 그 시스템이 서 있는 환경을 그대로 반영한다.

## 4층 — 생성물

레시피 79개가 CSS 파일 486개로 전개된다. `.css`, `.mjs`, `.layered.mjs`, `.d.ts` 조합이다.

여기서 주목할 건 파일 수가 아니라 **생성물 경계를 `.gitattributes` 하나로 단일 원천화했다는 점**이다.

```text
# The single source of truth for "which files are generated".
# Consumers that can ask git directly do so instead of repeating these paths:
#   - .github/workflows/claude-code-review.yml  ':(exclude,attr:linguist-generated)'
#   - .claude/hooks/generated-files-guard.ts    git check-attr
#   - .claude/agents/*, skills/*                git check-attr
packages/css/vars/**            linguist-generated
packages/css/recipes/**         linguist-generated
**/__generated__/**             linguist-generated
```

"이 파일은 생성물"이라는 사실을 CI 리뷰 필터, 에디터 훅, 린터, AI 에이전트가 각자 하드코딩하지 않는다. 전부 `git check-attr`로 물어본다. 생성 경로가 늘어나면 고칠 파일은 하나다.

주석에 "`.coderabbit.yaml`과 `biome.json`은 gitattributes를 못 읽어서 손으로 중복한다"는 예외까지 적혀 있다. 단일 원천이 완전하지 않다는 사실 자체를 문서화해 둔 셈이다.

## 5층 — 컴포넌트

Headless(상태·접근성·이벤트)와 Styled(스타일 결합)를 분리했다. Headless는 43개의 독립 npm 패키지다. `accordion`, `dialog`, `floating`, `prevent-scroll`, `presence` 같은 단위로 쪼개져 있다.

```tsx
// packages/react/src/components/ActionButton/ActionButton.tsx
export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>((props, ref) => {
  const recipeClassName = actionButton({variant, layout, size}) // 생성 CSS 레시피
  const api = usePendingButton({loading, disabled}) // headless 로직
  const {scaleFeedbackRef, scaleFeedbackClassName} = useScaleFeedback()

  if (
    layout === 'iconOnly' &&
    !(props['aria-label'] || props['aria-labelledby'])
  ) {
    console.warn(
      "When layout is 'iconOnly', 'aria-label' or 'aria-labelledby' should be provided.",
    )
  }
})
```

접근성 위반을 런타임 경고로 알린다. 타입으로 막을 수 없는 계약을 개발 중에 잡는 실용적 타협이다. `aria-label`의 존재 여부는 타입으로 강제할 수 있지만 그 값이 의미 있는 문자열인지는 강제할 수 없고, 강제하려 들면 API가 쓰기 불편해진다.

## 이 파이프라인이 그은 경계

다섯 개 층을 지나며 손으로 쓰는 지점은 세 곳뿐이다. 토큰 YAML, 컴포넌트 스펙 YAML, 스타일 레시피다. 나머지는 전부 생성물이고, 생성물은 `.gitattributes`로 표시돼 수정이 차단된다.

디자인 시스템이 무너지는 가장 흔한 경로는 생성된 CSS를 급하게 직접 고치고 다음 빌드에서 그 수정이 사라지는 것이다. SEED는 이 경로를 파일 시스템 배치, 속성 표시, 편집 시점 훅의 세 겹으로 막았다.

한 가지는 미리 적어둔다. 이 파이프라인은 컴포넌트를 빨리 찍어내려고 만든 게 아니다. SEED 팀이 직접 밝힌 동기는 다른 데 있었고, 그 이야기는 3편에서 그들의 회고를 인용해 다룬다.

다음 글에서는 이 구조를 만들기 위해 SEED가 내린 선택 일곱 가지를 이유와 함께 정리하고, 그 구조를 유지하는 데 실제로 얼마가 드는지 센다.
