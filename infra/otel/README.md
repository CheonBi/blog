# CheonBi 성능 수집 서버

브라우저의 성능 데이터를 Collector에서 받아 Tempo와 Mimir에 저장하고,
Grafana에서 조회합니다. 서비스 이름은 `cheonbi-blog`입니다.
원작자의 [CWV 실험](https://github.com/yceffort/blog-experiments/tree/main/cwv-otel-grafana)과
`74913e3827db645e1a5ae6bbbb37a3211ec852b8`의 운영 구성을 기반으로 합니다.

실제 서버와 도메인은 아직 연결하지 않았습니다.
서버 사전 확인, 비밀 설정, 기존 프록시 사용, 배포와 복구 절차는
[운영 문서](../../docs/operations.md)를 따릅니다.

## 실행 구성

- Compose 프로젝트와 볼륨: `cheonbi-otel`
- Collector HTTP: `127.0.0.1:14318` (기본값)
- Grafana: `127.0.0.1:3300` (기본값), SSH 포워딩으로 접근
- Caddy: 기존 프록시가 없을 때만 `public-tls` 프로필로 실행
- 수집 호스트: `otel.cheonbi.kr`, 허용 출처: `https://cheonbi.kr`

`env.example`을 `.env`로 복사하고 관리자 비밀번호와 서버에 맞는 값을
설정합니다. 기본 구성은 외부 80·443 포트를 사용하지 않습니다.
기존 프록시가 있으면 `/v1/traces`와 `/v1/metrics`만 Collector로 연결합니다.
최대 본문 크기 256KB와 HTTPS를 적용합니다.

```sh
docker compose config --quiet
docker compose up -d
```

## 수집과 보존

Collector는 허용한 서비스 이름, 지표와 속성만 남깁니다. 브라우저에서 보내는
값 자체의 진위는 보장하지 않습니다. Trace는 tail sampling 후 Tempo에,
delta histogram은 수신 시각을 기준으로 Mimir에 저장합니다.
Mimir의 delta 저장은 실험 기능이므로 버전 변경 시 동작을 확인합니다.

보존 기간과 조회 범위는 `env.example`에 있습니다. 서버 저장 공간에 맞게
조정하고 손실 지표를 대시보드에서 확인합니다. 메모리와 디스크 사용량은
실제 서버에서 먼저 확인해야 합니다.

## 대시보드 수정

생성된 JSON 대신 `grafana/build-dashboards.py`를 수정합니다.

```sh
python3 grafana/build-dashboards.py
```

브라우저 수집 코드, Collector 허용 규칙과 대시보드 쿼리의 서비스 이름을
함께 유지합니다. 운영 도착 검증은 Blog 도메인 연결 후 수행합니다.
