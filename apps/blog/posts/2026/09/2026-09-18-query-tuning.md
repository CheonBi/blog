---
title: 이름으로 조인하던 쿼리를 외래키로 바꾸다
tags:
  - postgresql
  - sql
  - database
  - backend
published: true
date: 2026-09-18
description: 이름으로 추론하던 노드 종류를 외래키로 옮기고, 실행계획과 버퍼를 비교하며 잘못된 가정과 소프트 삭제 버그를 바로잡은 과정을 기록한다.
series: 센서에서 관제 화면까지
seriesOrder: 2
---

## Table Of Contents

## 짐작하는 쿼리를 걷어내다: 실행계획이 가정을 뒤집은 과정

설비 감시 시스템에서 선로 도식을 그리는 쿼리를 손봤다. 측정한 실행시간은
`0.198ms`에서 `0.081~0.099ms`로 줄었지만 공유 버퍼 접근은 28회에서 48회로
늘었다. 실행계획을 확인하는 동안 처음 세운 가정이 틀렸다는 사실도 알았고,
소프트 삭제 조건 때문에 노드가 사라지는 버그도 찾았다.

서브밀리초 측정값만으로 성능이 두 배 빨라졌다고 결론 내릴 수는 없다. 이 글은
그 숫자보다 데이터 모델을 바꾼 이유, 실행계획을 읽으며 판단을 수정한 과정,
이관 전후 결과를 검증한 방법을 다룬다.

---

## 무대: 선로 도식과 두 테이블

광케이블 선로를 거리축(0m ~ 4,725m) 위에 그리는 화면이 있다. 거리축 위에 설비가
점으로 찍힌다. 기점과 종점, 접속함, 도식에는 올리지 않는 거리 보정용 표지가 있다.

각 점은 `location_mapping` 테이블에 있다. 좌표, 선로 거리, 명칭처럼 현장에서
확인한 값을 저장한다. 별도의 `fiber_line_node_type` 카탈로그가 도형과 색을
정한다.

기존 쿼리는 두 테이블을 식별자가 아닌 이름으로 연결했다.

## 1. 이름으로 이어 붙인 관계

```sql
WITH point AS (
    SELECT lm.id, lm.line_id, lm.distance_m, lm.connection_point_name,
           lm.distance_m IN (
               MIN(lm.distance_m) OVER (PARTITION BY lm.line_id),
               MAX(lm.distance_m) OVER (PARTITION BY lm.line_id)
           ) AS is_terminal
      FROM location_mapping lm
     WHERE lm.is_active AND lm.deleted_at IS NULL
       AND lm.point_role = 'REFERENCE_POINT'
)
SELECT point.id, fnt.marker_shape, fnt.color, ...
  FROM point
  -- ① 이름을 "만든다"
  CROSS JOIN LATERAL (
      SELECT CASE WHEN point.is_terminal THEN '기점/종점' ELSE '접속함' END AS name
  ) node_type
  -- ② 만든 이름으로 카탈로그를 "찾는다"
  LEFT JOIN LATERAL (
      SELECT picked.id, picked.color, picked.marker_shape
        FROM fiber_line_node_type picked
       WHERE picked.name = node_type.name
         AND picked.deleted_at IS NULL
       ORDER BY picked.id LIMIT 1
  ) fnt ON TRUE
 WHERE point.is_terminal OR point.connection_point_name IS NOT NULL
```

거리축 양 끝이면 `'기점/종점'`, 접속점 명칭이 있으면 `'접속함'`이라는 문자열을
만든 뒤 그 이름으로 카탈로그를 조회한다.

애플리케이션은 두 값의 관계를 알고 있지만 데이터베이스는 모른다.

- 카탈로그에 `분기점` 을 추가해도 이 SQL 은 모른다. `CASE` 를 고쳐야 한다.
- 카탈로그에서 이름을 `접속함`에서 `광접속함`으로 바꾸면 매칭이 끊긴다. 쿼리는
  오류를 내지 않고 기본 도형을 반환한다.

이름은 화면에 보여 줄 속성이지 참조 무결성을 보장할 식별자가 아니다. 카탈로그
이름과 `CASE` 표현식이 같아야 한다는 규칙을 스키마에 표현할 수 없었다.

