---
title: 경계를 긋는 디자인 시스템
description: SEED Design의 생성 파이프라인과 변경 관리에서 작은 팀이 가져올 경계를 살펴봅니다.
marp: true
theme: cheonbi
paginate: true
size: 16:9
tags:
  - design-system
  - architecture
  - react
date: 2026-11-04
published: true
featured: true
post: https://cheonbi.kr/series/design-system-boundaries
---

# 경계를 긋는 디자인 시스템

SEED Design을 읽고 작은 팀의 선택을 정리하다

cheonbi

<!--
이 발표는 개인 블로그의 같은 이름 시리즈 4편을 요약합니다. SEED Design의 관찰 시점은 원문에 기록한 커밋 6247f189b입니다. 현재 제품의 모든 구현을 설명하는 자료는 아닙니다.
원문: https://cheonbi.kr/series/design-system-boundaries
-->

---

## 원천과 생성물

토큰을 바꿨을 때 어떤 화면이 달라지는지 추적할 수 있어야 합니다.

- 사람이 관리하는 원천에 변경 이유를 남깁니다.
- 생성한 CSS와 타입은 원천에서 다시 만듭니다.
- 생성물을 직접 수정하면 다음 빌드에서 변경을 잃습니다.

<!--
첫 글에서 확인한 핵심은 손으로 쓰는 원천과 기계가 만드는 결과의 경계입니다. 파이프라인의 크기보다 수정할 위치를 예측할 수 있는지가 중요합니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/01-seed-generation-pipeline
-->

---

## 생성 파이프라인

| 단계           | 맡는 일                     |
| -------------- | --------------------------- |
| 토큰           | 색상과 의미, 모드 정의      |
| 컴포넌트 스펙  | 슬롯과 상태 조합 정의       |
| 레시피         | 레이아웃과 선택자 조합      |
| 생성 CSS       | 플랫폼이 소비할 스타일 출력 |
| React 컴포넌트 | 동작과 스타일 연결          |

<!--
원문은 Rootage와 Qvism, 생성 CSS, React 구현을 층별로 읽습니다. Lynx도 같은 원천에서 별도 결과를 만듭니다. 모든 단계가 생성되는 것은 아니며 레시피는 사람이 작성합니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/01-seed-generation-pipeline
-->

---

## 의미를 가진 토큰

```css
/* 값의 이름 */
--color-orange-500: #ff6f0f;

/* 사용하는 이유의 이름 */
--color-bg-brand-solid: var(--color-orange-500);
```

컴포넌트는 의미 토큰을 사용하고, 모드는 의미와 값의 연결을 바꿉니다.

<!--
이 코드는 원문의 구분을 설명하기 위해 줄인 예시입니다. 실제 SEED 토큰 이름과 모든 생성 CSS를 재현한 것은 아닙니다. 도메인에만 필요한 토큰도 범용 계층과 분리해 둘 수 있습니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/01-seed-generation-pipeline
-->

---

## 컴포넌트 스펙의 조합

슬롯, 변형, 상태를 데이터로 표현합니다.

| 구분 | 예시                                |
| ---- | ----------------------------------- |
| 슬롯 | root, label, icon                   |
| 변형 | 크기, 강조 방식                     |
| 상태 | enabled, pressed, disabled, loading |

누락된 조합을 검증하고 플랫폼별 구현이 같은 스펙을 읽게 합니다.

<!--
예시는 원문의 action-button 설명을 축약한 것입니다. 데이터 스펙은 검증과 플랫폼 재사용을 돕지만 명세와 생성기를 유지하는 비용도 생깁니다. 작은 단일 플랫폼 팀에서 같은 구조가 반드시 유리하다고 일반화하지 않습니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/02-design-decisions-and-cost
-->

---

## 레시피가 맡는 부분

레시피는 생성된 변수를 사용해 스타일을 조합합니다.

- 레이아웃과 포커스 표시
- 의사 선택자의 우선순위
- 여러 상태의 전환

스펙에 없는 값을 직접 넣기 시작하면 원천과 구현이 어긋납니다.

<!--
원문은 레시피에서 타입이 있는 스펙 변수를 참조하는 방식을 살펴봅니다. 토큰과 컴포넌트 디자인을 한곳에서 관리하려면 접착층에 값이 중복되지 않는지 확인해야 합니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/01-seed-generation-pipeline
-->

---

## Headless 분리의 배경

웹과 Lynx는 화면을 그리는 기반이 다릅니다.

상태와 동작을 스타일·DOM 의존 코드와 나누면 다른 플랫폼에서도 재사용할 수 있습니다.

웹 하나를 운영하는 작은 팀은 기존 Headless 라이브러리를 활용하는 선택부터 비교할 수 있습니다.

<!--
SEED의 패키지 분할은 멀티플랫폼과 부분 채택이라는 배경이 있습니다. 원문의 판단은 이 배경 없이 패키지 수나 자체 구현까지 그대로 가져오지 말자는 것입니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/02-design-decisions-and-cost
-->

