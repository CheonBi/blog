import * as stylex from '@stylexjs/stylex'

import {SiteConfig} from '@/config'
import type {Locale} from '@/utils/postPaths'

import '@/styles/reading.css'

const sx = stylex.create({
  div: {
    '@layer utilities': {
      paddingTop: 'calc(var(--spacing) * 8)',
      paddingBottom: 'calc(var(--spacing) * 8)',
      gridColumn: {
        default: null,
        '@media (width >= 80rem)': 'span 2 / span 2',
      },
    },
  },
  div2: {
    '@layer utilities': {
      maxWidth: 'none',
    },
  },
})

export function AboutIntro({locale = 'ko'}: {locale?: Locale}) {
  return (
    <div className={stylex.props(sx.div).className}>
      <div
        className={`markdown-body markdown-dark ${stylex.props(sx.div2).className}`}
      >
        {locale === 'en' ? <IntroEn /> : <IntroKo />}
      </div>
    </div>
  )
}

function IntroKo() {
  return (
    <>
      <p>
        안녕하세요. 소프트웨어 엔지니어 {SiteConfig.author.name}입니다. 다양한
        분야의 소프트웨어를 개발하는 것에 관심이 많습니다. 지금은 웹 서비스를
        개발하며 프론트엔드 쪽에 관심을 두고 있습니다. 사람들이 직접 보고
        사용하는 부분인 만큼, 보기 편하고 쓰기 쉬운 게 중요하다고 생각합니다.
        코드도 읽기 쉽게 정리하고, 나중에 확장하기 편하게 만드는 걸 좋아합니다.
        함께 일하는 사람이 코드를 이해하고 이어서 작업하기 쉽도록, 구현한 이유를
        나누고 서로의 의견을 듣는 것도 중요하게 생각합니다.
      </p>
      <p>
        이 블로그에는 개발하다가 알게 된 내용이나 막혔던 문제를 해결한 과정,
        공부한 것을 정리합니다. 프론트엔드부터 백엔드와 운영까지, 코드와
        데이터가 어떻게 움직이는지와 성능 문제가 생기는 이유를 살펴보고
        싶습니다. 좌표와 거리 계산처럼 개발하면서 만나는 수학적인 내용도 직접
        계산하고 코드로 옮겨 보며 이해한 대로 풀어 쓰려 합니다. 어떤 방법을
        골랐고 어디에서 막혔는지, 팀에서 나눈 고민과 시행착오도 함께 남기고
        싶습니다.
      </p>
    </>
  )
}

function IntroEn() {
  return (
    <>
      <p>
        Hi, I am {SiteConfig.author.name}, a software engineer interested in
        building software in different fields. I currently work on web services,
        with a particular interest in frontend development. I think interfaces
        should be clear and easy to use, and I like code that is easy to read
        and extend. I also value explaining why I chose an approach and
        listening to teammates, so that we can understand the code and keep
        working on it together.
      </p>
      <p>
        On this blog, I write about what I learn and the problems I work
        through. I want to explore how code and data flow through frontend and
        backend systems, including the causes of performance problems and
        lessons from operations. I also want to understand the math that comes
        up in development, such as coordinates and distance calculations, by
        working through examples and implementing them. Along the way, I hope to
        share the approaches I choose, where I get stuck, and what I learn from
        discussions with teammates.
      </p>
    </>
  )
}
