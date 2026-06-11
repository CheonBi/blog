# AGENTS.md

> 이 저장소에서 작업하는 모든 AI 에이전트(Codex, Claude, Cursor, Copilot 등)를 위한 운영 지침서입니다.
> Codex·Cursor·Gemini CLI 등은 저장소 루트의 `AGENTS.md`를 자동으로 읽습니다.
> **현재 진행 중인 개인화 작업의 체크리스트는 [`PLANS.md`](./PLANS.md)를 참고하세요.**

---

## 1. 이 저장소는 무엇인가

- **정체**: `yceffort/yceffort-blog-v2`(원저자: yceffort)를 **fork한 개인 블로그**입니다. 현재 fork 주인은 **CheonBi**(`github.com/CheonBi/blog`)이며, **개인화 작업이 진행 중**입니다.
- **형태**: pnpm 워크스페이스 기반 **모노레포**.
- **⚠️ 중요**: 아직 원저자(yceffort)의 신원·경력·연락처·글이 코드 곳곳에 남아 있습니다. 이를 새 주인의 정보로 교체하는 것이 핵심 과제이며, 그 목록과 순서는 [`PLANS.md`](./PLANS.md)에 정리되어 있습니다.

### 구성

| 패키지 | 경로 | 도메인(원본) | 설명 |
|--------|------|--------------|------|
| blog | `apps/blog` | yceffort.kr | 메인 블로그 (고유 글 385개 + 영문본 30개 = 415개 `.md`, 한/영 이중 언어) |
| research | `apps/research` | research.yceffort.kr | Marp 기반 발표 슬라이드 사이트 |
| shared | `packages/shared` | – | 공용 컴포넌트(`Providers`, `ThemeSwitch`, `SocialIcon`, 아이콘) · 유틸 |

### 기술 스택

- **Framework**: Next.js 16 (App Router) · React 19
- **Styling**: Tailwind CSS 4 · PostCSS · stylelint
- **Language**: TypeScript 5
- **Runtime**: Node.js **24.x** (`.nvmrc` 참조) · **pnpm 10.6.5** (corepack)
- **콘텐츠**: Markdown/MDX (`next-mdx-remote-client`), front-matter, rehype/remark 파이프라인
- **배포**: Vercel (블로그·리서치 각각 별도 프로젝트)

---

## 2. 명령어 (모노레포 루트에서 실행)

```bash
pnpm install              # 의존성 설치 (frozen-lockfile은 CI에서 사용)

pnpm dev                  # blog(3000) + research(3001) 동시 실행
pnpm dev:blog             # 블로그만 → http://localhost:3000
pnpm dev:research         # 리서치만 → http://localhost:3001

pnpm build:blog           # 블로그 프로덕션 빌드
pnpm build:research       # 리서치 프로덕션 빌드

pnpm lint                 # 전체 ESLint
pnpm lint:fix             # ESLint 자동 수정
pnpm prettier             # 포맷 검사 (CI에서 강제)
pnpm prettier:fix         # 포맷 자동 수정
pnpm --filter blog lint:style   # 블로그 stylelint (CSS/SCSS)
```

블로그 전용 스크립트(`apps/blog`에서 실행):

```bash
pnpm --filter blog translate -- posts/2026/01/some-post.md   # 영어 번역(.en.md 생성)
node scripts/generate-thumbnail.mjs <post-path>              # 썸네일 생성(Gemini)
node scripts/generate-tags.mjs                               # 태그 색인 생성
```

> **패키지 매니저는 반드시 `pnpm`** 을 사용합니다. `npm`/`yarn`로 lockfile을 건드리지 마세요. Node는 24.x 고정입니다.

---

## 3. 디렉토리 지도

```
apps/blog/
  src/
    config.ts                 # ★ 사이트 정체성의 단일 진실 공급원 (제목·저자·메뉴·GA)
    app/                      # Next App Router (페이지·API 라우트)
      layout.tsx              # ★ 루트 메타데이터(OG/Twitter/도메인)
      about/ resume/          # 자기소개·이력 페이지
      api/og/ feed.xml/ sitemap.ts api/llms*/   # OG 이미지·RSS·사이트맵·llms.txt
    components/
      about/                  # ★ AboutHero · AboutIntro · Resume (개인정보 하드코딩)
      LayoutWrapper.tsx Footer 등
    utils/ hooks/ constants/ type/
  posts/<YEAR>/<MM>/<slug>.md(.en.md)   # ★ 블로그 글 (원저자 콘텐츠 385개 + 영문본 30개)
  public/                     # ★ 프로필 사진·파비콘·OG 배경·썸네일 등 에셋
  scripts/                    # translate / generate-thumbnail / generate-tags
apps/research/
  src/config.ts               # ★ 리서치 사이트 정체성
  research/*.md               # 발표 슬라이드 원고
packages/shared/src/          # 공용 컴포넌트·유틸 (getContactHref 등)
.github/workflows/            # CI · Claude 리뷰 · 이미지 최적화 · CodeQL
```