## 2. 점이 종류를 직접 가리키게

`location_mapping`에 `node_type_id`를 추가하고 외래키를 걸었다.

```sql
ALTER TABLE location_mapping ADD COLUMN node_type_id integer;

ALTER TABLE location_mapping
    ADD CONSTRAINT location_mapping_node_type_fkey
        FOREIGN KEY (node_type_id) REFERENCES fiber_line_node_type(id)
        ON DELETE SET NULL;
```

점은 현장의 설비를 나타내고 종류는 그 설비를 그리는 방법을 나타낸다. 종류 행을
물리적으로 삭제해도 설비까지 삭제하면 안 되므로 `ON DELETE SET NULL`을 골랐다.
소프트 삭제는 외래키 동작을 일으키지 않으므로 조회 정책을 따로 정해야 한다.

이 설계에서는 `node_type_id IS NULL`을 "도식에 표시하지 않는다"는 상태로 사용한다.
거리 보정용 표지는 `NULL`로 두고, 유형이 있는 점만 내부 조인으로 남긴다.

## 3. 기존 판단을 그대로 백필하기

새 컬럼은 기존 쿼리의 `CASE`가 내리던 판단으로 채웠다.

```sql
WITH point AS (
    SELECT lm.id, lm.connection_point_name,
           lm.distance_m IN (MIN(lm.distance_m) OVER (PARTITION BY lm.line_id),
                             MAX(lm.distance_m) OVER (PARTITION BY lm.line_id)) AS is_terminal
      FROM location_mapping lm
     WHERE ...
),
guessed AS (
    SELECT point.id,
           CASE WHEN point.is_terminal                       THEN '기점/종점'
                WHEN point.connection_point_name IS NOT NULL THEN '접속함'
           END AS type_name
      FROM point
)
UPDATE location_mapping lm
   SET node_type_id = picked.id
  FROM guessed
  JOIN LATERAL (
      SELECT fnt.id FROM fiber_line_node_type fnt
       WHERE fnt.name = guessed.type_name AND fnt.deleted_at IS NULL
       ORDER BY fnt.id LIMIT 1
  ) picked ON TRUE
 WHERE lm.id = guessed.id;
```

같은 이름이 여러 건이면 `ORDER BY id LIMIT 1`로 한 건을 고르는 동작도 원본과
맞췄다. 이 규칙은 이관 중 결과를 보존할 뿐, 중복 이름 문제를 해결하지는 않는다.
카탈로그 이름이 고유해야 한다면 중복을 정리한 뒤 활성 행을 대상으로 부분 고유
인덱스를 추가해야 한다.

```sql
CREATE UNIQUE INDEX fiber_line_node_type_active_name_uq
    ON fiber_line_node_type (name)
 WHERE deleted_at IS NULL;
```

행 수 비교는 이관 검증의 첫 단계다. 화면에 표시되는 점의 수가 달라졌다면 백필
규칙부터 다시 확인해야 한다.

```
설비 종류 3 건을 옮겼고, 기준점 17 건에 종류를 채웠다.
  - 접속함: 15 건
  - 기점/종점: 2 건
종류가 비어 도식에 올라가지 않는 기준점이 16 건 남았다.
```

17건은 이관 전 도식에 표시되던 수와 같다. 행 수만 같고 내용이 다를 수도 있으므로
뒤에서 두 결과 집합도 대조한다.

백필을 실행한 시점의 `MIN/MAX` 결과는 데이터로 고정된다. 이후 종점보다 먼 곳에
표지를 추가해도 종점 유형은 바뀌지 않는다. "가장 먼 점"이 항상 "선로의 끝"이라는
보장은 없으므로 이후 유형은 운영자가 지정하도록 했다.

## 4. 새 쿼리

