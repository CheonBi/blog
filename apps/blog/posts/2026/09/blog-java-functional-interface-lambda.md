---
title: 람다는 어떻게 인터페이스가 되는가
tags:
  - java
published: true
date: 2026-09-09 17:54:34
description: 구현 클래스 없이 호출되는 함수형 인터페이스를 타깃 타입 추론부터 invokedynamic, 캡처, hidden class까지 따라간다.
---

## Table Of Contents

## 람다는 어떻게 인터페이스가 되는가: 필터 하나를 끝까지 따라가기

리팩토링을 하다 프로젝트 코드에서 이런 걸 만났다.

```java
@FunctionalInterface
private interface RowFilter {
    boolean matches(Row row);
}
```

`matches` 를 구현한 클래스는 코드 어디에도 없다. 그런데 호출부는 이렇게 생겼다.

```java
return nearest(distanceM, row -> row.name() != null);
```

**구현하지도 않은 `matches` 가 어떻게 호출되는가.** 이 질문 하나를 컴파일러와 바이트코드까지
내려가며 확인한 기록이다.

---

## 0. 문제의 코드

거리축 위 어떤 지점(예: 케이블 선로의 1,250m 지점)에 사고가 났을 때, 그 위치를 사람이 알아볼
수 있게 설명해야 한다. 기준점 목록에서 **가장 가까운 것**을 골라 "○○에서 약 199m" 라고
안내하는 식이다.

기준점을 고르는 규칙은 여러 가지다. 이름, 접속 설비명, 주소 유무를 각각 검사한다.
"가장 가까운 것 찾기" 라는 알고리즘은 하나인데 **후보 조건만 다르다.** 그래서 코드가 이렇게
생겼다.

```java
public final class NearestIndex {

    private final List<Row> rows;   // 거리 오름차순으로 정렬돼 있다

    /** 이름이 있는 가장 가까운 행 */
    private Row nearestNamed(double distanceM) {
        return nearest(distanceM, row -> row.name() != null);
    }

    /** 설비명이 비어 있지 않은 가장 가까운 행 */
    private Row nearestFacility(double distanceM) {
        return nearest(distanceM, row -> row.facility() != null && !row.facility().isBlank());
    }

    /** 조건에 맞는 행 중 거리 차가 가장 작은 것 */
    private Row nearest(double distanceM, RowFilter filter) {
        Row best = null;
        double bestGap = Double.MAX_VALUE;
        for (Row row : rows) {
            if (!filter.matches(row)) continue;          // ← 여기서 true/false 로 거른다
            double gap = Math.abs(row.distanceM() - distanceM);
            if (gap < bestGap) { best = row; bestGap = gap; }
        }
        return best;
    }

    @FunctionalInterface
    private interface RowFilter {
        boolean matches(Row row);
    }
}
```

`filter.matches(row)` 가 `true` 면 후보로 두고, `false` 면 건너뛴다. 반환형이 `boolean` 이니
필터의 동작은 그것뿐이다. **"무엇을 후보로 볼지" 만 주입하고 탐색 로직은 한 벌만 유지하는
구조**다. 전략 패턴의 최소 형태에 가깝다.

---

## 1. `matches` 를 구현하지 않았는데 왜 동작하나

### 이름으로 찾는 게 아니다

컴파일러는 람다를 보고 "이건 `matches` 구현이겠지" 라고 추측하지 않는다. **후보가 하나뿐이라
확정한다.**

1. `nearest(...)` 의 두 번째 파라미터 타입이 `RowFilter` 임을 읽는다
2. `RowFilter` 의 **추상 메서드를 센다 → 딱 하나**
3. 하나뿐이므로 후보가 유일하다 → 그 메서드의 구현으로 확정
4. 람다의 파라미터·반환형이 `(Row) → boolean` 과 맞는지 검사한다

이 유일한 추상 메서드를 **함수 서술자(function descriptor)** 라고 한다. 이름은 검사에 쓰이지
않는다.

### 실험: 이름을 바꿔도 같은 람다가 동작한다