`★` = 개인화 시 반드시 손봐야 하는 곳.

---

## 4. 개인화 핵심 파일 (단일 진실 공급원)

사이트 정체성은 대부분 **`config.ts`** 에서 흘러나옵니다. 아래 표의 파일을 바꾸면 사이트 전반이 따라갑니다. 구체적 작업 항목·순서는 [`PLANS.md`](./PLANS.md) 참조.

| 무엇 | 파일 | 비고 |
|------|------|------|
| 제목·부제·저작권·도메인·메뉴·저자·연락처 | `apps/blog/src/config.ts`, `apps/research/src/config.ts` | 가장 먼저 |
| Google Analytics ID (`G-ND58S24JBX`) | 위 두 `config.ts:13` | 새 GA4 속성 ID로 |
| 메타데이터(metadataBase·OG·Twitter) | `apps/blog/src/app/layout.tsx`, `apps/research/src/app/layout.tsx` | 도메인 하드코딩 주의 |
| PWA 매니페스트 | `apps/blog/public/favicon/site.webmanifest` | name/short_name/description |
| robots / 사이트맵 URL | `apps/blog/public/robots.txt` | sitemap·llms.txt 도메인 |
| 자기소개·이력 | `apps/blog/src/components/about/{AboutHero,AboutIntro,Resume}.tsx` | 경력·학력·저서 **하드코딩** |
| 프로필·파비콘·OG·썸네일 | `apps/blog/public/*`, `apps/research/public/*` | 바이너리 에셋 교체 |
| 패키지 메타 | `package.json`(루트), `apps/blog/package.json` | author·repository·name·description |
| 라이선스 | `apps/blog/LICENSE` | 저작권자 |
| 사이트맵 URL | `apps/blog/src/app/sitemap.ts` | `yceffort.kr` 약 10곳 하드코딩 (`config.url` 미사용) |
| 태그 페이지 canonical·OG | `apps/blog/src/app/tags/[tag]/pages/[id]/page.tsx:18,21` | `yceffort.kr` 하드코딩 |
| 글 하단 Discussion 이슈 링크 | `apps/blog/src/app/[year]/[...slug]/page.tsx:139` | `yceffort/yceffort-blog-v2` repo·`assignees=yceffort` → 새 repo로 교체 또는 제거 |
| 푸터 GitHub 링크 | `apps/blog/src/components/LayoutWrapper.tsx:161`, `apps/research/src/components/LayoutWrapper.tsx:141` | `github.com/yceffort` 하드코딩 (config 미사용) |
| 내부링크 판별 도메인 | `apps/blog/src/components/MDXComponents.tsx:68` | `!href.includes('yceffort.kr')` — 새 도메인 미반영 시 자기 글 링크가 외부 취급됨 |
| 블로그 README | `apps/blog/README.md` | 도메인·이메일·repo 소개 (루트 `README.md`와 별개) |

> 잔존 식별자 점검(글 제외):
> ```bash
> git grep -nIE "yceffort\.kr|yceffort_dev|root@yceffort|G-ND58S24JBX|github\.com/yceffort" -- ':!apps/*/posts/**' ':!apps/research/research/**' ':!pnpm-lock.yaml' ':!AGENTS.md' ':!PLANS.md' ':!.codex/**'
> ```

---

## 5. 글 작성 규칙

- **위치**: `apps/blog/posts/<YEAR>/<MM>/<slug>.md`
- **번역본**: 같은 폴더에 `<slug>.en.md` (영어). `scripts/translate.mjs`로 생성하며 `ANTHROPIC_API_KEY`(`.env.local`)가 필요합니다.
- **썸네일**: `scripts/generate-thumbnail.mjs`가 `GEMINI_API_KEY`로 이미지를 생성해 `public/thumbnails/<year>/<month>/<slug>.png`에 저장합니다. 빌드 시 파일 존재로 자동 매칭되므로 frontmatter 수정 불필요.
- **Frontmatter 스펙**:
  ```yaml
  ---
  title: '제목 (일부 <em>HTML</em> 허용)'
  tags:
    - frontend
    - react
  published: true
  date: 2026-01-17 23:00:00
  description: '한 줄 요약'
  ---
  ```
