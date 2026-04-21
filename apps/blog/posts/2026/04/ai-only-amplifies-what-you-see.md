---
title: 'AI는 내가 보이는 수준까지만 나를 증폭한다'
tags:
  - ai
  - learning
  - career
  - productivity
  - code-quality
published: true
date: 2026-04-20 12:00:00
description: '분명 빨라졌는데 코드베이스와 내 실력은 왜 그대로인가. 체감과 실증 사이의 간격을 들여다본다.'
---

## Table of Contents

## TL;DR

- **생산성은 조건부다.** 빨라진다는 실증과 느려진다는 실증이 같이 있다. 태스크 성격, 숙련도, 코드베이스 성숙도가 방향을 가른다.
- **품질·보안·기술 부채는 대체로 부정적이다.** 결함은 쌓이고, 개발자는 그걸 과소평가한다.
- **엇갈림의 뿌리는 하나다. AI는 개발자의 판단 기준을 증폭한다.** 기준이 있으면 속도가 오르고, 없으면 검증되지 않은 코드가 그대로 쌓인다. 그래서 공부는 여전히, 아니 더 필요해졌다.

## 체감과 실증 사이의 간격

AI 코딩 도구가 업계에 깔린 뒤로 개발자들 사이에서 두 가지 말이 같이 돈다. "코드가 훨씬 빨리 나온다"와 "그런데 코드베이스는 점점 나빠지는 것 같다". 한 사람 입에서 둘 다 나오는 경우도 흔하다. 이 괴리가 이 글이 다루고 싶은 지점이다.

글 전체를 관통하는 한 문장은 이거다.

> **AI는 개발자가 이미 판단할 수 있는 수준, 즉 "보이는 수준"까지만 나를 증폭한다.**

"AI를 쓰지 말자"는 주장이 아니라, 여러 연구가 반복해서 가리키는 한 가지 특성에 가깝다. 모른 채 쓰면 부채가 조용히 쌓이고, 알고 쓰면 도구의 혜택을 가려서 챙길 수 있다. 그 갈림길에 결국 개발자 본인의 판단 기준, 다시 말해 그동안 쌓아둔 공부가 놓인다. 아래에서는 (1) 생산성, (2) 품질·보안, (3) 기술 부채 세 영역으로 공개 자료를 정리하고, 마지막에 개인 관찰을 덧붙인다.

## 실증 1: 생산성 측정 결과는 한 방향이 아니다

### 긍정적 결과: GitHub, Accenture, Zoominfo

