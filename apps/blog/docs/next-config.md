# `next.config.ts` 설명

대상 파일: [`apps/blog/next.config.ts`](../next.config.ts)

Next.js는 Blog 앱을 실행하거나 빌드할 때 이 파일을 읽는다. 현재 파일은 React Compiler를 켜는 설정만 포함한다. 함수는 정의하지 않고, 타입을 붙인 설정 객체를 기본 export한다.

## 전체 코드

```ts
import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
}

export default nextConfig
```

## 구성 요소별 역할

| 코드                                      | 역할                                                                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `import type { NextConfig } from "next";` | Next.js가 제공하는 설정 타입을 TypeScript의 타입 검사에만 가져온다. `import type`이므로 실행 시점의 JavaScript import로 남지 않는다.           |
| `NextConfig`                              | `nextConfig` 객체에 허용되는 Next.js 설정 키와 각 값의 타입을 알려주는 타입이다. 잘못된 옵션명이나 값이 있으면 에디터와 TypeScript가 알려준다. |
| `const nextConfig`                        | 앱의 Next.js 설정을 담는 상수 객체다. `const`는 이 변수 자체를 다시 할당하지 못하게 하며, 객체 내부 옵션을 고정한다는 뜻은 아니다.             |
| `/* config options here */`               | create-next-app이 남긴 안내용 주석이다. 실행에는 영향을 주지 않는다.                                                                           |
| `reactCompiler: true`                     | React Compiler를 활성화한다. React 컴포넌트와 Hook 코드를 빌드 과정에서 분석·최적화해 불필요한 재렌더링을 줄이는 기능이다.                     |
| `export default nextConfig`               | 이 모듈의 기본 export로 설정 객체를 Next.js에 전달한다. Next.js는 이 export를 읽어 개발 서버와 빌드 동작을 구성한다.                           |

## 실행 흐름

```text
next dev / next build / next start
          │
          ▼
apps/blog/next.config.ts 로드
          │
          ├─ `NextConfig` 타입은 검사 후 실행 코드에서 제거
          └─ `nextConfig` 객체 생성
                    │
                    ▼
             Next.js가 기본 export를 읽음
                    │
                    ▼
       `reactCompiler: true`에 따라 React 코드 처리
```

1. `apps/blog`의 `package.json`에 정의된 `next dev`, `next build`, `next start` 명령이 Next.js를 실행한다.
2. Next.js는 Node.js 환경에서 앱 루트의 `next.config.ts`를 읽는다. 브라우저 번들에는 이 파일을 포함하지 않는다.
3. TypeScript는 `NextConfig`를 이용해 설정 객체를 검사한다. 타입은 실행 동작을 만들지 않는다.
4. Next.js는 `export default`로 전달된 객체를 설정으로 사용한다.
5. 개발 중 변환 또는 production build 과정에서 `reactCompiler: true`를 확인하고 React Compiler를 적용한다.
6. 최적화 결과는 빌드 산출물에 반영된다. 브라우저가 `next.config.ts`를 직접 읽거나 `reactCompiler` 값을 받는 방식은 아니다.

## `reactCompiler: true`가 하는 일

React Compiler는 컴포넌트의 렌더링 코드를 분석해 필요한 메모이제이션을 자동으로 적용한다. 컴포넌트에 `useMemo`, `useCallback`, `memo`를 직접 추가하는 작업을 줄일 수 있다.

이 옵션은 컴포넌트 코드의 빌드 최적화 범위를 정한다. 앱 전체를 한 번만 렌더링하지 않으며, 잘못된 Hook 사용이나 부수 효과를 수정하지도 않는다. `next.config.ts`와 일반 서버 설정 객체는 Compiler의 대상이 아니다. 컴포넌트의 상태와 props에 따른 렌더링은 계속 일어나므로, 렌더링 횟수가 항상 줄어든다고 보장할 수 없다.

`apps/blog`의 `SiteSearch`처럼 `useCallback`, `useMemo`, `useEffect`를 사용하는 React 코드를 Compiler가 분석할 수 있다. 기존 메모이제이션 코드는 실제 동작과 성능을 확인한 뒤 점진적으로 정리한다.

## 프로젝트 현재 상태

- `apps/blog/package.json`은 Next.js `^16.3.1`, React와 React DOM `^19.2.8`을 선언한다.
- 현재 lockfile은 Next.js `16.3.4`와 Next.js의 optional peer dependency인 `babel-plugin-react-compiler` `1.0.0`을 해석하고 있다. 이 Compiler 플러그인은 `apps/blog/package.json`에 직접 선언된 항목은 아니다.
- Next.js 16에서는 `reactCompiler` 옵션이 `experimental` 아래가 아닌 최상위의 안정적인 설정으로 승격되었다. 따라서 현재 코드의 다음 형태가 버전에 맞다.

  ```ts
  const nextConfig: NextConfig = {
    reactCompiler: true,
  }
  ```

- React Compiler를 활성화하면 Babel을 사용하는 과정 때문에 개발 및 production build 시간이 늘어날 수 있다. 배포 전에는 `pnpm --filter blog build`로 빌드 시간과 결과를 확인하는 것이 좋다.
- Compiler가 기대한 대로 동작하려면 React의 컴포넌트 및 Hook 규칙을 지키는 코드여야 한다.

## 설정을 추가할 때의 기본 형태

새 Next.js 옵션은 같은 객체 안에 최상위 속성으로 추가한다. 예를 들어 TypeScript 검사 설정을 추가하려면 다음처럼 작성할 수 있다.

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: false,
  },
}
```

단, 옵션을 추가할 때는 해당 Next.js 버전의 공식 설정 문서에서 지원 여부와 기본값을 확인해야 한다. `NextConfig` 타입이 통과시키더라도 실제 빌드 방식이나 배포 환경에 영향을 줄 수 있다.

## 참고 문서

- [Next.js 설정 파일 공식 문서](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [Next.js의 `reactCompiler` 옵션](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler)
- [Next.js 16 업그레이드 안내: React Compiler](https://nextjs.org/docs/app/guides/upgrading/version-16#react-compiler-support)
- [React Compiler 설치 안내](https://react.dev/learn/react-compiler/installation)
