'use client'

import dynamic from 'next/dynamic'

import * as tagsStyles from '@/app/tags/tags.styles'
import * as aboutStyles from '@/components/about/about.styles'
import LoadTraceShell from '@/components/about/LoadTraceShell'
import * as heroStyles from '@/components/home/hero.styles'
import {SiteConfig} from '@/config'
import {useLocale} from '@/hooks/useLocale'

const intro = {
  ko: {
    sub: 'React와 TypeScript, Java와 Spring Boot로 관제 웹 서비스와 데이터 처리 시스템을 만듭니다. 개발 과정의 선택과 시행착오를 기록합니다.',
  },
  en: {
    sub: 'I build monitoring web services and data processing systems with React, TypeScript, Java, and Spring Boot, and record the decisions and lessons along the way.',
  },
}

// WebGL과 Performance API는 브라우저에서만 쓸 수 있다. 그 전까지 같은 크기의 셸로 자리를 잡는다.
const LoadTrace = dynamic(() => import('@/components/about/LoadTrace'), {
  ssr: false,
  loading: LoadTraceShell,
})
export function AboutHero() {
  const {sub} = intro[useLocale().locale === 'en' ? 'en' : 'ko']
  return (
    <section className={`about-hero ${aboutStyles.about_hero}`}>
      <div>
        <div className={`hero-eyebrow ${heroStyles.hero_eyebrow}`}>
          <span className={`dot ${heroStyles.dot}`} />
          {SiteConfig.author.bio.toUpperCase()}
        </div>
        <h1 className={aboutStyles.about_title}>{SiteConfig.author.name}.</h1>
        <p className={`page-sub ${tagsStyles.page_sub}`}>{sub}</p>
        <div className={`about-socials ${aboutStyles.about_socials}`}>
          <a
            href={`mailto:${SiteConfig.author.contacts.email}`}
            className={aboutStyles.about_social_link}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16v16H4z" />
              <path d="m4 4 8 8 8-8" />
            </svg>
            {SiteConfig.author.contacts.email}
          </a>
          <a
            href={SiteConfig.author.contacts.github}
            target="_blank"
            rel="noopener noreferrer"
            className={aboutStyles.about_social_link}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {SiteConfig.author.name}
          </a>
        </div>
      </div>
      <LoadTrace />
    </section>
  )
}
