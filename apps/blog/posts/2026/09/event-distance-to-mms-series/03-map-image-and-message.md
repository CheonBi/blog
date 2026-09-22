---
title: 하나의 위치 결과로 지도와 메시지를 만들기
tags:
  - java
  - gis
  - mms
  - backend
published: true
date: 2026-09-18
description: 지도와 계통도 렌더러를 분리하고, 하나의 EventLocation을 이미지와 MMS 본문에 함께 전달하는 구조를 살핀다.
series: distanceM이 MMS가 되기까지
seriesOrder: 3
---

## Table Of Contents

> 이전 글: [선형 보간보다 기준점 선택이 어렵다](/2026/09/event-distance-to-mms-series/02-distance-to-coordinate)  
> 다음 글: [외부 발송을 상태와 부작용으로 읽기](/2026/09/event-distance-to-mms-series/04-send-history-and-operations)

발송 작업은 이미지와 본문에 같은 위치를 넣어야 한다. 둘이 각자 좌표를 계산하면 이미지의 마커와 본문의 주소가 달라질 수 있다. 이 글에서 중요한 타입은 렌더러보다 결과 객체다.

```java
record EventDiagramResult(
    byte[] image,
    Point eventPoint,
    EventLocation location
) {}
```

실제 `EventDiagramResult`는 PNG 바이트, 캔버스의 이벤트 점, 본문에 사용할 `EventLocation`을 함께 가진다. `EventMmsMessageFormatter`는 이 객체의 위치를 사용한다. 위치 계산을 다시 호출하지 않는다.

## 지도 렌더러는 외부 타일을 조합한다

`LocationMapRenderer`는 이벤트 좌표를 중심으로 XYZ 타일을 읽고 Java2D 캔버스에 합친다. 지도 경로를 선택하려면 두 조건이 필요하다.

```text
타일 URL 템플릿이 유효한가
이벤트에 위도와 경도가 있는가
```

타일 좌표를 계산하고 필요한 타일을 병렬로 요청한 뒤 배경, 선로, 기준점, 이벤트 마커를 차례로 그린다. 캔버스 크기는 1,200×800이고 이벤트 마커는 `(600, 400)`에 둔다.

```text
EventMmsDto
  → EventLocation 계산
  → 중심 좌표로 뷰포트 계산
  → XYZ 타일 좌표 계산
  → 타일 조회
  → 배경과 선로 그리기
  → 이벤트 마커 그리기
  → PNG 인코딩
```

타일 조회에는 연결 3초, 요청 6초 제한이 있다. 일부 타일이 빠지면 해당 영역을 회색으로 두고 이미지를 계속 만든다. 한 장도 받지 못하면 지도 결과를 성공으로 취급하지 않는다. 부분 실패와 전체 실패를 같은 예외로 처리하지 않는 선택이다.

```java
if (tiles.isEmpty()) {
    throw new MapRenderException("no map tile");
}

drawAvailableTiles(canvas, tiles);
```

타일 제공자의 attribution을 이미지에 그리는 호출은 현재 주석 처리되어 있다. 이 부분은 렌더링 코드의 취향이 아니라 제공자 정책과 연결된 외부 계약이다.

## 폴백은 예외 처리보다 렌더러 선택에 가깝다

지도 경로가 사용할 수 없는 경우 `DiagramRenderer`를 선택한다.

```text
유효한 지도 설정 + 좌표 있음
  → LocationMapRenderer

그 외
  → DiagramRenderer
```

지도 타일 URL이 비어 있거나 형식이 맞지 않을 때, 앞뒤 좌표 기준점을 찾지 못할 때, 타일을 하나도 받지 못할 때 계통도로 간다. 지도 조회나 Java2D 렌더링에서 예외가 나도 같은 경계를 사용한다.

계통도 렌더러는 이벤트의 장비·채널과 거리가 엣지 범위에 들어가는지 확인한다.

```text
startDistance <= event.distanceM <= endDistance
```

엣지 안의 위치는 다음 비율로 표시한다.

```text
edgeRatio = (distanceM - startDistance)
          / (endDistance - startDistance)
```

`DiagramEventRenderer`는 이 비율을 경로 길이에 적용한다. 곡선은 짧은 선분으로 나눈 뒤 누적 길이를 사용한다. 지도와 계통도는 표현 방식이 다르지만, 둘 다 이벤트 위치를 나타내는 같은 `EventLocation` 계약을 반환해야 한다.

## 본문 포맷터는 표시만 담당한다

이미지가 만들어지면 포맷터가 날짜, 유형, 원본 거리, 접속점, 주소, 추정 좌표를 문자열로 만든다.

```text
발생 시간 : 2026-09-18 10:15:30
이벤트 유형: 외부 충격
선로 감지거리: 1,300.0 m
가장 가까운 접속점: J/B17 (약 42.0 m)
인접 지점: 일곡변전소에서 약 300.0 m
주소: 광주광역시 북구 ... 인근
추정 좌표: 35.103000, 126.903000
```

포맷터의 책임은 표시 형식이다.

- 이벤트 시각은 `Asia/Seoul`의 `yyyy-MM-dd HH:mm:ss`로 만든다.
- 유형이 없으면 `-`를 표시한다.
- 원본 `distanceM`은 소수점 한 자리와 `m`을 붙인다.
- 주소는 도로명주소를 먼저 사용하고 없으면 지번주소를 사용한다.
- 좌표는 `latitude, longitude` 순서로 표시한다.

지도 라이브러리의 좌표 배열은 `longitude, latitude` 순서를 요구할 수 있다. 내부 객체의 표시 순서와 외부 라이브러리 입력 순서를 같은 것으로 취급하면 마커가 다른 곳에 찍힌다. 변환 지점을 코드에 남겨야 하는 이유다.

이 구조에서 렌더러는 위치를 계산하고 포맷터는 위치를 표현한다. 이 두 책임을 합치지 않으면 지도 구현을 바꿔도 MMS 본문 규칙을 다시 쓰지 않아도 된다.