```java
@FunctionalInterface interface RowFilter      { boolean matches(Row row); }
                     interface 이름이달라도된다 { boolean 아무거나(Row row); }

static Row first(List<Row> rows, RowFilter f) {
    for (Row r : rows) if (f.matches(r)) return r;      // matches 로 호출
    return null;
}
static Row first2(List<Row> rows, 이름이달라도된다 f) {
    for (Row r : rows) if (f.아무거나(r)) return r;      // 아무거나 로 호출
    return null;
}
```

```
matches 로 순회  : Row[name=A지점]
아무거나 로 순회 : Row[name=A지점]
```

같은 람다 `row -> row.name() != null` 인데 인터페이스에 따라 다른 이름으로 호출된다.

### 실험: 추상 메서드가 둘이면 즉시 깨진다

```java
@FunctionalInterface
interface RowFilter {
    boolean matches(Row row);
    boolean somethingElse(Row row);   // 하나 더
}
```

```
error: Unexpected @FunctionalInterface annotation
  RowFilter is not a functional interface
    multiple non-overriding abstract methods found in interface RowFilter
error: incompatible types: RowFilter is not a functional interface
```

**"어느 메서드를 구현하라는 것인지 알 수 없다"** 가 그대로 에러가 된다.

---

## 2. 파라미터가 `RowFilter` 인지는 어떻게 아나

**메서드 선언에 적혀 있다.** 추론이 아니다.

```java
//                          ↓ 여기
private Row nearest(double distanceM, RowFilter filter) { ... }

nearest(distanceM, row -> row.name() != null);
//                 └─ 2번째 인자 자리 → 타깃 타입 = RowFilter
```

### 방향이 반대다

|                               | 타입을 누가 정하나                                                     |
| ----------------------------- | ---------------------------------------------------------------------- |
| 일반 값 `nearest(150.0, ...)` | **값이 타입을 갖고** 있고(`double`) 파라미터와 맞는지 검사             |
| 람다 `row -> ...`             | **자기 타입이 없다.** 파라미터 선언에서 타입을 **받아** 그 타입이 된다 |

람다는 타입을 *제공*하지 않고 _받는다_. 그래서 타깃 타입이 없는 자리에서는 아예 쓸 수 없다.

```java
var f = row -> row != null;       // error: cannot infer type for local variable f
Object o = row -> row != null;    // error: Object is not a functional interface

static void run(RowFilter f) {}
static void run(OtherFilter f) {} // 후보가 둘
run(row -> true);                 // error: reference to run is ambiguous
```

세 번째 예제에서 후보가 둘이 되자 컴파일러는 타깃 타입을 정하지 못한다. "람다를
보고 알아내는" 게 아니라 "파라미터 선언이 하나로 정해져야 알 수 있다" 는 뜻이다.

### 람다 파라미터의 타입도 여기서 내려온다

```java
row -> row.name() != null
//     ↑ row 에 타입을 안 적었는데 Row 의 메서드를 부를 수 있는 이유
```

타깃 타입 → 함수 서술자 `boolean matches(Row row)` → **그 파라미터 타입이 람다의 `row` 에
주입**된다. `(Row row) -> ...` 라고 적어도 되지만 중복이다.

---

## 3. 그럼 아무거나 들어가나? 아니다

```java
first(rows, "문자열");                  // (1)
first(rows, 42);                        // (2)
first(rows, new Object());              // (3)
first(rows, () -> true);                // (4) 파라미터 개수 불일치
first(rows, (String s) -> true);        // (5) 파라미터 타입 불일치
first(rows, row -> "문자열");           // (6) 반환형 불일치
first(rows, row -> row.name() != null); // (7) 통과
```

```
(1) error: incompatible types: String cannot be converted to RowFilter
(2) error: incompatible types: int cannot be converted to RowFilter
(3) error: incompatible types: Object cannot be converted to RowFilter
(4) error: incompatible types: incompatible parameter types in lambda expression
(5) error: incompatible types: incompatible parameter types in lambda expression
(6) error: bad return type in lambda expression
6 errors
```

7개 중 6개가 컴파일 에러다. 규칙은 두 갈래다.