가장 자주 인용되는 숫자는 [GitHub와 MSR/Microsoft가 2022년에 낸 무작위 대조 실험(RCT)](https://arxiv.org/abs/2302.06590)에서 나왔다. 개발자 95명에게 JavaScript로 HTTP 서버를 구현하게 하고, Copilot을 쓴 그룹과 안 쓴 그룹을 비교했다.

- Copilot 그룹 평균 완료 시간: **1시간 11분**.
- 대조군 평균 완료 시간: **2시간 41분**.
- 속도 향상: **55.8%**, p=0.0017, 95% 신뢰구간 [21%, 89%].
- 주관 지표에서 "몰입 유지(73%)", "반복 작업에서 인지 부하 감소(87%)" 등이 나왔다.
- 효과가 가장 컸던 집단: **프로그래밍 경험이 적은 개발자, 하루 코딩 시간이 긴 개발자**.

이 연구가 가진 한계는 실험 설계 쪽이다. 태스크는 새 파일 하나에 HTTP 서버를 새로 짜는 일이었고, 평균 작업 시간도 1~2시간 수준이었다. 기존 코드베이스의 제약도 없었다. 쉽게 말해 AI에 가장 유리한 조건에서 나온 숫자다. 이후 3년간 이 "55%"가 제일 자주 인용됐지만, 같은 규모로 재현한 후속 연구는 드물다. 이 숫자를 특정 태스크 한정 결과라고 명시하지 않고 일반 수치처럼 쓰는 경향에 대해 비판도 꾸준히 나왔다.

후속으로 [Accenture와 GitHub가 2024년에 낸 기업 환경 RCT](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/)는 개발자 450명을 실험군, 200명을 대조군으로 두고 측정했다.

- PR 수 **+8.69%**.
- PR 머지율 **+15%**.
- 빌드 성공 수 **+84%**.
- 만족도: 90%가 "업무에 더 만족", 91%가 "코딩이 더 즐겁다".
- 참가자 중 **80% 이상**이 도입에 성공했고, 그중 **67%** 가 주 5일 이상 썼다(평균 주 3.4일).

이 연구에도 방법론적으로 짚을 곳이 있다. 측정 지표 대부분이 "PR 수", "머지 수"처럼 **코드가 얼마나 많이 제출되는가**만 재는 산출량 지표라, 그렇게 머지된 코드가 장기적으로 얼마나 살아남는지는 보여주지 못한다. throughput이 올랐다는 것과 장기 품질이 올랐다는 것은 서로 다른 질문이라는 지적이 따라붙었다.

[Zoominfo가 2025년에 공개한 400명 규모 기업 현장 사례 연구](https://arxiv.org/abs/2501.13282)는 통제된 실험실이 아니라 실제 개발 환경에서 나온 숫자를 정리했다.

- 제안 수락률(suggestion acceptance rate): **33%**.
- 라인 단위 수락률: **20%**.
- 개발자가 느낀 시간 절약: 약 **20%**.
- 만족도 점수: **72%**.
- 연구 기간 동안 Copilot이 기여한 라인은 수십만 줄 단위.
- 도입 방식도 전면 롤아웃이 아니라 4단계로 나눠서 점진 도입.
- 주요 한계로 짚힌 것: "도메인 특화 로직을 잘 못 짠다", "코드 품질이 들쭉날쭉하다".

Zoominfo 사례에서 눈에 띄는 건 수락률이 생각보다 낮다는 점이다. 제안의 **67%는 버린다**는 얘긴데, 이 숫자는 실험실 RCT보다 실제 현장에서의 사용 패턴에 더 가깝다.

### 부정적 또는 중립적 결과: Uplevel, METR

반대 방향의 결과도 있다. [Uplevel Data Labs가 2024년에 낸 현장 관측 보고서](https://visualstudiomagazine.com/articles/2024/09/17/another-report-weighs-in-on-github-copilot-dev-productivity.aspx)는 자사 고객사 개발자 약 800명의 객관 지표(사이클 타임, PR throughput, 버그율, 초과 근무 시간 등)를 재봤다.

- 사이클 타임, PR throughput: Copilot 그룹과 대조군 사이에 **유의미한 차이 없음**.
- 버그율: Copilot 그룹에서 **유의미하게 올라감**.
- 번아웃 선행 지표("Sustained Always On"): 두 그룹 모두 떨어짐.

Uplevel은 "Copilot이 코드 품질에 부정적으로 작용할 수 있다"고 해석했다. 측정 기간은 약 3개월이었고, 개발자들은 자기 일상 업무를 평소대로 했다. 통제된 실험실 태스크가 아니라 **현장에서 오래 지켜본 설계**에 가깝다. GitHub 2022의 +55%와 방향이 다른 이유는 태스크 성격과 관측 기간 양쪽에 걸쳐 있다.

METR이 2025년 7월에 공개한 [무작위 대조 실험(RCT)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)은 숙련된 오픈소스 메인테이너 16명에게 이슈 246개를 나눠주고, 이슈마다 AI 사용을 랜덤하게 허용하거나 막았다. 도구는 주로 Cursor Pro + Claude 3.5/3.7 Sonnet이었고, 작업 대상은 참가자가 평소 유지보수하던 오래된 레포지토리였다.

- 개발자가 시작 전 예측한 값: AI로 **24% 빨라질 것**.
- 개발자가 끝난 뒤 자평한 값: **20% 빨라짐**.
- 실제로 잰 값: **19% 느림** (신뢰구간 +2%~+39%).

체감으로는 20% 빨라졌다고 답했는데 실측은 19% 느렸다. **인식과 실측이 정반대로 갈라진 셈이다.** 태스크를 다 끝낸 뒤에도 개발자들은 여전히 자기가 빨라졌다고 생각했다.

METR은 [2026년 2월 업데이트](https://metr.org/blog/2026-02-24-uplift-update/)에서 다른 숫자를 내놨다.

- 원 실험 참가자 중 다시 온 10명: AI 썼을 때 **18% 빨라짐** (신뢰구간 -38% ~ +9%).
- 새로 모집한 47명: **4% 빨라짐** (신뢰구간 -15% ~ +9%).

METR도 선택 편향 가능성을 경고하면서, "같은 개발자들이 1년 동안 AI를 다루는 숙련도가 올라갔을 가능성이 크다"고 설명한다.

### Stack Overflow 서베이가 남긴 그림

전 세계 개발자 수만 명 규모의 자기 보고 설문인 [2024 Stack Overflow Developer Survey — AI](https://survey.stackoverflow.co/2024/ai)는 이런 숫자를 냈다.

- AI 도구 사용/사용 예정: **76%**.
- AI 출력의 정확도를 믿는다: **43%**.
- "복잡한 태스크에서 AI가 나쁘다"고 답한 비율: **45%**.

1년 뒤 [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/ai)는 이렇게 바뀌었다.

- AI 사용/사용 예정: **84%** (+8%p).
- AI 출력의 정확도를 믿는다: **29%** (-14%p).
- AI 정확도를 "불신": **46%** (+15%p).
- "AI 답이 거의 맞지만 결정적으로 빗나간다"를 겪어봄: **66%**.
- "AI 코드 디버깅이 직접 짜는 것보다 오래 걸린다": **45%**.
- 긍정 sentiment: 77%(2023) → 72%(2024) → 60%(2025).

정리하면, **사용률은 오르는데 신뢰는 내려가는 흐름**이 2024~2025년 내내 이어졌다.

### 결과가 엇갈리는 이유

위 연구들은 서로 반대되는 게 아니다. 조건이 다를 뿐이다.

- **태스크 성격**: HTTP 서버 새로 짜기(GitHub 2022)와 오래된 레포에서 이슈 잡기(METR 2025)는 다른 문제다.
- **숙련도**: GitHub 2022에서는 **경험이 적은 집단**이 가장 큰 이득을 봤다. METR 2025는 대상이 **숙련된 오픈소스 메인테이너**였다.
- **측정 지표**: 자기 보고(Zoominfo, Stack Overflow)와 객관 측정(METR, Uplevel) 사이에도 차이가 크다. GitHub 2022 연구조차 주관 지표와 객관 지표가 어긋난다.

결국 "AI가 빠르게 만든다/느리게 만든다"는 단일 명제가 아니라 **조건부 명제**다. 어떤 조건에서 어떤 효과가 나는지가 핵심이다.

## 실증 2: 품질과 보안 쪽에서 반복해서 나오는 패턴

생산성과 달리, 품질·보안 쪽은 연구 결과가 꽤 일관되게 한 방향으로 쏠린다.

### Asleep at the Keyboard (Pearce et al., NYU)

[Pearce 등이 2021년에 낸 이 학술 실증 연구](https://arxiv.org/abs/2108.09293)는 Copilot의 보안 특성을 처음으로 재본 대표 논문이다.

- 설계: MITRE "Top 25" CWE(Common Weakness Enumeration)를 기준으로 89개 시나리오를 짜서 Copilot에 코드 생성을 요청.
- 뽑아낸 프로그램 수: **1,689개**.
- 결과: 이 중 **약 40%가 취약**.

여기서 "취약"이란 CWE에 정의된 결함 패턴을 그대로 재현했다는 뜻이다. 이 논문은 이후 IEEE S&P 2022와 Communications of the ACM에 실렸다. 저자들이 유독 강조한 부분이 있다. Copilot은 **사용자의 코드 주변 문맥을 따라간다**는 점이다. 주변 코드에 이미 보안 결함 패턴이 들어 있으면 Copilot이 그 패턴을 이어받아 추천한다. 취약한 코드베이스에서는 AI가 그 취약성을 더 증폭하기 쉽다는 얘기로 연결된다.

### Stanford "Do Users Write More Insecure Code with AI Assistants?"

[Perry 등의 Stanford 통제 실험(2022, arXiv:2211.03622)](https://arxiv.org/abs/2211.03622)은 초점을 바꿨다. AI 자체가 아니라 "AI를 쓴 사람"이 짠 결과물을 봤다.

- 참가자 47명, 세 가지 언어, 보안 관련 태스크 다섯 개.
- 절반은 AI 보조, 나머지는 에디터만 사용.
- 결과: AI 그룹이 **보안 취약점을 더 많이 만들었다**. 특히 문자열 암호화와 SQL injection에서 차이가 컸다.
- 심리 쪽: AI 그룹은 자기 코드가 **더 안전하다고 믿었다**.

실제 보안 수준은 내려갔고, 주관적 확신은 올라갔다. 두 방향이 반대였다.

### ACM TOSEM 2024: 공개 저장소의 Copilot 스니펫

[ACM TOSEM에 실린 후속 학술 실증 연구](https://dl.acm.org/doi/10.1145/3716848)는 공개 GitHub 프로젝트에서 Copilot이 만든 걸로 식별된 스니펫 733개를 모아 정적 분석을 돌렸다.

- 분석 언어: Python, JavaScript 중심.
- 결과: **29.8%** 스니펫에서 CWE에 해당하는 보안 결함이 잡혔다.
- 언어별로는 Python 29.5%, JavaScript 24.2%.

### Apiiro 2025: 기업 현장 규모의 관측

보안 플랫폼 벤더 [Apiiro가 2025년에 낸 현장 관측 보고서](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/)는 Fortune 50 기업 내부의 레포지토리 수만 개, 개발자 수천 명 데이터를 자체 Deep Code Analysis 엔진으로 훑었다. 벤더 자체 기준으로 잰 숫자라는 점은 감안해야 한다.

- AI를 쓰는 개발자의 커밋 수: 평균 **3~4배 늘어남**.
- 커밋 분포: 작은 커밋 여러 개가 아니라 **거대한 PR**로 뭉쳐서 올라오는 쪽으로 쏠림.
- 취약점: privilege escalation 경로 **+322%**, 설계 결함 **+153%**, 클라우드 자격증명 노출 **약 2배** (Azure Service Principals 및 Storage Access Keys 기준).
- 데이터 노출: PII/결제 데이터를 담은 레포지토리 수 **3배**, 권한 검사가 빠진 API **10배**.
- 시간축: 2024년 12월 대비 2025년 6월 AI 생성 코드에서 새로 잡힌 보안 이슈가 **10배**.

Apiiro는 "문제가 얕은 신택스 오류에서 깊은 아키텍처 결함 쪽으로 옮겨간다"고 정리했다. 얕은 버그는 린터와 테스트가 잡지만, 아키텍처 결함은 잡을 장치가 사실상 사람뿐이다. 이 방향성 자체는 뒤에서 볼 GitClear·Sonar 결과와 일치하지만, 322%·10배 같은 구체적 크기는 Apiiro의 자체 측정 기준에 의존한다는 점은 감안해야 한다. 네 연구의 결함 비율이 24~40% 구간에 걸쳐 있다는 점, 그리고 Stanford가 보고한 "AI 사용자가 자기 코드를 더 안전하다고 믿는" 경향까지 같이 놓고 보면 — 어디까지나 지금까지 공개된 자료 범위에서의 해석이지만 — "모델이 좋아지면 자연스럽게 해결된다"는 기대를 뒷받침하기는 어려워 보인다.

## 실증 3: 기술 부채가 쌓이는 시그널

### GitClear: 5년 종단 데이터

커밋 분석 도구 벤더 [GitClear가 2025년에 낸 종단 분석 리포트](https://www.gitclear.com/ai_assistant_code_quality_2025_research)는 2020년부터 2024년까지 2억 1,100만 라인의 코드 변화를 추적했다.

- **리팩토링**으로 분류되는 라인 비중: 2021년 25% → 2024년 **10% 미만**.
- **copy/paste**로 분류되는 중복 코드 비중: 2020년 8.3% → 2024년 **12.3%**.
- 중복 블록 절대 수: 2024년 한 해에 전년 대비 **약 8배 급증**.
- 머지 후 **2주 안에 다시 수정**되는 churn 코드 비중: 2020년 5.5% → 2024년 **7.9%**.

GitClear는 이 흐름을 "새로 들어오는 코드가 점점 일회용(disposable)에 가까워진다"고 요약했다.

### DORA 2024 → 2025: 바뀐 것과 그대로인 것

Google의 DORA 리포트는 매년 수천 명 규모의 개발자 설문을 바탕으로 소프트웨어 딜리버리 성능을 잰다.

[2024년 리포트](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report)의 주요 숫자는 이렇다.

- AI 도입이 25% 늘 때마다 개인 생산성 **+2.1%**, 직무 만족 **+2.6%**.
- 팀 단위 딜리버리 throughput **-1.5%**.
- 딜리버리 안정성 **-7.2%**.
- AI가 만든 코드를 "믿지 않는다"고 답한 비율 **39%**.

[2025년 리포트](https://dora.dev/research/2025/dora-report/)에서는 지표 일부가 뒤집혔고 일부는 그대로다.

- AI 도입률: **90%**.
- "heavy reliance"로 사용 중: **65%**.
- 생산성이 올랐다고 느끼는 비율: **80%+**.
- Throughput: AI 도입과 **양의 상관**으로 반전(작년엔 음).
- 안정성: AI 도입과 **여전히 음의 상관**.

DORA는 이걸 이렇게 요약한다.

> "AI는 팀을 고치지 않는다. 팀에 있던 것을 증폭한다."
>
> _AI doesn't fix a team; it amplifies what's already there._

DORA가 꼽은 "AI 증폭 조건"은 플랫폼 엔지니어링, 자동화 테스트, 짧은 피드백 루프, 가치 흐름 관리(VSM) 같은 고전적 소프트웨어 공학 기본기다. 이 조건이 없는 팀에서 AI를 들이면 안정성이 더 나빠지는 쪽으로 결과가 기운다.

### Sonar 2025: 개발자가 직접 답한 데이터

정적 분석 도구 벤더 [Sonar가 낸 State of Code Developer Survey 2025](https://www.sonarsource.com/state-of-code-developer-survey-report.pdf) — 개발자 자기 보고 설문이다 — 의 숫자는 이렇다.

- "AI가 불필요하거나 중복 코드를 만들어 **기술 부채가 늘었다**": **40%**.
- "AI가 프로젝트 기술 부채에 **한 가지 이상 부정적으로 작용**했다": **88%**.
- 가장 많이 꼽힌 부작용 세 가지: 중복/유사 코드 증가, 읽기 힘든 코드 증가, 맥락에 맞지 않는 패턴 도입.

다만 "한 가지 이상 부정적으로 작용"이라는 문항이 포괄적이어서 88%라는 숫자가 곧 결함의 심각도를 가리키는 건 아니라는 점은 짚어둬야 한다. 그럼에도 Sonar는 이걸 "great toil shift(고된 일의 전환)"라고 부른다. 작업 무게가 **코드 짜는 쪽에서 코드 유지보수 쪽으로 옮겨간다**는 뜻이다.

### arXiv 2603.28592: AI 커밋 30만 개 직접 분석

2026년 arXiv에 올라온 [Debt Behind the AI Boom: A Large-Scale Empirical Study of AI-Generated Code in the Wild](https://arxiv.org/abs/2603.28592)은 지금까지 나온 커밋 단위 연구 중 가장 규모가 크다.

- 분석 대상: GitHub 공개 저장소 **6,275개**.
- 모은 AI 저자 커밋: **304,362개**.
- 대상 도구: GitHub Copilot, Claude, Cursor, Gemini, Devin (각각 1만 커밋 이상).
- 잡힌 이슈 총합: **484,606개**.
- 그중 **code smell** 비중: **89.1%**.
- 다섯 도구 모두 공통으로 보인 패턴: **커밋 15% 이상이 이슈를 한 개 이상 새로 만든다**.
- 그렇게 들어온 이슈 중 **최신 리비전까지 살아남은 비율**: **24.2%**.

마지막 숫자가 실무적으로 제일 무겁다. AI가 집어넣은 이슈 중 약 4분의 1은 시간이 지나도 발견되거나 고쳐지지 않은 채 남는다는 얘기다. 최근에는 이걸 "이해 부채(comprehension debt)"라는 이름으로 부르는 논의가 나오고 있다. 이유는 간단하다. 그 코드를 처음에 직접 짠 사람이 없으면, 열어서 이해하는 비용이 다른 일을 제쳐가며 손볼 이유가 되지 못한다. 리팩토링 비중은 줄고, 중복 코드와 churn은 늘고, 안정성은 음의 상관을 유지하고, 한 번 들어온 이슈는 그대로 남는다. 한 줄로 묶으면 이렇게 된다. **배포량은 늘고, 유지보수 가능성은 줄어든다.**

## 보이는 수준만 증폭된다는 관찰

세 영역의 결과를 한자리에 놓으면 표면적으로는 어긋난다. 생산성은 조건 따라 오르기도 내리기도 하고, 품질은 한 방향으로 나쁘고, 부채는 누적된다. 그런데 이 엇갈림의 뿌리에는 같은 메커니즘이 있다.

> AI는 개발자가 이미 가진 판단 기준을 증폭한다. 기준이 있는 영역에서는 속도를 배가시키고, 기준이 없는 영역에서는 검증되지 않은 코드를 그대로 쏟아낸다.

DORA가 팀 단위로 말한 "AI는 고치지 않는다, 증폭한다"가 개인에게도 그대로 성립한다. 기준이 있으면 속도가 증폭되고, 없으면 부재가 증폭된다. Stanford의 AI 사용자가 자기 코드를 더 안전하다고 믿은 장면, METR의 숙련 개발자가 자기 시간을 반대로 잰 장면, Stack Overflow에서 사용률과 신뢰도가 거꾸로 간 장면 — 전부 **자기 판단 기준의 경계를 스스로 보지 못하는 상태**라는 같은 뿌리에서 나온다.

## 개인 관찰

여기서부터는 실측이 아니라 주관이다. 최근 AI 코딩 도구를 일상적으로 쓰면서, 그리고 주변 개발자들과 얘기를 나누면서 위 자료들이 가리키는 방향이 내 감각과 크게 어긋나지 않는다는 점을, 두 가지 장면으로 적어둔다.

**첫째, 제품 출시 속도와 프로덕트 품질이 반대로 가는 것 같다는 감각이 있다.** AI로 개발이 빨라지니 출시 주기는 짧아지는데, 그렇게 나간 프로덕트는 어딘가 결이 거칠어 보일 때가 많다. 프론트엔드 쪽에서 이 대가는 결국 고객이 진다. 인터랙션이 삐걱대고, 일관성이 무너지고, 접근성이 떨어지는 화면이 눈에 띄게 늘었다. 그 비용이 사용자 쪽으로 밀려간다. 그런데 업계 전반에서 오는 요구는 여전히 "더 빠르게 출시"다. 이 격차 위에서 누가 품질을 붙들 것인가가 뿌옇다.

**둘째, 저연차 개발자가 깊게 고민할 기회를 점점 잃는다.** 최근 리뷰를 돌다 보면 반복되는 장면이 있다. 구현 자체는 깔끔한데 "왜 이렇게 짰는지" 물어보면 대답이 안 나온다. AI가 내놓은 답을 읽고 그대로 올린 PR이 티가 난다. 빠른 사이클을 따라가려다 보니, 문제를 직접 설계하고 막혀보고 다시 짜보는 시간이 줄어든다. "먼저 가설을 세워보고 틀려봐야 알게 되는 것"들이 쌓이지 않는다. [Anthropic이 2026년에 낸 연구](https://www.anthropic.com/research/AI-assistance-coding-skills)가 이 감각을 숫자로 보여준다. 새 라이브러리를 배우는 상황에서 AI에 코드 생성을 맡긴 그룹의 이해도 테스트 평균은 **50%**, AI를 개념 설명에만 쓰고 코드는 직접 짠 그룹은 **67%** 였다. 완료 시간 차이는 유의수준 미달이었다. 생산성은 별로 안 오르고, 학습만 줄어든 것이다. Anthropic은 이 차이를 "cognitive engagement vs. cognitive offloading"이라고 부른다.

**셋째, 코드베이스가 커질수록 AI가 제대로 보지 못하는 영역이 넓어진다.** 수백 파일, 여러 서비스로 갈라진 구조에서 AI는 주어진 파일 주변만 본다. 지금 이 기능을 붙이기 위해 수정해야 할 부분에는 집중해도, 바로 옆에 쌓여 있는 부채 영역은 건드리지 않는다. 때로는 부채 영역을 **피해 가는 방향**으로 코드를 만들고, 원래 있던 부채는 그대로 두고 우회 로직만 새로 쌓는다. 리뷰에서도 이 패턴이 자주 보인다. 수정된 파일은 깔끔한데, 그 옆 파일의 중복이나 이상한 상태 관리는 손대지 않은 채 남아 있다. 기능은 붙지만 코드베이스는 조금씩 더 꼬인다.

**넷째, 내가 직접 짜지 않은 코드의 약점은 잘 안 보인다.** 내가 타이핑한 코드는 어디가 아슬아슬한지 감이 온다. 거기는 테스트를 더 꼼꼼히 돌리고, 리뷰에서도 한 번 더 설명한다. 그런데 AI가 써준 코드는 읽어서 이상 없으면 그대로 올리게 된다. 린트와 테스트가 통과하면 "문제 없네"가 기본값이 된다. 앞에서 본 Stanford 연구가 보여준 "AI 사용자가 자기 코드를 더 안전하다고 믿는" 경향이 머릿속에서가 아니라 리뷰 실무에서 일어난다. 그렇게 발견되지 않은 부채가 숫자로만 쌓이는 감각이, 앞서 본 arXiv 2603.28592의 24.2% 잔존율과 겹쳐 읽힌다.

네 장면을 같이 놓고 보면, 지금 붙들어야 할 질문은 "AI로 코드를 얼마나 빨리 뽑을지"가 아니라 "속도가 풀어준 시간을 어디로 돌릴 것인지"다. 도구가 빨라진다고 내 판단이 같이 빨라지지는 않는다.

## 그래서 공부는 여전히 필요하다

위 관찰이 선언이 아니라 주장이 되려면, "그래서 뭘 해야 하는가"가 명확해야 한다. 내 대답은 하나다. 공부다. 여기엔 네 가지 이유가 있다.

먼저, **내가 문제에 이름을 붙일 수 있는 범위가 AI 효용의 천장이다**. 같은 AI한테 "성능 문제 좀 해결해줘"라고 던지면 AI는 뭘 손볼지 몰라 코드베이스를 한참 훑기만 하다 끝난다. 반면 "의존성 중복으로 번들이 커져서 생긴 성능 문제 해결해줘"라고 좁히면, 원인 파악과 수정까지 빠르게 도착한다. "Sentry에 떠 있는 문제 고쳐줘"가 아니라 "이 화면의 동시성 문제 고쳐줘"로 좁혀야 쓸 만한 결과가 나온다. 그 구체성은 어디서 오는가. 내가 문제를 "의존성 중복"이나 "동시성 문제"로 진단할 수 있어야 그렇게 지시할 수 있다. 지시의 해상도가 결과의 해상도를 결정하는데, 그 해상도는 내가 붙일 수 있는 이름의 범위에서 나온다. 내가 이름 붙이지 못한 문제는 AI에게도 모르는 문제로 남는다. 내가 멈추면 AI 효용의 천장도 거기서 멈춘다.

둘째, **부채를 막는 마지막 방어선은 결국 코드를 읽는 사람의 판단이다**. AI가 집어넣은 이슈의 24.2%가 고쳐지지 않고 살아남는다는 숫자(arXiv 2603.28592)가 말하는 건, 린터도 테스트도 CI도 놓치는 결함이 현실에 존재한다는 점이다. 이걸 잡을 수 있는 마지막 장치는 PR 시점에 그 코드를 읽는 사람 하나뿐이다. Stanford 결과에서처럼 AI 사용자가 자기 코드를 과신하는 쪽으로 기우는 경향을 깨는 힘 역시, 지식과 그 위에서 쌓인 의심의 습관에서 나온다.

셋째, **학습은 복리로 쌓이는 쪽으로 보인다**. METR이 같은 개발자 10명에게 1년 뒤 재실험을 했을 때 -19%에서 +18%로 움직인 결과를, METR 자신은 "참가자들의 AI 사용 숙련도가 쌓였기 때문"으로 해석한다. 모델 쪽에 큰 변화가 없던 구간에서 사람 쪽에만 변화가 있었다는 얘기다. 반대 방향도 비슷한 속도로 벌어질 가능성이 있다. 한 번의 큰 결심이 아니라 매일의 작은 누적이 만드는 차이라서, 놓친 기간을 몰아서 메우기도 쉽지 않다.

넷째, **AI가 대체하지 못하는 판단력의 시장 가치는 오히려 올라가고 있다**. 지금 시장에서 여전히 시니어 개발자 수요가 줄지 않는 현상이 이 관찰과 맞물린다. AI가 만든 코드를 판단하고, 부채를 읽어내고, 구조를 설계하는 능력은 아직 AI로 대체되지 않았고, 그래서 값이 매겨진다. 기업이 이 역할에 꾸준히 비용을 지출한다는 사실 자체가 "AI 시대에도 판단력이 희소하다"는 시장 시그널에 가깝다. 역으로 말하면, 학습을 멈춘 영역에서 내 판단은 현재 수준에 굳고, 모델은 매년 좋아지는데 내 판단은 그대로면 그 틈은 내 시야 안에서 메워지지 않는다.

말을 돌리지 않고 하자면, **AI로 결과물을 빠르게 뽑아내는 자기 자신에게 감탄하고 있을 때가 아니다**. METR이 찍은 체감 +20% 대 실측 -19%의 갭이 가리키는 지점이 바로 여기다. "오늘 이만큼이나 찍어냈다"는 감각이 가장 강할 때, 실제 코드 품질과 내 성장은 반대 방향으로 움직이고 있을 가능성이 높다.

그래서 "AI로 빨라진 속도를 어디에 쓸 것인가"가 바로 다음 질문이 된다. 요즘 흔히 보이는 답은 병렬이다. AI 세션을 여러 개 띄워 여러 태스크를 동시에 움직인다. 단기 산출량은 확실히 늘어나는데, 위 네 축 중 어느 하나도 늘어나지 않는다. 지시는 더 거칠어지고, 검증은 더 얕아지고, 학습은 더 미뤄진다. 반대 방향은 "더 적게, 더 깊게"다. 한두 작업에 집중해서 AI가 짜준 결과를 한 번 더 의심하고, 구조와 엣지 케이스를 직접 따져보고, 거기서 모르는 영역이 드러나면 그 부분만 따로 공부한다. 같은 시간을 투입해도 이쪽이 네 축 전부에 입력을 준다. 개인에게 장기적으로 남는 것도 이쪽이다.

이 네 가지는 따로 움직이지 않는다. 지시 정확도가 올라가면 검증이 쉬워지고, 검증이 쉬워지면 학습이 빨라지고, 학습이 복리로 쌓이면 천장이 열린다. 한 축만 무너져도 나머지가 같이 밀린다. 조직 차원의 개선을 기다리는 데엔 한계가 있다. 지금 개인이 쥘 수 있는 레버는 공부 쪽이 가장 가깝다.

## 마치며

지금까지 본 자료들이 모두 한쪽으로 몰려 있진 않았다. "AI가 빠르다"는 증거와 "AI가 느려지게 만든다"는 증거가 같은 해에 같이 나와 있다. 품질과 보안 쪽만 꾸준히 부정적이고, 기술 부채 쪽은 여러 지표가 최근에서야 같은 방향으로 맞춰지기 시작했다. 그만큼 결론을 내리기에는 아직 이르다는 얘기도 가능하다.

그런데 이 엇갈림 한가운데서 한 가지는 반복해서 찍힌다. AI가 내 수준을 대체하지 않는다는 것. 도구는 내가 아는 만큼만 나를 증폭하고, 내가 모르는 영역에서는 검증되지 않은 코드를 그대로 쌓는다. 그래서 개인이 당장 쥘 수 있는 대응은 세 가지 중에 하나뿐이다. 도구를 바꾸는 것, 프로세스를 바꾸는 것, 그리고 판단 기준 자체를 넓히는 것. 앞의 둘은 조직이 움직여야 하는데 그 속도는 느리고, 마지막 하나만 지금 이 순간부터 내가 움직일 수 있다.

남는 질문은 한 줄이다.

> **내 판단 기준의 경계는 어디까지이고, 그 경계를 지금 누가 넓히고 있는가.**

이 질문에 답할 수 있는 사람은 결국 개발자 본인뿐이다. 그 답은 여전히 공부다.

## 참고

### 생산성 측정 — 긍정적 결과

- [The Impact of AI on Developer Productivity: Evidence from GitHub Copilot — Peng et al., 2023 (arXiv:2302.06590)](https://arxiv.org/abs/2302.06590)
- [Research: quantifying GitHub Copilot's impact on developer productivity and happiness — GitHub, 2022](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/)
- [Research: Quantifying GitHub Copilot's impact in the enterprise with Accenture — GitHub, 2024](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/)
- [Experience with GitHub Copilot for Developer Productivity at Zoominfo — 2025 (arXiv:2501.13282)](https://arxiv.org/abs/2501.13282)

### 생산성 측정 — 중립 또는 부정적 결과

- [Can Generative AI Improve Developer Productivity? — Uplevel Data Labs, 2024](https://visualstudiomagazine.com/articles/2024/09/17/another-report-weighs-in-on-github-copilot-dev-productivity.aspx)
- [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity — METR, 2025.07](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [We are Changing our Developer Productivity Experiment Design — METR, 2026.02](https://metr.org/blog/2026-02-24-uplift-update/)

### 개발자 서베이

- [2024 Stack Overflow Developer Survey — AI section](https://survey.stackoverflow.co/2024/ai)
- [2025 Stack Overflow Developer Survey — AI section](https://survey.stackoverflow.co/2025/ai)
- [Developers remain willing but reluctant to use AI — Stack Overflow Blog, 2025.12](https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/)

### 품질·보안 실증 연구

- [Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions — Pearce et al., NYU, 2021 (arXiv:2108.09293)](https://arxiv.org/abs/2108.09293)
- [Do Users Write More Insecure Code with AI Assistants? — Perry et al., Stanford, 2022 (arXiv:2211.03622)](https://arxiv.org/abs/2211.03622)
- [Security Weaknesses of Copilot-Generated Code in GitHub Projects: An Empirical Study — ACM TOSEM, 2024](https://dl.acm.org/doi/10.1145/3716848)
- [4x Velocity, 10x Vulnerabilities: AI Coding Assistants Are Shipping More Risks — Apiiro, 2025.09](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/)

### 기술 부채 관측

- [AI Copilot Code Quality: 2025 Data Suggests 4x Growth in Code Clones — GitClear, 2025](https://www.gitclear.com/ai_assistant_code_quality_2025_research)
- [Announcing the 2024 DORA Report — Google Cloud, 2024](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report)
- [State of AI-assisted Software Development 2025 — DORA, 2025.12](https://dora.dev/research/2025/dora-report/)
- [State of Code Developer Survey 2025 — Sonar, 2025](https://www.sonarsource.com/state-of-code-developer-survey-report.pdf)
- [Debt Behind the AI Boom: A Large-Scale Empirical Study of AI-Generated Code in the Wild — arXiv:2603.28592, 2026](https://arxiv.org/abs/2603.28592)

### 학습과 인지

- [How AI Assistance Impacts the Formation of Coding Skills — Anthropic Research, 2026](https://www.anthropic.com/research/AI-assistance-coding-skills)
