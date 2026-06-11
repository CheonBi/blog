# PLANS.md — 블로그 개인화 로드맵

> `yceffort/yceffort-blog-v2` fork를 **나의 블로그**로 바꾸기 위한 작업 목록입니다.
> 저장소 사용법·가드레일은 [`AGENTS.md`](./AGENTS.md)를 함께 보세요.
> 체크박스(`- [ ]`)를 진행 상황에 맞춰 갱신하며 사용하세요.

**범례**: 🔴 사용자 결정 필요 · 🟡 사용자 입력/자산 필요 · 🟢 에이전트가 바로 실행 가능

---

## Phase 0 — 먼저 정할 것 🔴 (이게 정해져야 나머지가 진행됨) — ✅ 확정 (2026-06-11)

- [x] **새 도메인**: `cheonbi.kr` (blog) / `research.cheonbi.kr` (research) **확정**. placeholder 불필요 — 바로 최종값으로 치환.
- [x] **신원 정보**: 표시 이름·닉네임 `CheonBi`, 이메일 `root@cheonbi.kr`, GitHub `CheonBi`. Twitter·LinkedIn 등 기타 소셜은 **미사용**(원저자 `yceffort_dev` 제거).
- [x] **사이트 톤**: 제목 `yceffort` → `CheonBi`, 부제 `Grind. Learn. Repeat.`는 **유지**.
- [x] **원저자 글 처리 방침**: **(C) 전부 보존** (고유 385 + 영문본 30 = 415개 `.md`, 비파괴). `apps/research/research/*` 슬라이드도 research 유지 결정에 따라 **보존**.
- [x] **research 서브사이트**: **유지** (메뉴 `🧪 Research` 링크·별도 배포 포함 — 도메인만 `research.cheonbi.kr`로 교체).
- [x] **자산 준비**: **미준비** — 프로필/파비콘/OG 배경은 placeholder·기존 파일 유지, Phase 3에서 교체.
- [x] **Google Analytics** (보강 결정): 원저자 ID `G-ND58S24JBX` **비활성화(`''`)** → Phase 5에서 새 GA4 속성 ID 적용.

### 확정 치환 매핑 (Phase 1이 그대로 적용)

| 찾기 (원저자) | 바꾸기 (CheonBi) |
|---------------|------------------|
| `yceffort.kr` | `cheonbi.kr` |
| `research.yceffort.kr` | `research.cheonbi.kr` |
| `yceffort` (제목·`author.name`·copyright·GitHub 핸들) | `CheonBi` |
| `root@yceffort.kr` | `root@cheonbi.kr` |
| `yceffort_dev` (twitter contact) | (제거 — 빈 문자열) |
| `G-ND58S24JBX` | `''` (비활성화) |
| `github.com/yceffort` | `github.com/CheonBi` |

- **치환 순서 주의**: 구체적 토큰(`research.yceffort.kr`, `yceffort.kr`, `root@yceffort.kr`, `yceffort_dev`, `github.com/yceffort`)을 먼저 처리하고, 단독 `yceffort`(제목·`author.name`·copyright·`LICENSE` 저작권자)는 전역 일괄 대신 **파일별로** 마지막에 교체.
- 콘텐츠 **보존(C)** · research **유지** → Phase 4는 대량 삭제 없음(본문 내 `yceffort.kr` 자기참조 링크 처리만 잔존).

---

## Phase 1 — 사이트 정체성 / 메타데이터 🟢 (Phase 0 입력 반영)

> 핵심은 `config.ts`. 여기서 대부분의 텍스트가 파생됨.

- [ ] `apps/blog/src/config.ts`
  - [ ] `url`(prod 도메인), `title`, `subtitle`, `copyright`
  - [ ] `googleAnalyticsId`(`G-ND58S24JBX` → 새 GA4 ID, 또는 비활성화 시 `''`)
  - [ ] `menu[]`의 Research 링크(`research.yceffort.kr`) — 유지/수정/삭제
  - [ ] `author`: `name`, `photo`, `bio`, `contacts.{email,github,twitter,...}`
- [ ] `apps/research/src/config.ts` — 위와 동일 항목 + blog 링크(`menu`)
- [ ] `apps/blog/src/app/layout.tsx`
  - [ ] `metadataBase`(`https://yceffort.kr`), `openGraph.url`/`description`, `twitter.description`, `authors`
- [ ] `apps/research/src/app/layout.tsx` — `metadataBase`(`research.yceffort.kr`)
- [ ] `apps/blog/public/favicon/site.webmanifest` — `name`/`short_name`/`description`
- [ ] `apps/blog/public/robots.txt` — `Sitemap:` 2줄 + `llms.txt` 주석 도메인
- [ ] `package.json`(루트) — `author`, `repository.url`, `name`, `description`
- [ ] `apps/blog/package.json` — `description`("yceffort blog")
- [ ] `apps/blog/LICENSE` — `Copyright (c) 2025 yceffort` 저작권자
- [ ] `README.md`(루트) — 도메인·저자·소개 문구
- [ ] `apps/blog/README.md` — 도메인·이메일·repo 소개 (루트와 별개)
- [ ] **`config.ts`로 안 빠진 코드 내 하드코딩** (도메인/식별자 바꿀 때 함께 — `git grep`으로 확인):
  - [ ] `apps/blog/src/app/sitemap.ts` — `yceffort.kr` 약 10곳 (`config.url` 미사용)
  - [ ] `apps/blog/src/app/tags/[tag]/pages/[id]/page.tsx:18,21` — canonical·OG URL
  - [ ] `apps/blog/src/app/[year]/[...slug]/page.tsx:139` — 글 하단 Discussion 이슈 링크(repo·`assignees=yceffort`) → 새 repo로 교체/제거
  - [ ] `apps/blog/src/components/MDXComponents.tsx:68` — 내부링크 판별 도메인(`!href.includes('yceffort.kr')`); 미반영 시 자기 글 링크가 외부 취급
  - [ ] 푸터 GitHub 링크 — `apps/blog/src/components/LayoutWrapper.tsx:161`, `apps/research/src/components/LayoutWrapper.tsx:141` (`github.com/yceffort`)

