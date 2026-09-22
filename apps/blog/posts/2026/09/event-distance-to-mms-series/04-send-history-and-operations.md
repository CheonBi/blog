---
title: 외부 발송을 상태와 부작용으로 읽기
tags:
  - java
  - backend
  - mms
  - security
published: true
date: 2026-09-18
description: 수신번호 복호화, 이미지 업로드, MMS 요청, 발송 이력을 하나의 트랜잭션으로 볼 수 없는 이유를 정리한다.
series: distanceM이 MMS가 되기까지
seriesOrder: 4
---

## Table Of Contents

> 이전 글: [하나의 위치 결과로 지도와 메시지를 만들기](/2026/09/event-distance-to-mms-series/03-map-image-and-message)  
> 처음부터 읽기: [시리즈 소개](/series/event-distance-to-mms)

`EventMmsSendService`는 DB 조회, 파일 생성, 외부 API 호출, 이력 INSERT를 한 작업 안에서 조율한다. 이 작업을 한 번의 함수 호출로 보면 실패 지점을 놓친다. 실제로는 수명이 다른 데이터와 되돌릴 수 없는 부작용이 이어진다.

## 전화번호의 평문 수명을 줄인다

활성 수신자는 `mms.config`에서 읽는다. DB에는 `enc:v1:` 접두사가 붙은 암호문을 저장한다.

```text
DB                 발송 작업 메모리           발송 이력
enc:v1:...   →     010-****-1234의 원문     →  [3, 7, 12]
```

`RecipientNumberCrypto`는 AES-GCM으로 번호를 복호화한다. 발송 작업은 외부 요청을 만들 때만 평문을 사용한다. 이력에는 전화번호 대신 수신자 ID 배열을 저장하고, 관리 API는 번호 가운데를 마스킹한다.

암호화 키, SendON API 키, 발신번호는 배포 환경에서 주입한다. 이 값이 블로그, 로그, 예외 메시지에 들어가면 암호화의 경계가 무너진다.

## 이미지 업로드와 발송은 하나의 외부 작업이다

SendON은 이미지 ID를 먼저 발급하고, 그 ID를 다음 요청에 넣어야 한다.

```java
UploadImage uploadImage = sendon.sms.uploadImages(images);
String imageId = uploadImage.data.images.get(0).id;

SendSms sendSms = sendon.sms.sendMms(new MmsBuilder()
    .setFrom(mobileFrom)
    .setTo(recipientNumbers)
    .setTitle("[진동감지센서 이벤트 발생]\n")
    .setMessage(message)
    .setIsAd(false)
    .setImages(List.of(imageId)));
```

DB 트랜잭션은 SendON에 이미 업로드한 이미지를 되돌리지 못한다. MMS 요청이 성공한 뒤 이력 INSERT가 실패할 수도 있다. 따라서 `SUCCESS` 행이 없다는 사실만으로 발송이 없었다고 결론 내릴 수 없다.

코드는 `sendSms.code == 200`을 성공으로 저장한다. 이 값은 SendON이 요청을 접수했다는 뜻이다. 수신 단말의 배달 결과는 다른 상태이며, 현재 흐름에는 그 콜백이 없다.

## 임시 파일과 증거 파일은 수명이 다르다

SendON 업로드용 파일은 임시 디렉터리에 만든 뒤 `finally`에서 삭제한다.

```text
/tmp/event-mms-{eventId}-{random}.png
```

이력 화면에 보여 줄 PNG는 `mms.history.image-dir` 아래에 별도 UUID 이름으로 보관한다.

```text
event-{eventId}-{uuid}.png
```

외부 발송이 실패해도 렌더링이 성공했다면 이력용 이미지는 남긴다. 운영자는 발송 당시 만들어진 지도를 확인할 수 있다. 이미지 저장 뒤 이력 INSERT가 실패하면 저장한 파일을 삭제해 고아 파일을 줄인다.

## `SUCCESS`와 `FAILED`는 시도의 일부만 설명한다

`MmsMapper.xml`은 이벤트, 수신자 수와 ID, 결과, 응답 요약, 이미지 위치, 파일 경로, 생성 시각을 저장한다.

```text
SUCCESS
  SendON 응답 객체가 있고 code == 200

FAILED
  렌더링·복호화·업로드·발송에서 예외가 발생했거나
  SendON이 실패 코드를 반환
```

현재 상태에는 `PENDING`이나 `SENDING`이 없다. 외부 호출 중 프로세스가 종료되면 DB에는 진행 중이던 시도를 나타내는 행이 남지 않는다. `SUCCESS`와 `FAILED`는 완료 후 기록된 결과다.

설정이 꺼져 있거나 활성 수신자가 없어서 작업을 건너뛴 경우에도 이력은 남지 않는다. 이 두 상황을 발송 실패와 구분하려면 `SKIPPED`를 저장하거나 별도 진단 이벤트를 만들어야 한다.

## 중복 방지에는 원자성이 필요하다

성공 이력을 먼저 조회하고 외부 API를 호출하는 코드는 다음 경쟁 조건을 가진다.

```text
작업 A: 성공 이력 없음 확인
작업 B: 성공 이력 없음 확인
작업 A: 발송 성공
작업 B: 발송 성공
```

DB 조회와 SendON 호출을 하나의 트랜잭션으로 묶을 수 없다. 외부 시스템의 부작용을 DB 롤백으로 취소할 수 없기 때문이다. 중복을 줄이려면 이벤트별 발송 권한을 DB 잠금, 고유 제약, 작업 큐 같은 별도 수단으로 확보해야 한다.

프로세스 재시작 뒤 예약 작업을 복구하는 아웃박스, 배달 결과 콜백, 발송 시점의 본문·좌표 스냅샷은 현재 코드에 없다. 이 항목들은 `EventMmsSendService`가 현재 보장하는 범위를 정하는 기준이다.