| 넘긴 것                 | 검사 방식                                                    |
| ----------------------- | ------------------------------------------------------------ |
| **이미 타입이 있는 값** | 대입 호환성: 그 값의 타입이 `RowFilter` 이거나 하위 타입인가 |
| **람다 / 메서드 참조**  | 모양 검사: 파라미터 개수·타입·반환형이 함수 서술자와 맞는가  |

`double d = "문자열"` 이 막히는 것과 `RowFilter f = "문자열"` 이 막히는 것은 같은 강도다.

### 모양이 같아도 이름이 다르면 거부한다

```java
@FunctionalInterface interface RowFilter   { boolean matches(Row row); }
@FunctionalInterface interface OtherFilter { boolean matches(Row row); }  // 완전히 동일

RowFilter   a = row -> row.name() != null;
OtherFilter b = a;
```

```
error: incompatible types: RowFilter cannot be converted to OtherFilter
```

자바는 **명목적 타이핑(nominal typing)** 을 쓴다. 람다 표현식은 아직 고정된
타입이 없으므로 `OtherFilter c = row -> ...` 처럼 다시 쓰면 된다. 하지만 **이미 타입을 가진 값**은
못 옮긴다.

---

## 4. `@FunctionalInterface` 는 필수가 아니다

```java
interface NoAnno { boolean 아무거나(Row row); }   // 애노테이션 없음
NoAnno c = row -> row.name() != null;             // 그래도 된다
```

람다를 쓸 수 있게 하는 건 **"추상 메서드가 하나" 라는 사실 그 자체**다. 애노테이션은 그 사실이
유지되는지 컴파일러에게 검사를 **요청**하는 표시다. 붙여 두면 메서드를 하나 더 추가한 순간
**인터페이스 선언 지점**에서 에러가 난다. 없으면 람다 호출부에서만 에러가 나서 원인이 멀리
보인다.

---

## 5. `Object` 의 메서드는 세지 않는다

```java
@FunctionalInterface
interface WithObjectMethods {
    boolean matches(Row row);
    @Override boolean equals(Object other);   // 추상인데도 함수형 자격 유지
    @Override String toString();
    default boolean not(Row row) { return !matches(row); }   // default 는 안 센다
    static WithObjectMethods any() { return row -> true; }   // static 도 안 센다
}
```

컴파일된다. 표준 `Comparator`도 이 구조를 쓴다. 추상 메서드가 `compare`와 `equals`
**2개**인데도 함수형 인터페이스다. `equals` 는 어차피 `Object` 가 구현하므로 람다가 채울
필요가 없어 후보에서 빠진다.

즉 **"추상 메서드 하나" 의 정확한 뜻은 "람다가 채워야 할 메서드가 하나"** 다.

---

## 6. 컴파일하면 무엇이 남나

`javap -p -c` 로 뜬 실제 바이트코드다.

```
private Row nearestNamed(double);
   0: aload_0                              // this
   1: dload_1                              // distanceM
   2: invokedynamic #0:matches:()RowFilter  // ← 필터 인스턴스를 여기서 얻는다
   7: invokevirtual nearest:(D,RowFilter)Row
  10: areturn

private static boolean lambda$nearestNamed$0(Row);   // ← 람다 본문
```

`javap -v` 의 `BootstrapMethods` 는 이렇게 생겼다.

```
REF_invokeStatic java/lang/invoke/LambdaMetafactory.metafactory:(...)CallSite
REF_invokeStatic NearestIndex.lambda$nearestNamed$0:(Row)Z
```

읽히는 것이 셋이다.

1. 이 예제를 `javac`로 컴파일하면 **람다 본문이 `private static` 합성 메서드**로 나온다
   (`lambda$nearestNamed$0`). 본문이 `this`를 쓰지 않고 파라미터 `row`만 보기 때문에
   `javac`가 정적 메서드로 옮길 수 있다.
2. **`invokedynamic` 의 시그니처가 `()RowFilter`**이고 인자가 **없다.** **캡처가 없다**는
   증거다. 외부 변수를 잡으면 `(I)RowFilter` 처럼 인자가 붙는다.