```sql
SELECT lm.id, lm.line_id, fnt.id, fnt.marker_shape, fnt.name, fnt.color,
       lm.distance_m, COALESCE(lm.connection_point_name, lm.structure_name, ...), lm.description
  FROM location_mapping lm
  JOIN fiber_line fl            ON fl.id = lm.line_id AND fl.deleted_at IS NULL
  JOIN fiber_line_node_type fnt ON fnt.id = lm.node_type_id
 WHERE lm.is_active AND lm.deleted_at IS NULL
   AND lm.point_role = 'REFERENCE_POINT'
   AND lm.line_id IN (...)
 ORDER BY lm.line_id, lm.distance_m
```

CTE, 윈도우 함수, 두 개의 LATERAL 조인, 이름 필터가 두 개의 일반 조인으로 줄었다.

선로 필터는 `fl.id IN (...)`이 아니라 `lm.line_id IN (...)`에 두었다. PostgreSQL은
`fl.id = lm.line_id`라는 등식에서 같은 제약을 유도할 수 있다. 그래도 실제로 행을
줄여야 하는 `location_mapping`에 조건을 적으면 쿼리의 의도가 분명하고 실행계획도
바로 확인할 수 있다. 이 선택 자체가 인덱스 사용을 보장하지는 않는다.

## 5. `Buffers`가 세는 것

비교에는 `EXPLAIN (ANALYZE, BUFFERS)`를 사용했다.

PostgreSQL은 기본적으로 데이터를 8KB 블록 단위로 다룬다. `Buffers: shared hit=48`은
필요한 공유 블록을 PostgreSQL의 공유 버퍼에서 48회 찾았다는 뜻이다.

- `shared hit`: 블록이 공유 버퍼에 있어 데이터 파일 읽기를 피했다.
- `shared read`: 공유 버퍼에 없어 데이터 파일에서 블록을 읽었다. 운영체제 캐시가
  응답했을 수 있으므로 이 값만으로 물리 디스크 I/O를 단정할 수는 없다.

이 숫자는 메모리 사용량이나 고유 블록 수가 아니라 버퍼 접근 통계다. 중첩 루프에서
같은 블록을 반복해서 찾으면 각 접근이 집계된다. 상위 실행계획 노드의 `Buffers`에는
하위 노드 사용량이 포함되므로 노드별 수치를 다시 더해서도 안 된다.

### 실행시간과 함께 보는 이유

실행시간은 흔들린다. 같은 쿼리를 두 번 쟀더니 이랬다.

```
1회차: Execution Time: 0.099 ms   Buffers: shared hit=48
2회차: Execution Time: 0.081 ms   Buffers: shared hit=48
```

실행시간은 약 20% 달랐지만 공유 버퍼 히트 수는 같았다. 버퍼 통계를 보면 두 실행이
같은 블록 접근 패턴을 사용했다는 사실을 알 수 있다. 다만 버퍼 수는 CPU 연산,
정렬 비교 횟수, 잠금 대기를 설명하지 않는다. 실행시간을 대체하는 점수가 아니라
어느 실행계획 노드가 블록을 읽었는지 찾는 보조 지표로 사용했다.

## 6. 측정 결과: 시간은 줄고, 버퍼 접근은 늘었다

선로 2개와 기준점 44행을 대상으로 같은 조건을 조회했다. 두 계획 모두
`shared read` 없이 공유 버퍼 히트만 기록했다.

| 항목             | 옛 쿼리                   | 새 쿼리            |
| ---------------- | ------------------------- | ------------------ |
| 관측 실행시간    | 0.198ms                   | 0.081~0.099ms      |
| 공유 버퍼 히트   | 28                        | 48                 |
| 카탈로그 접근    | Seq Scan + Sort, 17 loops | PK Index Scan      |
| 표시할 노드 선별 | WindowAgg + Sort 후 필터  | 내부 조인으로 선별 |

새 쿼리는 공유 버퍼를 20회 더 찾았다. 실행계획에서는 카탈로그 접근 방식의 차이가
대부분을 차지했다.

옛 쿼리는 이름 기준 조건으로 17행까지 줄인 뒤 카탈로그를 조회했다. 새 쿼리는
33개의 기준점을 읽고 `node_type_id`가 연결된 행을 내부 조인으로 남긴다.

카탈로그에는 3행만 있어 힙 블록 하나에 들어간다. 순차 스캔은 그 블록만 확인하지만
PK 인덱스 스캔은 인덱스 블록과 힙 블록을 함께 방문한다. 중첩 루프가 이 조회를
반복하면서 히트 수가 늘었다.

