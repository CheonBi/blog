# Blog & Research 코드 학습 가이드

개인적으로 이 블로그의 구현을 이해하고 직접 수정하기 위한 학습 계획입니다.
저장소의 구성과 실행 방법은 [루트 README](../README.md)를 참고합니다.
아래 파일 경로는 별도 설명이 없으면 저장소 루트 기준입니다.

## 코드를 읽는 목적

현재 화면과 핵심 구현은 원작자의 코드를 기반으로 합니다. 개인 콘텐츠를 넣고
실행하는 단계에서 더 나아가, 데이터가 화면에 도달하는 경로와 설계의 이유를
설명하고 직접 수정할 수 있는 것을 학습 목표로 삼습니다.

처음부터 모든 파일을 순서대로 읽기보다 **홈 → 글 상세 → 마크다운 렌더링 →
검색·메타데이터 → 오프라인 → 성능 수집** 순서로 기능 하나씩 추적합니다.
Research와 Rust 내부 구현은 Blog의 기본 흐름을 이해한 뒤 읽습니다.

## 추천 코드 읽기 순서

아래 경로는 저장소 루트 기준입니다. 파일에서 호출하는 함수의 정의와 사용처를
함께 찾아보며 읽습니다.

### 1. 저장소 구성과 공통 화면

- `package.json`, `pnpm-workspace.yaml`: 앱 실행 명령과 공유 의존성.
- `apps/blog/src/app/layout.tsx`: 모든 페이지가 공유하는 초기 구성.
- `apps/blog/src/config.ts`: 사이트 정보와 기능 설정.
- `packages/shared/src/index.ts`, `packages/shared/src/components/`: 앱 사이의 공유 경계.
- `upstream-sync.json`, [동기화 문서](upstream-sync.md): 원본을 따르는 코드와 개인화 영역.

**분석 질문:** Blog와 Research가 무엇을 공유하는가? 설정 변경은 어느 화면까지
전파되는가? 공통 패키지로 옮길 기준은 무엇인가?

**작은 실습:** 사이트 설명 하나를 바꾸고 화면·페이지 메타데이터에 반영되는
위치를 찾습니다. 변경 전에 영향받을 파일을 예상하고 실제 결과와 비교합니다.

### 2. 홈에서 게시글 목록까지

읽기 순서:

1. `apps/blog/src/app/page.tsx`
2. `apps/blog/src/components/home/HomeView.tsx`
3. `apps/blog/src/utils/Post.ts`, `apps/blog/src/utils/Series.ts`
4. `apps/blog/src/components/home/FeaturedPost.tsx`, `RecentRow.tsx`

**분석 질문:** 페이지와 화면 컴포넌트를 왜 나눴는가? Markdown 파일에서 어떤
메타데이터를 읽는가? 공개 여부·언어·정렬은 어디에서 결정되는가? 서버에서
끝나는 처리와 브라우저에서 필요한 처리는 무엇인가?

**작은 실습:** 비공개 글 하나를 만들고 홈·검색·피드에 노출되는지 확인합니다.
목록의 정렬 조건을 잠시 바꿔 보고, 화면 순서가 달라지는 이유를 설명합니다.

### 3. URL 하나가 글 상세 화면이 되는 과정

- `apps/blog/src/app/[year]/[...slug]/page.tsx`
- `apps/blog/src/utils/postPaths.ts`, `Post.ts`
- `apps/blog/src/components/post/`
- `apps/blog/src/proxy.ts`, `apps/blog/next.config.ts`

**분석 질문:** URL과 파일 경로는 어떻게 연결되는가? 존재하지 않는 글과
비공개 글은 어디에서 걸러지는가? 정적 생성·캐시 설정은 어디에 있으며,
개발 중 글 변경은 어떻게 반영되는가? 한글과 영문 경로는 어떻게 구분되는가?

**작은 실습:** 실제 글, 없는 글, 비공개 글의 주소를 각각 방문합니다. 요청부터
본문 반환 또는 404까지 통과한 함수와 분기 조건을 한 장으로 그립니다.

### 4. Markdown이 React 화면이 되는 과정

읽기 순서:

1. `apps/blog/src/utils/renderPost.tsx`
2. `apps/blog/src/components/post/MDXComponents.tsx`
3. `packages/markdown-rs/index.js`, `index.d.ts`
4. `packages/markdown-rs/src/lib.rs`, `to_hast.rs`
5. 관심 기능에 따라 `highlight.rs`, `math.rs`, `toc.rs`, `images.rs`

`renderPost`는 WASM의 `renderMarkdown` 결과인 HAST를 React 요소로 연결합니다.
HAST는 HTML 구조를 트리로 표현한 중간 데이터입니다. 먼저 이 입출력을 이해하고
Rust의 세부 파싱 코드로 들어갑니다.

**분석 질문:** 코드 강조·목차·이미지 처리는 어느 단계의 책임인가? Markdown의
컴포넌트 이름은 실제 React 컴포넌트와 어떻게 연결되는가? 임의 표현식과
import/export를 제한하는 이유와 제한 지점은 무엇인가?

