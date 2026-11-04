import * as stylex from '@stylexjs/stylex'

import {SiteConfig} from '@/config'
import type {Locale} from '@/utils/postPaths'

import '@/styles/reading.css'

const sx = stylex.create({
  container: {
    '@layer utilities': {
      paddingTop: 'calc(var(--spacing) * 8)',
      paddingBottom: 'calc(var(--spacing) * 8)',
      maxWidth: 'none',
      gridColumn: {
        default: null,
        '@media (width >= 80rem)': 'span 2 / span 2',
      },
    },
  },
})

export function AboutIntro({locale = 'ko'}: {locale?: Locale}) {
  return (
    <div className={stylex.props(sx.container).className}>
      <div className="markdown-body markdown-dark">
        {locale === 'en' ? (
          <>
            <p>
              I am {SiteConfig.author.name}, a software engineer. I build
              frontend and backend systems with React, TypeScript, Java, and
              Spring Boot.
            </p>
            <p>
              This blog records how React and Next.js work, web performance,
              data models, and lessons from running software. I break problems
              into smaller parts and write down the reasons behind decisions.
            </p>
            <h2>Topics</h2>
            <ul>
              <li>React and Next.js rendering and data flow</li>
              <li>Data models and backend architecture</li>
              <li>Web performance and bundle optimization</li>
              <li>JavaScript and TypeScript tools</li>
              <li>Linux servers and containers</li>
            </ul>
          </>
        ) : (
          <>
            <p>
              안녕하세요. 소프트웨어 엔지니어 {SiteConfig.author.name}입니다.
              React와 TypeScript로 화면을 만들고 Java와 Spring Boot로 데이터
              흐름을 연결합니다.
            </p>
            <p>
              이 블로그에는 React와 Next.js의 동작 원리, 웹 성능, JavaScript와
              TypeScript 도구, 백엔드 설계와 운영 경험을 기록합니다. 개인
              프로젝트를 만들면서 얻은 판단과 시행착오도 함께 정리합니다.
            </p>
            <p>
              문제를 작게 나누고 선택의 근거와 운영 중 발견한 문제를 글로
              남깁니다. 같은 문제를 다시 풀지 않도록 지식을 공유하는 일을
              중요하게 생각합니다.
            </p>
            <h2>다루는 주제</h2>
            <ul>
              <li>React와 Next.js의 렌더링·데이터 흐름</li>
              <li>데이터 모델과 백엔드 설계</li>
              <li>웹 성능 측정과 번들 최적화</li>
              <li>JavaScript·TypeScript 도구와 npm 패키지</li>
              <li>Linux Server와 컨테이너 운영</li>
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