---

## Phase 2 — 프로필 · About · Resume 🟡 (개인 경력/소개 필요)

> 현재 네이버페이·트리플·카카오·삼성SDS 경력, KAIST/동국대 학력, 저서 등 **원저자의 실제 정보가 하드코딩**되어 있습니다. 전면 교체 또는 비활성화가 필요합니다.

- [ ] `apps/blog/src/components/about/AboutHero.tsx`
  - [ ] eyebrow 텍스트(`FRONTEND ENGINEER · SEOUL`), 소개 문단
  - [ ] 하드코딩된 링크 라벨 `yceffort`(GitHub), `yceffort_dev`(Twitter) — `:53`, `:63`
- [ ] `apps/blog/src/components/about/AboutIntro.tsx` — 자기소개 3문단 전체
- [ ] `apps/blog/src/components/about/Resume.tsx` — 생년월일·이메일·**경력/학력/활동/저서** 전면 교체 (또는 섹션 제거)
- [ ] (선택) `apps/blog/src/app/resume/` 페이지 유지 여부
  - 푸터 GitHub 링크(blog `LayoutWrapper.tsx:161` / research `:141`)는 **Phase 1**에서 함께 처리

---

## Phase 3 — 에셋 교체 🟡 (이미지 파일 준비 필요)

- [ ] `apps/blog/public/profile.jpeg`, `apps/research/public/profile.png` — 프로필 사진
- [ ] `apps/blog/public/favicon/*` — `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192/512.png` 세트 ([realfavicongenerator](https://realfavicongenerator.net) 등으로 일괄 생성 권장)
- [ ] `apps/blog/public/og-background.jpg`, `og-background-page.jpg` — OG 이미지 배경
- [ ] `apps/blog/public/default-image.png`, `thumbnail.png` — 기본 썸네일
- [ ] `apps/blog/public/splash/*` — PWA 스플래시(사용 시)

---

## Phase 4 — 콘텐츠 정책 🔴 (Phase 0 결정에 따름)

- [ ] 원저자 글 정리: `apps/blog/posts/**` 와 대응 이미지 `apps/blog/public/<year>/**`
- [ ] research 슬라이드 정리: `apps/research/research/**` (NaverPayDev·yceffort.kr 등 참조 포함)
- [ ] 보존하는 글이 있다면 본문 내 `yceffort.kr` 자기참조 링크·`NaverPayDev` 언급 처리 방침 결정
- [ ] `apps/blog/public/demos/**`(webgpu 등 데모)·`LCP/` 등 글에 종속된 정적 자산 정리

---

## Phase 5 — 자동화 · 시크릿 · 배포 🟡

- [ ] 로컬 `.env.local` 생성: `ANTHROPIC_API_KEY`(번역), `GEMINI_API_KEY`(썸네일)
- [ ] GitHub 저장소 시크릿 `CLAUDE_CODE_OAUTH_TOKEN` 설정(Claude Actions 사용 시) — 미사용 시 `.github/workflows/claude*.yml` 제거 고려
- [ ] Vercel 프로젝트 생성(blog/research) + 새 도메인 연결 (Root Dir: `apps/blog`/`apps/research`)
- [ ] GA4 새 속성 생성 후 측정 ID 반영(Phase 1) — 또는 Analytics 비활성화
- [ ] `.github/dependabot.yml` 검토, `optimize-images.yaml` 동작 확인

---

## Phase 6 — 검증 ✅

- [ ] `pnpm install && pnpm lint && pnpm prettier`
- [ ] `pnpm build:blog` (research 유지 시 `pnpm build:research`)
- [ ] 잔존 식별자 0 확인:
  ```bash
  git grep -nIE "yceffort\.kr|yceffort_dev|root@yceffort|G-ND58S24JBX|github\.com/yceffort" \
    -- ':!apps/*/posts/**' ':!apps/research/research/**' ':!pnpm-lock.yaml' \
    ':!AGENTS.md' ':!PLANS.md' ':!.codex/**'
  ```
- [ ] `pnpm dev:blog`로 홈·About·Resume·태그·RSS(`/feed.xml`)·사이트맵(`/sitemap.xml`)·매니페스트 육안 확인
- [ ] OG 이미지(`/api/og`) 렌더 확인

---

## 빠른 시작 순서 (요약)

1. **Phase 0** 결정 사항을 적는다(특히 도메인·이름·글 처리 방침).
2. **Phase 1**으로 `config.ts` 2개 → `layout.tsx` 2개 → manifest/robots/package/LICENSE 순으로 텍스트 치환.
3. **Phase 2**에서 About/Resume를 내 정보로 교체(또는 비움).
4. **Phase 3** 에셋 교체.
5. **Phase 4** 콘텐츠 정책 실행.
6. **Phase 5** 배포·시크릿, **Phase 6** 검증.