**작은 실습:** 제목·코드·수식·이미지가 있는 짧은 글을 만들고 입력, 중간 트리,
최종 DOM을 비교합니다. Rust 변경 전에는 패키지 README의 빌드 방법을 확인합니다.

### 5. 검색과 외부에 공개하는 데이터

- `apps/blog/src/utils/search.ts`, `searchIndex.ts`
- `apps/blog/src/components/search/`, `apps/blog/src/app/api/search-index/`
- `apps/blog/src/utils/metadata.ts`, `jsonLd.ts`, `feed.ts`
- `apps/blog/src/app/sitemap.ts`, `apps/blog/src/app/feed.xml/`
- `apps/blog/src/utils/postsRaw.ts`, `llmsFull.ts`

**분석 질문:** 검색 대상과 화면 목록의 공개 기준은 같은가? 검색 데이터는 언제
만들고 어디에서 검색하는가? canonical·OG·구조화 데이터·피드는 각각 누구에게
어떤 정보를 제공하는가?

**작은 실습:** 글 제목 하나를 수정하고 검색·피드·원문 응답에 반영되는지
확인합니다. 반영 시점이 다르면 생성 시점과 캐시 조건을 추적합니다.

### 6. 글 저장과 오프라인 동작

- `apps/blog/src/components/pwa/`
- `apps/blog/src/utils/offline/`: `paths.ts`, `meta.ts`, `cache.ts`, `sync.ts`, `size.ts`
- `apps/blog/public/sw.js`
- `apps/blog/src/app/saved/`, `apps/blog/src/app/offline/`
- `apps/blog/src/utils/offline/__tests__/`

**분석 질문:** 저장 목록과 본문은 각각 어디에 보관하는가? 서비스 워커와 앱의
캐시 관리 책임은 어떻게 나뉘는가? 일부 다운로드 실패·용량 부족·글 갱신·삭제는
어떻게 처리하는가?

**작은 실습:** 글을 저장하고 브라우저를 닫은 뒤 네트워크를 끊고 다시 엽니다.
본문·이미지·새로고침·저장 해제를 각각 확인하고 관련 테스트와 연결합니다.

### 7. 성능 측정과 운영 연결

- `apps/blog/src/utils/telemetry/setup.ts`, `navigation.ts`, `vitals.ts`
- `apps/blog/src/utils/telemetry/page-trace.ts`, `mask.ts`, `__tests__/`
- `apps/blog/scripts/compare-performance.mjs`
- `infra/otel/`, [측정 조건과 검증 기록](restoration-validation.md)

**분석 질문:** 페이지 이동을 어떻게 구분하는가? 같은 이벤트의 중복 전송은
어떻게 막는가? 수집할 때 어떤 정보를 가리는가? 로컬 측정 수치와 실제 사용자
지표를 같은 의미로 해석해도 되는가?

**작은 실습:** 기존 테스트에서 페이지 이동 시나리오 하나를 골라 입력·상태·전송
결과를 설명합니다. 성능 변경은 같은 조건의 변경 전후 결과로 비교합니다.
실제 수집 계정 연결은 [운영 문서](operations.md)를 따릅니다.

### 8. Research와 원본 동기화로 확장

- Research: `apps/research/src/app/slides/[slug]/page.tsx` → `lib/marp.ts` →
  `components/Marp.tsx`, `MarpSlides.tsx`.
- 발표자 화면: `components/PresenterView.tsx`, `hooks/useBroadcastChannel.ts`.
- 동기화: `scripts/sync-upstream.mjs`, `scripts/tests/sync-upstream.test.mjs`.

**분석 질문:** Markdown 발표 자료와 Blog 본문의 처리 방식은 어떻게 다른가?
발표자 화면과 관객 화면은 어떤 상태를 공유하는가? 원본 코드가 바뀔 때 개인
수정을 보존하는 기준과 충돌 처리 방식은 무엇인가?

## 읽은 내용을 내 지식으로 만드는 방법

기능마다 다음 다섯 가지를 짧게 기록합니다.

1. **진입점:** 어떤 URL·클릭·명령에서 시작하는가?
2. **데이터 흐름:** 입력 → 변환 함수 → 상태 또는 캐시 → 출력은 무엇인가?
3. **설계 이유:** 이 구조가 해결하는 문제와 감수하는 비용은 무엇인가?
4. **실패 조건:** 빈 데이터·잘못된 경로·네트워크 실패 때 어떻게 동작하는가?
5. **내 변경:** 무엇을 예상하고 바꿨으며, 실제 결과를 어떻게 확인했는가?

첫 목표는 홈과 글 상세의 흐름을 코드 없이 설명하는 것입니다. 그다음 작은
기능 하나를 직접 수정하고, 관련 테스트가 무엇을 보장하는지 설명합니다.
파일 수를 많이 읽는 것보다 동작 하나를 끝까지 추적하는 데 집중합니다.
