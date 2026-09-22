---
title: 선형 보간보다 기준점 선택이 어렵다
tags:
  - java
  - gis
  - math
  - backend
published: true
date: 2026-09-18
description: 거리축에서 앞뒤 기준점을 선택하고, 좌표·위치명·접속점의 서로 다른 의미를 하나의 위치 결과로 조립하는 과정을 설명한다.
series: distanceM이 MMS가 되기까지
seriesOrder: 2
---

## Table Of Contents

> 이전 글: [원본 이벤트와 비동기 부작용을 분리하기](/2026/09/event-distance-to-mms-series/01-event-ingest-and-trigger)  
> 다음 글: [하나의 위치 결과로 지도와 메시지를 만들기](/2026/09/event-distance-to-mms-series/03-map-image-and-message)

`distanceM`은 거리축의 한 점이다. 좌표로 바꾸려면 같은 축에 거리와 위경도를 함께 가진 기준점이 두 개 있어야 한다.

```text
0m -------- 1,000m -------- 1,300m -------- 1,600m -------- 4,725m
               P              E               Q
          좌표 있음        이벤트          좌표 있음
```

여기서 계산보다 먼저 정해야 할 것은 `P`와 `Q`의 의미다. 위치 기준정보 한 행에 좌표, 주변 위치명, 접속점명이 모두 들어 있지 않을 수 있기 때문이다.

## 좌표와 설명의 기준점을 분리한다

`LocationPositionResolver`는 같은 거리축을 네 번 다른 조건으로 조회한다.

| 값        | 선택 기준                                                   |
| --------- | ----------------------------------------------------------- |
| `prev`    | 이벤트 거리 이하에서 위경도가 있는 가장 가까운 점           |
| `next`    | 이벤트 거리 이상에서 위경도가 있는 가장 가까운 점           |
| 주변 위치 | `nearby_location_name`이 있는 점 중 거리 차가 가장 작은 점  |
| 접속점    | `connection_point_name`이 있는 점 중 거리 차가 가장 작은 점 |

좌표에는 이름이 필요 없다. 주변 위치 설명에는 이름이 필요하다. 두 조건을 하나의 조회 결과로 합치면 좌표가 있는 행이 설명을 독점하고, 이름이 있는 행이 좌표 계산을 방해할 수 있다.

동률 처리도 계약에 들어간다. 거리 차가 같으면 `distance_m`이 작은 행을 고르고, 그것도 같으면 `id`가 작은 행을 고른다. SQL의 `ORDER BY`와 메모리 인덱스 `LocationPositionIndex`가 같은 순서를 사용해야 DB 경로와 메모리 경로가 다른 위치를 고르지 않는다.

## 보간식은 작고, 전제조건은 크다

앞뒤 기준점의 거리를 `d0`, `d1`, 이벤트 거리를 `D`라고 하면 구간 비율은 다음과 같다.

```text
t = (D - d0) / (d1 - d0)
```

좌표를 각 축에 적용한다.

```text
latitude  = lat0 + (lat1 - lat0) × t
longitude = lon0 + (lon1 - lon0) × t
```

1,000m와 1,600m 사이의 1,300m 이벤트라면 `t`는 `0.5`다.

```text
latitude  = 35.100000 + (35.106000 - 35.100000) × 0.5
          = 35.103000

longitude = 126.900000 + (126.906000 - 126.900000) × 0.5
          = 126.903000
```

Java 코드에서 중요한 부분은 곱셈보다 분기다.

```java
if (prev == null || next == null) {
    return noCoordinate();
}

if (next.distanceM() <= prev.distanceM()) {
    return noCoordinate();
}

double ratio = (eventDistance - prev.distanceM())
    / (next.distanceM() - prev.distanceM());
```

앞뒤 점을 찾지 못한 이벤트를 한쪽 점으로 외삽하지 않는다. 기준정보가 1,000m부터 시작하는데 이벤트가 900m라면 `prev`가 없다. 이때 좌표는 `null`이고, 다음 단계는 지도 대신 계통도 경로를 검토한다.

같은 거리의 좌표점이 있으면 보간 결과 대신 그 좌표를 쓴다. 위치명만 있고 좌표가 없으면 설명 후보로 남길 수 있지만, 보간의 양끝점으로 사용할 수는 없다.

## 소수점 자릿수와 현장 위치는 다르다

이 계산은 위도와 경도를 독립적으로 선형 보간한다. 광케이블 거리와 지도 위 두 점 사이의 직선은 같은 길이가 아니다. 케이블이 접속함 안에서 굽거나 건물로 들어가는 구간도 지도에는 나타나지 않는다.

따라서 `35.103000, 126.903000`이라는 출력 형식은 계산 결과의 자릿수일 뿐, 현장 측정 오차를 보장하지 않는다. 기준점의 간격과 `distance_m` 보정이 결과를 좌우한다. 본문에서 좌표를 추정값으로 표시하는 이유도 여기에 있다.

## 여러 출처를 하나의 위치 결과로 묶는다

MMS와 렌더러가 각각 기준점을 조회하면 두 결과가 어긋날 수 있다. `EventLocationResolver`는 위치 정보를 한 객체로 모아 다음 단계에 넘긴다.

```text
LocationPosition
  latitude, longitude
  nearbyLocationName, distanceFromReferenceM
  connectionPointName, distanceFromConnectionPointM
  roadAddress, lotAddress

EventLocation
  위 값
  edgeId, edgeRatio, 양끝 노드명
```

실제 지도 경로는 `channelId`와 `distanceM`으로 위치 기준정보를 읽는다. 계통도 경로는 먼저 이벤트가 속한 엣지와 `edgeRatio`를 구한 뒤 같은 위치 기준정보로 보강한다. 값이 없으면 계통도 노드 정보를 유지한다.

이 객체의 역할은 데이터를 많이 담는 데 있지 않다. 좌표를 만든 규칙과 설명을 만든 규칙을 한 번만 실행했다는 사실을 다음 단계에 전달하는 데 있다.