- 본문 첫 부분에 `## Table of Contents`를 두면 `remark-toc`가 목차를 채웁니다. 수식이 필요하면 해당 `config.ts`의 `useKatex`를 켜세요.

---

## 6. 코딩 규칙 & 커밋

- **ESLint**: `@naverpay/eslint-config` 기반(`eslint.config.js`). **prettier 검사는 CI에서 강제**되므로 커밋 전 `pnpm prettier:fix`.
- **pre-commit 훅**: `lefthook`이 스테이징된 파일에 ESLint/Prettier/Stylelint `--fix`를 자동 적용합니다(`lefthook.yml`). 훅을 `--no-verify`로 건너뛰지 마세요.
- **스타일**: 들여쓰기·따옴표·세미콜론 등은 주변 코드와 prettier 설정(`.prettierrc`)을 따릅니다. import 정렬 규칙이 ESLint에 포함되어 있습니다.
- **커밋 메시지**: 최근 히스토리는 **이모지 프리픽스** 관례를 따릅니다(`📝 ...`, `🐛 ...`, `✨ ...`). 별도의 conventional-commits 강제는 없습니다. 기존 스타일에 맞추세요.
- 새 브랜치는 `main`이 아닌 작업 브랜치에서. (CI는 `main` 외 브랜치 push에서 동작)

---

## 7. 에이전트 가드레일 (반드시 지킬 것)

1. **비밀키 금지**: `.env.local`(ANTHROPIC/GEMINI 키)은 절대 커밋하지 마세요. 이미 `.gitignore`에 있습니다.
2. **원저자 글(고유 385개 + 영문본 30개)을 임의로 삭제·대량 편집하지 마세요.** 보존/아카이브/삭제는 **사용자 결정 사항**입니다([`PLANS.md`](./PLANS.md) Phase 0 참조). 지시 없이 `posts/**`를 일괄 변경하지 마세요.
3. **도메인·식별자 교체는 일괄적으로.** `yceffort.kr` → 새 도메인처럼 바꿀 때는 blog·research 양쪽 `config.ts`, `layout.tsx`, `robots.txt`, manifest를 함께 맞춰 정합성을 유지하세요.
4. **lockfile 보호**: 의존성 추가/변경이 꼭 필요할 때만 `pnpm`으로, 이유를 설명하고 진행하세요.
5. **빌드를 깨지 마세요**: 의미 있는 변경 후에는 `pnpm lint`와 `pnpm build:blog`(필요 시 `build:research`)로 검증합니다.
6. **에이전트 문서 추적 정책**: `AGENTS.md`·`PLANS.md`·`.codex/`는 **git에 추적·커밋**합니다(CheonBi fork 기준 — `AGENTS.md`는 Codex·Cursor·Claude 등이 읽는 표준 루트 파일이라 저장소에 함께 둠). `.gitignore`로 제외되는 건 `CLAUDE.md`·`.claude/` 뿐입니다.

---

## 8. 배포 · 자동화 · 시크릿

- **Vercel**: blog/research 각각 별도 프로젝트. Root Directory를 `apps/blog` / `apps/research`로, Build/Install은 `pnpm build` / `pnpm install`. 보안 헤더는 각 앱의 `vercel.json`.
- **GitHub Actions** (`.github/workflows/`):
  - `ci.yaml` — lint·prettier·build (main 외 브랜치 push)
  - `claude.yml` — 이슈/PR에서 `@claude` 멘션 시 동작 (`CLAUDE_CODE_OAUTH_TOKEN` 시크릿 필요)
  - `claude-code-review.yml` — PR 자동 코드 리뷰
  - `optimize-images.yaml` · `codeql-analysis.yaml`
- **필요 시크릿/환경변수**:
  - 저장소 시크릿: `CLAUDE_CODE_OAUTH_TOKEN`
  - 로컬 `.env.local`: `ANTHROPIC_API_KEY`(번역), `GEMINI_API_KEY`(썸네일)
- 참고: `.husky/commit-msg`에 원저자 머신 경로(`/Users/yceffort/...`) fallback이 남아 있으나, `pnpm install` 후 lefthook이 재생성하므로 동작에는 무해합니다.

---

## 9. 변경 후 검증 체크리스트

```bash
pnpm install
pnpm lint && pnpm prettier
pnpm build:blog          # (리서치도 만졌다면 build:research)
pnpm dev:blog            # 로컬에서 About/Resume·OG·RSS·manifest 육안 확인
```

개인화 변경이라면 §4의 `git grep` 명령으로 잔존 `yceffort` 식별자가 없는지 마지막으로 확인하세요.
