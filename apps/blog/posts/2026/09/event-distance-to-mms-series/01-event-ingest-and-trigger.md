---
title: 원본 이벤트와 비동기 부작용을 분리하기
tags:
  - java
  - backend
  - mms
  - event-driven
published: true
date: 2026-09-18
description: distanceM을 파생값과 분리해 저장하고, 분류 결과 갱신 뒤 외부 발송을 예약하는 구조를 코드와 계약의 관점에서 살핀다.
series: distanceM이 MMS가 되기까지
seriesOrder: 1
---

## Table Of Contents

> 시리즈: [distanceM이 MMS가 되기까지](/series/event-distance-to-mms)  
> 다음 글: [선형 보간보다 기준점 선택이 어렵다](/2026/09/event-distance-to-mms-series/02-distance-to-coordinate)

센서가 보내는 `distanceM`은 채널 시작점에서 이벤트까지 잰 거리다. 서버는 이 숫자와 위치 기준점을 나중에 결합해 좌표를 계산한다.

```json
{
  "deviceCode": "DAS",
  "channelNumber": 1,
  "distanceM": 1300.0,
  "value": 0.42,
  "eventTime": "2026-09-18T10:15:30+09:00"
}
```

이 입력에 위도와 경도를 넣지 않은 이유는 계산 결과의 수명이 원본보다 짧기 때문이다. 기준점이 바뀌거나 보간 규칙을 바꾸면 좌표도 달라진다. `distanceM`까지 덮어쓰면 센서가 처음 보낸 값을 다시 확인할 수 없다.

## 저장 모델은 원본과 파생값을 나눈다

`EventCreateRequestDto`는 장비, 채널, 거리, 측정값, 발생 시각을 받는다. `POST /api/event`의 저장 경로는 짧다.

```text
EventController.createEvent
  → EventService.createEvent
    → EventMapper.insertEvent
      → event.event INSERT
```

MyBatis는 장비 코드와 채널 번호를 내부 ID로 바꾼 뒤 거리값을 그대로 전달한다.

```sql
INSERT INTO event.event (
    device_id,
    channel_id,
    distance_m,
    value,
    event_time
)
VALUES (..., ..., #{request.distanceM}, #{request.value}, #{request.eventTime})
RETURNING id
```

이 테이블의 책임은 이벤트가 들어온 사실을 보존하는 데 있다. 위경도 계산은 `gis.location_mapping`과 이벤트를 함께 읽는 쪽의 책임이다. 이 분리를 두면 위치 기준점을 수정해도 이벤트 원본은 그대로 남는다.

DAS 이벤트에는 워터폴 스냅샷 예약도 붙는다. 그 작업은 채널, 거리, 시각을 사용한다. MMS 발송은 이 저장 트랜잭션에 들어오지 않는다.

## 상태 갱신과 외부 부작용을 나눈다

분류기는 `eventId`를 받은 뒤 이벤트 유형을 별도 요청으로 갱신한다.

```http
PUT /api/event/812/event-type
Content-Type: application/json

{
  "eventTypeCode": "IMPACT"
}
```

`EventService.updateEventType`는 먼저 DB를 갱신한다. 갱신된 행이 있을 때만 발송 작업을 예약한다.

```java
int updated = eventMapper.updateEventType(eventId, request);

if (updated > 0) {
    CompletableFuture.runAsync(
        () -> mmsSendService.sendClassifiedEvent(
            eventId,
            request.eventTypeCode()
        )
    );
}
```

이 코드는 두 계약을 만든다.

- `POST /api/event`의 성공은 원본 이벤트 저장을 뜻한다.
- `PUT /api/event/{id}/event-type`의 성공은 분류 결과 저장을 뜻한다.

두 번째 요청의 HTTP 응답은 SendON 응답을 포함하지 않는다. `runAsync`가 작업을 실행 풀에 넘긴 뒤 컨트롤러가 응답하기 때문이다. 외부 서비스가 느려도 분류 API의 응답 시간은 영향을 덜 받는다. 애플리케이션 프로세스가 작업 시작 전에 내려가면 복구할 큐가 없다.

## 발송 조건은 부작용 앞에 둔다

`sendClassifiedEvent`는 외부 API를 호출하기 전에 입력을 좁힌다.

```text
분류 코드가 발송 가능한가
성공 이력이 없는가
MMS 설정이 켜져 있는가
활성 수신자가 있는가
```

`UNCLASSIFIED`, `UNKNOWN`, `null`은 발송하지 않는다. 같은 이벤트에 `SUCCESS`가 있으면 다시 보내지 않는다. 설정 조회에 실패하면 발송을 멈춘다. 수신자가 없을 때도 외부 호출을 만들지 않는다.

이 조건은 입력 검증과 중복 방지를 함께 처리한다. 실패 이력은 성공 이력과 다르므로 재시도 여지를 남긴다. 다만 성공 이력 조회와 외부 발송 사이에 잠금이 없다. 같은 이벤트에 분류 요청이 겹치면 두 작업이 모두 성공 이력을 보지 못하고 발송할 수 있다.

```text
작업 A: SUCCESS 조회 → 없음
작업 B: SUCCESS 조회 → 없음
작업 A: SendON 발송
작업 B: SendON 발송
```

`CompletableFuture.runAsync`는 실행 예약이지 내구성 있는 메시지 큐가 아니다. 이 차이를 알고 있어야 현재 구현의 장애 범위를 정확히 말할 수 있다.

현재 발송 이력에는 설정 비활성이나 수신자 없음으로 건너뛴 시도가 남지 않는다. `mms.send_history`만 보고 문자가 없는 이유를 모두 찾을 수 없는 이유다. 이 문제를 고치려면 `SKIPPED` 같은 상태를 추가할지, 별도 진단 로그를 남길지 먼저 정해야 한다.