`PK Index Scan`이라는 이름만 보고 계획이 좋아졌다고 판단할 수 없는 이유다. 작은
테이블에서는 순차 스캔이 더 저렴할 수 있고, 통계와 비용 설정에 따라 플래너의
선택도 달라진다.

구조상 줄어든 작업은 `location_mapping` 쪽에 있다. 옛 쿼리는 요청한 선로의
기준점을 정렬하고 윈도우 함수를 계산한 뒤 33행 중 16행을 버렸다. 새 쿼리는 저장된
외래키로 표시 대상을 고른다. 데이터가 커질수록 정렬과 윈도우 계산을 없앤 효과가
커질 가능성이 있지만, 그 효과는 운영 규모의 데이터로 다시 측정해야 한다.

44행과 서브밀리초 실행시간으로 처리량 개선을 일반화하지 않았다. 이번 결과에서
확인한 사실은 데이터 모델과 쿼리가 단순해졌고, 관측 실행시간은 줄었으며, 공유 버퍼
히트 수는 늘었다는 세 가지다.

## 7. 내가 틀렸던 가정

시작할 때 나는 이렇게 짐작했다.

> 옛 쿼리는 윈도우 함수 때문에 선로 필터가 CTE 안으로 못 들어간다. 그래서 선로가
> 많아지면 매번 전체 기준점을 훑을 것이다. 필터를 밖에서 안으로 밀어 넣는 게
> 이번 튜닝의 핵심이다.

실행계획은 예상과 달랐다.

```
->  WindowAgg (actual rows=33 loops=1)
      ->  Seq Scan on location_mapping lm
            Filter: (is_active AND (deleted_at IS NULL) AND (line_id IS NOT NULL)
                     AND (point_role = 'REFERENCE_POINT') AND (line_id = 1))
                                                            ^^^^^^^^^^^^^^^
```

측정한 환경에서 플래너는 단일 참조 CTE를 상위 쿼리와 함께 최적화했고 `line_id`
조건을 `WindowAgg` 아래의 스캔에 적용했다. `line_id`는 `PARTITION BY` 키이므로 특정
선로만 남겨도 그 선로 안에서 계산하는 `MIN/MAX`는 달라지지 않는다.

윈도우 함수가 있다고 모든 조건이 최적화 경계를 만드는 것은 아니다. 반대로 한
파티션 내부의 행을 제거하는 조건은 윈도우 결과를 바꿀 수 있으므로 같은 방식으로
내릴 수 없다. CTE가 여러 번 참조되거나 `MATERIALIZED`로 선언된 경우에도 조건을
밀어 넣는 방식이 달라진다.

기억한 규칙을 쿼리에 적용하기 전에 실제 실행계획에서 스캔 조건과 행 수를 확인해야
했다.

## 8. 튜닝하다 만든 버그

새 쿼리를 이렇게 썼었다.

```sql
JOIN fiber_line_node_type fnt
    ON fnt.id = lm.node_type_id
   AND fnt.deleted_at IS NULL     -- ← 여기
```

목록 조회에서 쓰던 소프트 삭제 조건을 그대로 붙였다.

운영자가 `접속함` 종류를 소프트 삭제하면 내부 조인이 해당 종류를 쓰던 노드 15개도
제거한다. 노드 데이터는 남아 있지만 도식에서는 사라진다.

이 시스템에서 카탈로그의 소프트 삭제는 두 동작을 구분해야 했다.

- 종류 선택 목록에서는 앞으로 고르지 못하게 한다.
- 기존 노드가 참조하는 종류와 도형은 계속 조회한다.

선택 목록을 만드는 카탈로그 쿼리에서만 `deleted_at IS NULL`을 적용했다. 도식을
그리는 쿼리는 외래키로 연결된 종류를 그대로 읽는다.

조건을 뺀 계획에서는 카탈로그 접근이 PK 인덱스 스캔으로 바뀌었다. 그러나 3행짜리
테이블에서는 순차 스캔과 인덱스 스캔의 비용 차이가 작고 통계에 따라 선택이 바뀔 수
있다. `deleted_at`이 PK 인덱스에 없다는 사실만으로 순차 스캔을 강제하는 것도 아니다.