3. 부트스트랩이 `LambdaMetafactory.metafactory(...)` 다.

### 실행 순서

| 시점          | 무슨 일                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **최초 실행** | `invokedynamic` 호출 지점을 `LambdaMetafactory` 가 연결한다. 이 과정에서 `RowFilter` 구현체를 만드는 방법이 결정된다         |
| **이후 실행** | 캡처가 없는 람다는 같은 인스턴스를 재사용할 수 있다. HotSpot은 보통 재사용하지만 Java 명세가 객체 동일성을 보장하지는 않는다 |
| `nearest` 안  | `invokeinterface RowFilter.matches(row)Z` → 생성된 클래스가 `lambda$nearestNamed$0(row)` 로 위임                             |

### 캡처란 무엇인가

람다 본문이 **람다 밖에 선언된 값**을 나중에도 사용하도록 함께 보관하는 일을 캡처라고 한다.
람다의 매개변수와 람다 본문 안에서 선언한 변수는 캡처 대상이 아니다.

```java
RowFilter make(double limit) {
    String unit = "m";

    return row -> {
        double distance = row.distanceM(); // distance: 람다 내부 지역변수
        System.out.println(unit);           // unit: 바깥 지역변수 캡처
        return distance > limit;            // limit: 메서드 매개변수 캡처
    };
}
```

`make(100.0)` 호출이 끝나면 원래 스택 프레임의 `limit`와 `unit`도 사라진다. 그런데 반환된
`RowFilter`는 그 뒤에 호출될 수 있다. JVM은 람다가 필요한 `100.0`과 `"m"`을 람다 객체가
사용할 수 있는 형태로 넘겨 보관한다. 바이트코드의 호출 지점이
`(double, String)RowFilter`처럼 보이는 이유다.

지역변수와 메서드 매개변수는 `final`이거나 **effectively final**이어야 캡처할 수 있다.
effectively final은 `final`을 쓰지 않았어도 초기화 후 다른 값을 다시 대입하지 않았다는 뜻이다.

```java
double limit = 100.0;
RowFilter ok = row -> row.distanceM() > limit; // 가능

limit = 200.0;
// 위 람다와 재대입을 함께 두면 컴파일 오류: limit은 effectively final이 아니다.
```

람다는 지역변수가 이후에 바뀌는 모습을 공유하지 않는다. 생성 시점의 **값**을 가져간다.
참조형 변수라면 객체를 복사하는 것이 아니라 참조값을 복사하므로, 참조가 가리키는 객체의
상태는 바꿀 수 있다.

```java
List<String> names = new ArrayList<>();
Runnable r = () -> names.add("A"); // 가능: names에 다른 참조를 재대입하지 않음

names = new ArrayList<>();         // 함께 사용하면 컴파일 오류
```

필드는 규칙이 다르다. 필드는 지역변수처럼 복사해서 캡처하지 않고 해당 객체를 통해 읽는다.
인스턴스 필드를 사용하면 람다는 감싸는 객체인 `this`에 접근해야 하므로, 구현 관점에서는
`this`를 캡처한 셈이다. 필드 자체에는 effectively final 제한이 없다.

```java
private double limit = 100.0;

RowFilter make() {
    return row -> row.distanceM() > this.limit;
}
```

따라서 `make()`로 필터를 만든 뒤 `limit`을 바꾸면 필터도 바뀐 값을 읽는다. 지역변수 캡처와
인스턴스 필드 접근을 구분해야 하는 이유가 여기에 있다.

### 캡처 유무와 객체 할당

```java
static RowFilter make() { return row -> row.name() != null; }   // 캡처 없음

make() == make()   // HotSpot에서는 흔히 true. 명세상 결과를 전제로 하면 안 된다
```

캡처가 없는 람다는 실행할 때 함께 저장할 값이 없다. JVM은 이런 람다의 인스턴스를 호출 지점별로
재사용할 수 있고, HotSpot도 보통 그렇게 최적화한다. 반대로

```java
nearest(distanceM, row -> row.distanceM() > 어떤지역변수)   // 캡처 있음
```

