# CheonBi Blog & Research

개발 경험을 기록하는 [Blog](https://cheonbi.kr)와 기술 탐구를 발표 자료로 나누는
[Research](https://research.cheonbi.kr)를 함께 관리하는 pnpm 모노레포입니다.

## Shout-out to yceffort 🙌

> **이 블로그의 디자인과 핵심 구현은
> [yceffort](https://github.com/yceffort)님이 만든
> [yceffort/blog](https://github.com/yceffort/blog)를 기반으로 합니다.**
>
> 화면과 사용자 경험, Next.js 앱 구조, Rust/WASM 마크다운 처리기,
> 슬라이드 뷰어, 오프라인 저장과 성능 측정까지 이 저장소의 토대는
> yceffort님이 공개한 코드에서 `fork` 받았습니다.

글 한 편을 읽는 경험부터 렌더링과 운영을 다루는 세부 구현까지, 이렇게 세심하게 만든 블로그의 소스를 공개하고   
다른 사람이 이어서 만들 수 있게 해 주신 **yceffort님께 큰 감사를 보냅니다.**

이 블로그가 마음에 드셨다면 원작자의 **[블로그](https://yceffort.kr)** 와
**[원본 저장소](https://github.com/yceffort/blog)** 도 꼭 방문해 주세요.
(⭐로 응원을 남겨 주셔도 좋겠습니다.)

이 저장소에서는 원본 구현을 따라가면서 개인 글·발표 자료·프로필·도메인을 분리해 관리합니다.  
내부 `@yceffort/*` 패키지 이름과 원본 저작권 고지를 유지하며, 반영 기준과 보호 경로는 [upstream-sync.json](upstream-sync.json)에 기록합니다.

## 저장소 구조

```text
apps/
  blog/               # 글·시리즈·소개 페이지를 제공하는 블로그
    posts/            # 날짜별 Markdown 게시글과 번역
    series/           # 시리즈 소개와 구성
    src/              # 페이지, 컴포넌트, 콘텐츠 처리와 검색
  research/           # Markdown 기반 발표 자료와 슬라이드 뷰어
    research/         # Marp 발표 자료와 발표자 노트
    src/              # 슬라이드 렌더링, 발표자 화면, 오프라인 보관함
packages/
  shared/             # 두 앱의 공통 컴포넌트, 테마, 유틸리티, OG 이미지 생성
  markdown-rs/        # 서버에서 실행하는 Rust/WASM 마크다운 처리기
infra/otel/           # OpenTelemetry 수집과 Grafana 구성
scripts/              # 콘텐츠 검사, 브라우저 검증, 원본 동기화 도구
docs/                 # 운영, 동기화, 검증 기록과 개인 학습 문서
```

## 내부 구성

### Blog

`apps/blog/posts`의 Markdown 파일에서 본문과 메타데이터를 읽어 글 목록과 상세 페이지를 만듭니다.  
시리즈·태그·한영 경로를 지원하며, 관련 발표 자료를 Research에 연결할 수 있습니다.

본문은 다음 흐름으로 렌더링합니다.

```text
Markdown → Rust/WASM → HAST → React 컴포넌트 → 페이지
```

Rust/WASM이 코드 강조, 목차, MathML 수식과 이미지 메타데이터를 처리하고, 앱의 `renderPost`가 결과 트리를 React 컴포넌트로 연결합니다.   
WASM은 서버에서 실행하며, 일반 빌드는 저장소에 포함된 바이너리를 사용합니다.

- **탐색:** 홈·시리즈·태그·MiniSearch 기반 검색
- **콘텐츠 배포:** RSS, 사이트맵, OG 이미지, 구조화 데이터, Markdown 원문과 llms 문서
- **오프라인:** 서비스 워커와 Cache Storage를 이용한 글 저장·갱신·삭제
- **성능 측정:** Web Vitals와 OpenTelemetry 기반의 수집 코드 및 비교 도구

### Research

`apps/research/research`의 Markdown을 Marp로 변환해 슬라이드를 만듭니다.  
발표 자료 목록에서 태그로 탐색하고, Blog의 관련 글로 이동할 수 있습니다.

- **슬라이드 뷰어:** 전환 효과, 검색, 전체 보기, 그리기와 레이저 포인터
- **발표자 화면:** 현재·다음 장 미리보기, 발표 노트, 타이머와 화면 간 동기화
- **오프라인 보관함:** 자료와 실행 파일을 저장하고 갱신해 네트워크 없이 열람

Research 빌드는 Next.js 빌드 후 오프라인 실행 파일도 생성합니다. 실제 저장과
재실행은 개발 서버 대신 `pnpm preview:research`로 확인합니다.

### 공통 패키지와 화면

`@yceffort/shared`는 Providers, 내비게이션, 테마와 화면 효과, 소셜 아이콘, 연락처·제목 유틸리티와 OG 이미지 생성 코드를 공유합니다.   
두 앱은 StyleX로 컴포넌트 스타일을 정의하고 문서·마크다운·생성 콘텐츠에는 CSS를 사용합니다.

사이트 이름·연락처·홈 문구·공유 설명은 각 앱의 `src/config.ts`에서 관리합니다.  
Blog의 개인 경력 데이터는 `apps/blog/src/data/profile.ts`에 있습니다.  

## 기술 스택

| 영역               | 구성                                                 |
| ------------------ | ---------------------------------------------------- |
| 런타임·패키지 관리 | Node.js 24.20.0, pnpm 12.1.0                         |
| 프레임워크·언어    | Next.js 16, React 19, TypeScript 7                   |
| 스타일             | StyleX, CSS, next-themes                             |
| Blog 본문          | Rust/WASM, HAST, MathML, Mermaid                     |
| Research 자료      | Marp, Swiper, Mermaid                                |
| 검사·검증          | oxlint, oxfmt, rust-markdownlint, Vitest, Playwright |

정확한 버전과 공유 의존성은 [.nvmrc](.nvmrc), [package.json](package.json),
[pnpm-workspace.yaml](pnpm-workspace.yaml)에 정의합니다.

## 개발

저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile

# 두 앱 실행: Blog 3000, Research 3001
pnpm dev

# 앱별 실행
pnpm dev:blog
pnpm dev:research

# 빌드
pnpm build
pnpm build:blog
pnpm build:research

# Research 오프라인 미리보기: 3002
pnpm preview:research
```

일반 빌드에는 Rust와 WASI SDK 설치가 필요하지 않습니다.   
마크다운 처리기의 Rust 소스를 수정할 때는 [패키지 문서](packages/markdown-rs/README.md)의 빌드·검증 절차를 따릅니다.

## 배포

두 앱을 각각 별도의 Vercel 프로젝트로 배포합니다.

| 프로젝트 | 도메인                | Root Directory  |
| -------- | --------------------- | --------------- |
| Blog     | `cheonbi.kr`          | `apps/blog`     |
| Research | `research.cheonbi.kr` | `apps/research` |

각 프로젝트의 빌드 명령은 `pnpm build`, 설치 명령은 `pnpm install --frozen-lockfile`입니다.   
분석·성능 수집·푸시 알림 등 운영 연결은 [운영 문서](docs/operations.md)에서 설명합니다.

## 검증

```sh
pnpm lint
pnpm prettier
pnpm check:content
pnpm test:restoration

# 프로덕션 빌드 후 브라우저 검증
pnpm build
pnpm test:browser
```

콘텐츠 공개 여부와 연결, 원본 동기화, 화면과 오프라인 동작을 검사합니다.
검사 범위와 실행 조건은 [검증 기록](docs/restoration-validation.md)을 참고합니다.

## 관련 문서

- [Blog 실행과 글 작성](apps/blog/README.md)
- [Rust/WASM 마크다운 처리기](packages/markdown-rs/README.md)
- [Research 오프라인 동작](apps/research/docs/offline.md)
- [운영 연결과 배포](docs/operations.md)
- [원본 동기화와 개인화 경계](docs/upstream-sync.md)
- [검증 기록](docs/restoration-validation.md)
- [개인 코드 학습 가이드](docs/study-guide.md)

## 라이선스

[MIT License](LICENSE).    

원작자의 저작권 고지는 [Blog 라이선스](apps/blog/LICENSE)에 보존합니다.  
포함된 라이브러리·폰트 등은 각 디렉터리의 라이선스와 출처 고지를 따릅니다.