---

## 배포 중간 상태

원문에서 읽은 CDN 배포는 완료 manifest를 확인한 뒤 버전을 공개합니다.

- 불완전한 업로드를 공개하지 않습니다.
- PR snapshot은 stable 포인터를 변경하지 않습니다.
- 공개 버전을 바꾸는 경로를 코드로 검증합니다.

<!--
원문은 네이티브 앱의 토큰 소비 때문에 npm 외에 CDN이 필요했던 맥락을 설명합니다. 이 인프라 전체를 도입하지 않아도 완료 전 비공개와 snapshot 격리라는 규칙은 참고할 수 있습니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/02-design-decisions-and-cost
-->

---

## 변경을 돕는 도구

토큰과 컴포넌트의 변경에는 소비자 코드의 이동도 필요합니다.

| 도구              | 남기는 정보                   |
| ----------------- | ----------------------------- |
| 영향도 추적       | 어디까지 바뀌는가             |
| codemod           | 소비자 코드를 어떻게 옮기는가 |
| deprecations 원장 | 언제 무엇을 없애는가          |
| archive           | 어떤 접근을 버렸는가          |

<!--
시리즈 3편은 디자인 시스템을 고치기 두려웠던 이유와 V3의 변경 장치를 연결합니다. 도구의 개수보다 소비자가 다음 버전으로 이동할 수 있는지가 핵심입니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/03-the-real-problem-is-changing
-->

---

## 접근성의 출발점

색 대비의 한계가 토큰에 있으면 여러 컴포넌트로 퍼집니다.

의미 토큰을 정의할 때 배경과 전경의 관계를 확인하고, 모드별 대비를 검증할 수 있어야 합니다.

고대비와 밀도 같은 관제 화면의 요구도 이 단계에서 구분합니다.

<!--
원문은 SEED의 V2 회고와 작은 관제 도메인을 함께 봅니다. 이 발표는 새 접근성 측정 결과를 제시하지 않으며, 실제 색 조합의 통과 여부는 별도 검증이 필요합니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/03-the-real-problem-is-changing
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/04-where-to-draw-the-line
-->

---

## 작은 팀의 경계

범용 UI는 기존 라이브러리와 비교하고, 도메인의 의미를 지키는 부분에 시간을 씁니다.

- 범용 계층과 관제 전용 토큰을 구분합니다.
- 원천과 생성물의 위치를 나눕니다.
- 변경 영향도를 조회할 수 있게 합니다.

자체 DSL과 대규모 패키지 분할은 필요한 소비자가 생길 때 다시 판단합니다.

<!--
이는 원문 4편의 관제 도메인에 대한 선택을 요약한 것입니다. 모든 팀에 적용되는 규모 기준이나 도구 추천을 새로 제안하지 않습니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/04-where-to-draw-the-line
-->

---

## 사람이 읽을 수 있는 변경 경로

컴포넌트의 원천, 생성물, 사용처를 찾는 정보는 사람과 코딩 에이전트 모두에게 필요합니다.

문서와 분석 스크립트가 실제 파일 경로를 연결하면, 변경 전에 확인할 범위를 좁힐 수 있습니다.

<!--
원문에서 다룬 분석 스크립트와 에이전트 문서의 공통 목적을 정리합니다. 문서가 실제 코드와 어긋나지 않도록 유지하는 일이 먼저입니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/02-design-decisions-and-cost
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/04-where-to-draw-the-line
-->

---

## 도입을 판단하는 질문

토큰 하나를 바꿨을 때 영향받는 컴포넌트와 화면을 찾을 수 있나요?

사용 중인 코드를 옮기는 방법과 버린 설계의 이유가 남아 있나요?

이 질문에 답할 수 있도록 현재 시스템의 경계를 정리합니다.

<!--
시리즈의 결론은 컴포넌트 개수보다 변경 가능성을 보자는 것입니다. 발표의 질문은 원문에 제시한 판단 기준을 다시 적은 것입니다.
출처: https://cheonbi.kr/2026/09/design-system-boundaries-series/04-where-to-draw-the-line
-->

---

## 원문과 읽은 범위

[경계를 긋는 디자인 시스템 시리즈](https://cheonbi.kr/series/design-system-boundaries)

1. 디자인 시스템을 만드는 공장 뜯어보기
2. 설계 결정 일곱 가지와 정직한 비용
3. 디자인 시스템의 진짜 문제는 바꾸는 것이다
4. 작은 팀은 어디에 경계를 그어야 하는가

SEED Design 분석 기준: `6247f189b`

<!--
상세 코드와 원래의 수치, 인용 출처는 각 원문에 남겨 두었습니다. 이 자료는 그 분석을 발표용으로 줄인 것이며 최신 SEED Design 전체를 다시 조사한 결과가 아닙니다.
원문: https://cheonbi.kr/series/design-system-boundaries
-->
