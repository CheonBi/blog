# 자동 동기화와 개인화 경계

## 관리 범위

`upstream-sync.json`이 원본 저장소·브랜치·반영 SHA와 허용·제외·보호 경로를
관리합니다. 원본 Blog·Research 구현, 공유 패키지, 마크다운 WASM, 빌드 도구,
성능 수집 구성을 따릅니다. 원작자 콘텐츠·프로필·News·뉴스 서비스·Claude
workflow는 가져오지 않습니다. `blog-fork` 자체도 수정하지 않습니다.

개인 설정·소개·경력·콘텐츠는 보호합니다. 나머지 화면의 최소 브랜드 변경,
Windows 경로 지원, 빈 영문 목록 처리는 3방향 병합으로 유지합니다. 보호 파일의
원본 변경도 ignored 목록에 기록합니다. 원본에 새 필수 설정이 추가돼 CI가
실패하면 필요한 필드만 개인 설정에 반영합니다.

## 비교와 충돌

```sh
node scripts/sync-upstream.mjs --dry-run
node scripts/sync-upstream.mjs --source ../blog-fork --head 74913e3827db645e1a5ae6bbbb37a3211ec852b8 --dry-run
```

마지막 반영 원본·새 원본·현재 파일을 비교합니다. 충돌 파일은 현재 내용을
보존하고 `docs/upstream-conflicts.md`에 기록합니다. 코드에 충돌 표시는 넣지
않습니다. 수정된 파일의 삭제나 양쪽에서 바꾼 바이너리도 검토 대상으로 남기며,
이름 변경은 삭제와 추가로 확인합니다. 원본 이력이 되돌려지면 변경 전에
중단합니다. 충돌이 없을 때만 기준 SHA를 갱신합니다.

충돌 PR에서는 모든 경로를 해결하고 CI를 통과시킨 뒤 기준 SHA를 incoming
SHA로 갱신하고 보고서를 삭제합니다. 미해결 보고서가 있는 PR은 병합하지
않습니다. 잠금 파일과 대시보드는 선택한 워크스페이스와 개인 서비스 이름으로
재생성합니다.

## 매일 생성하는 PR

GitHub Actions는 한국 시간 매일 오전 9시를 기준으로 실행하고 수동 실행도
지원합니다. GitHub의 예약 실행은 지연될 수 있고, 장기간 활동이 없으면
비활성화될 수 있습니다.
[예약 실행 문서](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)를
참고합니다.

GitHub App을 `CheonBi/blog`에만 설치하고 Contents·Pull requests의 읽기·쓰기
권한을 설정합니다. variable `UPSTREAM_APP_CLIENT_ID`와 secret
`UPSTREAM_APP_PRIVATE_KEY`를 등록합니다. App 토큰으로 PR을 만들어 CI가 자동
실행되게 하며 검증 작업에는 운영 비밀을 전달하지 않습니다.
App 설치 후 `UPSTREAM_SYNC_ENABLED=true`로 활성화하고 수동 실행으로 첫 PR과
CI 자동 실행을 확인합니다. 활성화 전에는 예약·수동 실행 모두 작업을 건너뜁니다.
App 토큰을 사용하는 이유는 [GitHub 토큰 동작 문서](https://docs.github.com/en/actions/concepts/security/github_token)의
자동 실행 조건을 따르기 위해서입니다.

봇 브랜치는 `codex/feature/upstream-sync` 하나이며 열린 PR도 하나만 갱신합니다.
이 브랜치는 매 실행 시 재구성되므로 수동 수정은 별도 브랜치나 main에서
진행합니다. 관리 대상 변경이 없으면 PR을 만들지 않습니다. 충돌 시 Draft로
남기고 자동 병합은 사용하지 않습니다.

## 개인 데이터

도메인·프로필·연락처·분석 설정은 각 앱 config, 기존 경력 원본은 Blog의
`src/data/profile.ts`, 원본 형식 이력서는 `resumeContent.ts`에 있습니다.
자료가 없는 출판·오픈소스 구역은 표시하지 않습니다. 두 발표 자료와 관련 글의
slide 연결은 개인 콘텐츠입니다.
메뉴는 Blog와 Research를 연결하며 News는 제외합니다. Kinetograph(Kineto)는
폐기했으며 앱·도메인 리디렉션·배포 파일과 관련 게시글 2편을 다시 추가하지
않습니다. 이행 전 목록의 `retired` 표시는 삭제 기록이며 공개 콘텐츠가 아닙니다. 과거
`/generate-screenshot` 별칭은 개인 썸네일 생성 글로 연결하고,
`/series/control-room-dispatch`는 현재 개인 시리즈 주소로 보냅니다.

이번 이행의 본문·작성일 보존은 `pnpm check:content --baseline`으로 확인합니다.
이후 정상적인 글 수정과 추가를 막지 않도록 평상시 CI는 현재 콘텐츠의 구조와
링크를 검사합니다. 기존 2026년 9월 글에는 코드 언어·강조 표기의 보존용 린트
예외가 있으며 전체 글의 렌더링 검사는 계속 수행합니다.