따라서 실행계획 변화는 관측 결과로만 기록했다. 조건을 제거한 근거는 인덱스 사용이
아니라 소프트 삭제의 의미다.

## 9. 해보고 안 넣은 것

### `node_type_id IS NOT NULL` 중복 조건

`AND lm.node_type_id IS NOT NULL`을 `WHERE`에 추가하면 스캔 단계에서 33행을
17행으로 줄일 수 있었다.

```
버퍼 48 → 48 (동일)
실행시간 0.099ms → 0.081ms
```

버퍼 히트 수는 같았다. `0.018ms` 차이는 반복 측정과 분포 없이 효과라고 판단할 수
없는 크기다. 내부 조인이 이미 같은 조건을 보장하므로 중복 술어는 넣지 않았다.

### `(line_id, distance_m)` 복합 인덱스

`(line_id, distance_m)` 인덱스는 선로 필터와 거리 정렬에 맞고 다른 쿼리의
`MIN/MAX`에도 사용할 수 있다. 현재 44행에서는 플래너가 6회 버퍼 히트가 발생한
순차 스캔을 골랐다. 쓰기 비용과 관리할 인덱스만 늘어나는 상태라 추가하지 않았다.
데이터가 커지면 운영 분포와 실제 쿼리 묶음으로 다시 측정할 예정이다.

두 실험의 쿼리와 결과는 커밋 메시지에 남겼다. 같은 후보를 다시 검토할 때 이전
판단의 데이터 규모와 측정값을 확인할 수 있다.

## 10. 리팩터링을 증명하는 법

이번 변경은 데이터 모델을 바꾸되 조회 결과는 유지해야 했다. 행 수만 비교하면 같은
수의 다른 행을 반환하는 오류를 놓친다. 데이터베이스에서 두 결과를 직접 대조했다.

```sql
WITH old_q AS (...예전 쿼리...),
     new_q AS (...새 쿼리...)
SELECT (SELECT count(*) FROM old_q) AS old_count,
       (SELECT count(*) FROM new_q) AS new_count,
       (SELECT count(*)
          FROM (
              SELECT * FROM old_q
              EXCEPT ALL
              SELECT * FROM new_q
          ) d) AS only_in_old,
       (SELECT count(*)
          FROM (
              SELECT * FROM new_q
              EXCEPT ALL
              SELECT * FROM old_q
          ) d) AS only_in_new;
```

```
old_count | new_count | only_in_old | only_in_new
         17 |        17 |           0 |           0
```

차집합은 양방향으로 확인해야 한다. 한 방향만 검사하면 새 쿼리에만 있는 행을 놓친다.
여기서는 `EXCEPT` 대신 `EXCEPT ALL`을 사용했다. 일반 `EXCEPT`는 중복을 제거하므로
같은 행의 중복 횟수가 달라진 문제를 숨길 수 있다.

---

## 정리

이름으로 만든 관계를 외래키로 옮기면서 쿼리에서 유형을 추측하는 코드를 제거했다.
백필에는 기존 `CASE` 규칙을 사용했고, 행 수와 `EXCEPT ALL` 양방향 비교로 결과를
검증했다.

실행계획은 처음 예상한 병목이 실제 병목이 아니라고 알려 줬다. 새 쿼리의 관측
실행시간은 줄었지만 공유 버퍼 히트 수는 늘었다. 어느 한 숫자만 성능 점수로 사용하지
않고 노드별 행 수, 반복 횟수, 접근 방식을 함께 기록해야 판단을 재현할 수 있다.

소프트 삭제 조건은 성능보다 의미가 먼저였다. 선택 목록에서는 삭제된 종류를 숨기고,
기존 노드를 그릴 때는 참조 중인 종류를 유지한다. 같은 `deleted_at` 컬럼도 쿼리의
역할에 따라 다른 정책이 필요했다.

## 참고 자료

- [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL: EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL: WITH Queries](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL: Window Functions](https://www.postgresql.org/docs/current/tutorial-window.html)