는 지역변수를 함께 보관해야 한다. HotSpot에서는 보통 평가할 때 인스턴스가 필요하므로 루프 안의
캡처 람다는 할당 비용 후보가 된다. 다만 JIT가 인라이닝과 탈출 분석으로 할당을 없앨 수도 있다.
람다의 `==`, 객체 잠금, `System.identityHashCode`에 기대지 말고, 성능이 중요한 경로는 JMH와
프로파일러로 확인해야 한다.

---

## 7. 런타임에 만들어지는 클래스

```java
RowFilter f = row -> row.name() != null;

f.getClass()                      // class Demo$$Lambda$248/0x00007f3e6c153000
f.getClass().getInterfaces()      // [interface Demo$RowFilter]
f.getClass().getSuperclass()      // class java.lang.Object
f.getClass().isHidden()           // true
f instanceof RowFilter            // true
```

위 결과는 현재 HotSpot에서 관찰한 구현이다. `LambdaMetafactory`가 `RowFilter`를 구현하는
**hidden class**를 만들었지만, Java 언어 명세가 모든 JVM에 이 구현 방식을 강제하는 것은
아니다.

|               | 일반 클래스          | 람다의 클래스                    |
| ------------- | -------------------- | -------------------------------- |
| 클래스 파일   | 디스크에 존재        | **없음** (메모리에서 생성)       |
| 이름          | `MyFilter`           | `Demo$$Lambda$248/0x00007f3e...` |
| 이름으로 탐색 | `Class.forName` 가능 | **불가능**                       |

`/0x...` 접미사가 hidden class 의 표식이다. `Class.forName("Demo$$Lambda$248")` 은 실패한다.

람다 객체도 자바의 타입 체계 안에 있다. `instanceof
RowFilter` 가 `true` 이고, `new MyFilter()` 로 만든 객체와 **런타임 지위가 동일하다.** 문법만
짧다.

그리고 `RowFilter` 자체도 특별하지 않다. `javap -v` 로 뜬 클래스 파일은 이렇다.

```
interface Demo$RowFilter
  flags: (0x0600) ACC_INTERFACE, ACC_ABSTRACT     ← 그 이상 없음

  public abstract boolean matches(Demo$Row);

RuntimeVisibleAnnotations:
    java.lang.FunctionalInterface                  ← 그냥 애노테이션 한 개
```

JVM에 "함수형 인터페이스" 라는 개념은 **없다.** `ACC_FUNCTIONAL` 같은 플래그도 없다.
**추상 메서드가 하나인 평범한 인터페이스에 컴파일러가 붙이는 성질**일 뿐이다.

---

## 8. 람다 없이 쓰면

같은 동작을 만드는 세 가지를 컴파일·실행해 비교했다.

### A. 익명 클래스: 가장 직역적인 표현

```java
private Row nearestNamed(double distanceM) {
    return nearest(distanceM, new RowFilter() {
        @Override
        public boolean matches(Row row) {
            return row.name() != null;
        }
    });
}
```

### B. 이름 붙인 클래스 + 상수: 인스턴스 재사용까지 재현하려면

```java
private static final RowFilter NAMED = new NamedFilter();

private static final class NamedFilter implements RowFilter {
    @Override
    public boolean matches(Row row) {
        return row.name() != null;
    }
}

private Row nearestNamed(double distanceM) {
    return nearest(distanceM, NAMED);
}
```

### C. 인터페이스 없이 루프 복사: 람다 이전에 흔했던 선택

```java
private Row nearestNamed(double distanceM) {
    Row best = null;
    double bestGap = Double.MAX_VALUE;
    for (Row row : rows) {
        if (row.name() == null) continue;
        double gap = Math.abs(row.distanceM() - distanceM);
        if (gap < bestGap) { best = row; bestGap = gap; }
    }
    return best;
}
// nearestFacility 도 같은 루프를 조건만 바꿔 복사
```

### 비교

