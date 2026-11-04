# 운영 연결과 배포

## 현재 상태

Vercel·Linux 서버·GA4·Upstash·VAPID·GitHub App은 아직 준비되지 않았습니다.
실제 운영 배포·알림 발송·운영 데이터 수신은 수행하지 않았습니다.

## Vercel과 도메인

| 프로젝트 | Root Directory  | Build Command | 도메인                |
| -------- | --------------- | ------------- | --------------------- |
| blog     | `apps/blog`     | `pnpm build`  | `cheonbi.kr`          |
| research | `apps/research` | `pnpm build`  | `research.cheonbi.kr` |

각 앱의 Vercel 설정에 있는 `pnpm install --frozen-lockfile`을 사용합니다.
먼저 Preview를 검증한 뒤 도메인을 연결합니다.

Kinetograph(Kineto)는 폐기했습니다. 앱과 기존 도메인의 Research 리디렉션,
리디렉션 전용 배포 파일을 제거했습니다. 과거 개발 글은 기록으로 보존합니다.
기존 Vercel 프로젝트와 `kinetograph.cheonbi.kr`의 도메인 연결·DNS 레코드가
남아 있다면 운영 계정에서 정리합니다. 외부 서비스의 삭제는 아직 수행하지 않았습니다.

## 연결할 환경값

앱의 `.env.example`을 참고하고 실제 비밀은 Vercel·GitHub·서버에 저장합니다.
공개 환경값은 빌드에 포함되므로 바꾼 뒤 재배포합니다.

| 설정                                    | 위치와 용도                                           |
| --------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`         | Blog·Research Vercel, 본인 GA4 측정 ID                |
| `GA4_PROPERTY_ID`                       | Blog Vercel, 인기 글 조회 속성                        |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON`   | Blog Vercel, 해당 속성의 읽기 권한을 가진 서비스 계정 |
| `NEXT_PUBLIC_OTEL_COLLECTOR_URL`        | Blog Vercel, 검증 후 `https://otel.cheonbi.kr`        |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`          | Blog Vercel, 브라우저 푸시 공개키                     |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`  | Blog Vercel·GitHub secrets, 본인 Upstash Redis        |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | GitHub secrets, 공개키와 짝인 발송 키                 |

분석 ID와 수집 주소가 비어 있으면 해당 기능을 시작하지 않습니다. 인기 글 조회가
설정되지 않으면 최근 글에서 목록을 채웁니다. Preview·로컬 방문에는 운영
호스트 검사가 적용됩니다.

## 기존 Linux 서버

Docker Compose v2, 가용 메모리 2GB 이상, 저장 공간과 80·443 사용 현황을 먼저
확인합니다. 저장소를 `/srv/cheonbi-blog`에 체크아웃하고 `infra/otel/env.example`을
같은 폴더의 `.env`로 복사합니다. 관리자 비밀번호를 고유한 값으로 설정합니다.

```sh
cd /srv/cheonbi-blog/infra/otel
docker compose config --quiet
docker compose up -d
```

기존 웹 프록시가 있으면 기본 구성으로 실행합니다. Collector는
`127.0.0.1:14318`에서만 받습니다. 기존 프록시에서 `otel.cheonbi.kr`의
`/v1/traces`, `/v1/metrics`만 연결하고 본문 제한을 256KB로 둡니다.
컨테이너 프록시는 호스트 loopback을 그대로 사용할 수 없으므로 전용 네트워크나
호스트 프록시로 연결합니다.

프록시가 없고 80·443이 비어 있다면 `.env`에 `COMPOSE_PROFILES=public-tls`를
추가하고 `docker compose --profile public-tls up -d`로 원본 Caddy를 실행합니다.
DNS와 TLS 발급을 확인합니다. Grafana는 `127.0.0.1:3300`에서만 받습니다.

```sh
ssh -L 3300:127.0.0.1:3300 user@server
```

프로젝트와 볼륨은 `cheonbi-otel`로 분리됩니다. 브라우저·Collector·대시보드의
서비스 이름은 `cheonbi-blog`입니다. 보존 기간과 조회 범위는 원본 설정을
계승하며 `.env`에서 서버 저장 공간에 맞게 명시적으로 조정할 수 있습니다.
대시보드는 `python3 infra/otel/grafana/build-dashboards.py`로 생성합니다.

## 운영 workflow 활성화

자동 동기화는 [동기화 문서](upstream-sync.md)에 따라 GitHub App을 설정하고
`UPSTREAM_SYNC_ENABLED=true`로 활성화합니다. 첫 수동 실행에서 단일 PR과 CI를
확인합니다. 계정 준비 전에는 동기화 작업을 건너뜁니다.

서버 배포에는 secret `OTEL_DEPLOY_SSH_KEY`와 variables `OTEL_DEPLOY_HOST`,
`OTEL_DEPLOY_USER`, `OTEL_DEPLOY_KNOWN_HOSTS`를 등록합니다. 환경은 `production`이며
`OTEL_DEPLOY_ENABLED=true`일 때만 동작합니다. 배포 키의 서버 authorized_keys는
원본처럼 저장소 갱신과 `infra/otel/deploy.sh`만 허용하는 forced command에
묶습니다. 요청 커밋과 실제 HEAD가 다르면 배포가 중단됩니다.

푸시는 본인 기기의 구독·해지·수신을 확인한 뒤 `PUSH_NOTIFICATIONS_ENABLED=true`로
활성화합니다. `BLOG_DEPLOYMENT_ENVIRONMENT`는 실제 Vercel Production deployment
환경명으로 설정합니다. 기본값은 `Production – blog`입니다. 첫 저장소 push는
기존 글을 발송하지 않고 이후 새 공개 글과 초안의 공개 전환만 감지합니다.

실제 도메인에서 GA 이벤트·인기 글 조회·본인 푸시 수신·Grafana trace와 metric
도착을 확인한 뒤 운영 연결 완료로 기록합니다. 문제 발생 시 이전 Vercel 배포를
다시 지정합니다. 복원 전 소스는 `restore-before-upstream-2026-11-04` 태그에
보존되어 있습니다.
