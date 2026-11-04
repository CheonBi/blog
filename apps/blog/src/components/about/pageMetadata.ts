import {buildOgImageUrl} from '@yceffort/shared/utils'
import type {Metadata} from 'next'

import {SiteConfig} from '@/config'
import {openGraphBase} from '@/utils/metadata'
import {pathPrefixOf, type Locale} from '@/utils/postPaths'

const pages = {
  about: {
    title: 'About',
    description: {
      ko: `소프트웨어 엔지니어 ${SiteConfig.author.name}. React와 TypeScript, Java와 Spring Boot로 서비스를 만들며 개발과 운영에서 얻은 경험을 기록합니다.`,
      en: `${SiteConfig.author.name}, a software engineer building services with React, TypeScript, Java, and Spring Boot.`,
    },
  },
  resume: {
    title: 'Resume',
    description: {
      ko: `소프트웨어 엔지니어 ${SiteConfig.author.name}의 경력, 교육과 활동. 관제 시스템과 웹 서비스의 개발·운영 경험을 소개합니다.`,
      en: `Career, education, and training of software engineer ${SiteConfig.author.name}, including monitoring systems and web services.`,
    },
  },
}

// about과 resume은 한국어와 영어가 같은 구성이라 메타데이터를 한 곳에서 만든다
export function pageMetadata(
  page: keyof typeof pages,
  locale: Locale,
): Metadata {
  const {title, description} = pages[page]
  const path = `${pathPrefixOf(locale)}/${page}`
  return {
    title,
    description: description[locale],
    openGraph: {
      ...openGraphBase(locale),
      title,
      description: description[locale],
      url: `${SiteConfig.url}${path}`,
      images: [
        {
          url: buildOgImageUrl({
            title,
            description: description[locale],
            path,
            type: 'page',
          }),
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `${SiteConfig.url}${path}`,
      languages: {
        ko: `${SiteConfig.url}/${page}`,
        en: `${SiteConfig.url}/en/${page}`,
      },
    },
  }
}