|                     | 람다              | A 익명            | B 이름 클래스   | C 루프 복사    |
| ------------------- | ----------------- | ----------------- | --------------- | -------------- |
| 필터 2개 코드       | **11줄**          | 20줄              | 24줄            | 22줄           |
| 클래스 파일         | **0개**           | 2개 (`$1`, `$2`)  | 2개             | 0개            |
| 인스턴스            | JVM이 재사용 가능 | **호출마다 새로** | 상수 1개        | 없음           |
| 조건이 보이는 위치  | 쓰는 자리         | 쓰는 자리         | **떨어져 있음** | 쓰는 자리      |
| 조건 하나 추가 비용 | 한 줄             | 한 줄             | **클래스 하나** | 루프 하나 복사 |
| 탐색 로직           | 1벌               | 1벌               | 1벌             | **2벌**        |

실제로 컴파일해 보면 클래스 파일이 이렇게 남는다.

```
Demo$1.class                  ← A의 익명
Demo$2.class                  ← 또 다른 익명
Demo$NamedFilter.class        ← B
Demo$FacilityFilter.class     ← B
Demo$RowFilter.class          ← 인터페이스 (어느 방식이든 필요)
```

람다 두 개는 **클래스 파일이 없다.**

**람다가 없앤 것은 "구현체를 어딘가에 선언하는 일"** 이다. `nearest` 라는 공통 루프는 세 방식
모두 그대로 쓸 수 있으니, 람다가 없앤 건 탐색 로직 중복이 아니라 **선언 보일러플레이트**다.

---

## 9. 익명 클래스와 람다의 실제 차이 세 가지

`new RowFilter() { ... }` 와 `row -> ...` 는 "거의" 같지만 셋이 다르다.

### ① 클래스 파일이 생기지 않는다

익명 클래스는 컴파일 시점에 `$1`, `$2` 로 디스크에 만들어진다. 람다는 런타임 hidden class 라
남지 않는다. 익명 클래스를 남발하면 클래스 파일 수가 늘어 로딩 비용이 붙는다.

### ② 인스턴스를 재사용할 수 있다

```java
anonAgain() == anonAgain()     // false: new 표현식은 매번 새 객체
lambdaAgain() == lambdaAgain() // 흔히 true지만 Java 명세의 보장은 아님
```

익명 클래스의 `new`는 새 인스턴스를 만들도록 명세에 적혀 있다. 람다 평가는 기존 인스턴스를
돌려줄 수도, 새 인스턴스를 만들 수도 있다. 람다를 값 객체처럼 비교하거나 락으로 쓰면 안 된다.

### ③ `this` 의 의미가 다르다

```java
private final String tag = "감싸는 객체";

RowFilter viaAnonymous() {
    return new RowFilter() {
        @Override public boolean matches(Row row) {
            System.out.println(this.getClass().getSimpleName()); // "": 익명 클래스 자신
            System.out.println(Demo.this.tag);                   // "감싸는 객체"
            return true;
        }
    };
}

RowFilter viaLambda() {
    return row -> {
        System.out.println(this.getClass().getSimpleName()); // "Demo": 감싸는 객체
        System.out.println(this.tag);                        // "감싸는 객체"
        return true;
    };
}
```

```
viaAnonymous 실행 결과:
                 ← 첫 줄은 빈 문자열: 익명 클래스에는 단순 이름이 없음
감싸는 객체

viaLambda 실행 결과:
Demo
감싸는 객체
```

익명 클래스 선언은 실제 객체의 클래스 본문을 만든다. 그 안의 `this`는 새로 만든 익명
`RowFilter` 객체다. `getSimpleName()`이 빈 문자열인 것은 `this`가 없어서가 아니라 익명
클래스에 단순 이름(simple name)이 없기 때문이다. 감싸는 `Demo` 객체를 가리키려면
`Demo.this`, 그 필드를 읽으려면 `Demo.this.tag`라고 쓴다.

람다는 새로운 `this`를 선언하지 않는다. 람다 안의 `this`와 `super`, 한정하지 않은 필드·메서드
이름은 람다가 놓인 바깥 문맥과 같은 뜻으로 해석된다. 이를 **어휘적 스코핑(lexical scoping)**
또는 `this`에 대해 투명하다고 표현한다.

```java
private final String tag = "감싸는 객체";

RowFilter viaLambda() {
    return row -> {
        System.out.println(this == Demo.this); // true
        System.out.println(tag);               // this.tag와 같은 뜻
        System.out.println(toString());        // this.toString()과 같은 뜻
        return true;
    };
}
```

“람다는 스코프를 만들지 않는다”라고만 외우면 오해가 생긴다. 람다 매개변수와 블록 안의
지역변수에는 각자의 스코프가 있다. 정확한 표현은 **람다가 별도의 `this` 바인딩을 만들지
않는다**이다.

```java
void example() {
    int outer = 1;

    RowFilter f = row -> {
        int inner = 2;  // 람다 블록 안에서만 유효
        return row.distanceM() > outer + inner;
    };
}
```

정적 메서드 안에서는 바깥 문맥에도 `this`가 없으므로 람다 안에서 `this`를 쓰면 컴파일 오류가
난다. 반면 익명 클래스는 정적 메서드 안에서 만들어도 익명 객체 자신의 `this`를 가진다.

```java
static RowFilter lambdaInStaticMethod() {
    return row -> this.tag != null; // 컴파일 오류: static 문맥에는 this가 없음
}

static RowFilter anonymousInStaticMethod() {
    return new RowFilter() {
        @Override public boolean matches(Row row) {
            return this != null;    // 가능: this는 익명 RowFilter 객체
        }
    };
}
```

`javac`는 람다 본문을 합성 메서드로 옮길 수 있다. 이 문서에서 확인한 바이트코드에서는 `this`를
쓰지 않는 본문이 `static` 합성 메서드가 되었고, `this`를 쓰는 본문은 인스턴스 합성 메서드가
되었다. 이것은 관찰한 컴파일 결과이지 `this`의 의미를 정하는 언어 규칙은 아니다. 의미는 먼저
Java 언어 명세가 정하고, 컴파일러는 그 의미를 지키는 범위에서 다른 방식으로 구현할 수 있다.

---

## 정리

- `RowFilter` 는 **추상 메서드가 하나뿐인 평범한 인터페이스**다. JVM에 "함수형" 이라는 타입
  종류는 없다.
- 컴파일러는 **파라미터에 적힌 타입**을 읽고, 그 타입의 추상 메서드가 하나이므로 람다를 그
  메서드의 구현으로 해석한다. **메서드 이름은 무관**하고 **타입 이름은 정확히 일치**해야 한다.
- 람다는 값이 아니라 **"이 인터페이스의 구현체를 만들어라" 는 명령**이다. 그래서 타깃 타입이
  없는 자리에서는 쓸 수 없다.
- 타입 검사는 느슨하지 않다. `String`·`int`·`Object`·모양이 다른 람다 전부 거부된다.
- 이 문서의 `javac` 컴파일 결과는 `invokedynamic` + `private static` 합성 메서드이고,
  HotSpot은 런타임에 `LambdaMetafactory`를 통해 해당 인터페이스를 구현하는 hidden class를
  만든다. Java 언어 명세는 이 구현 형태까지 강제하지 않는다.
- **캡처가 없으면 JVM이 인스턴스를 재사용하기 쉽다.** 객체 동일성은 명세가 보장하지 않는다.
- 반환형이 `boolean` 이니 필터가 하는 일은 `true`/`false` 하나다. `if (!filter.matches(row))
continue;`가 조건 주입을 실행한다.

처음의 질문으로 돌아가면 **`matches` 를 구현한 클래스는 있다.** 우리가 적지 않았고,
컴파일러와 JVM이 대신 적어 줬을 뿐이다.

## 참고 자료

- [Java Language Specification 9.8: Functional Interfaces](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8)
- [Java Language Specification 15.27.2: Lambda Body](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.2)
- [Java Language Specification 15.27.4: Run-Time Evaluation of Lambda Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.4)
- [Java Language Specification 4.12.4: final Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4)
- [Java API: LambdaMetafactory](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/invoke/LambdaMetafactory.html)
