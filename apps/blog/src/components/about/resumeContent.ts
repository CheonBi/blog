import {activities, educations, employments} from '@/data/profile'
import type {Locale} from '@/utils/postPaths'

interface Job {
  company: string
  role: string
  period: string
  description: string
  contributions: string[]
  stack: string
  link?: {href: string; label: string}
}

interface Entry {
  period: string
  title: string
  // '/'로 시작하면 사이트 안 링크
  href?: string
  description: string
  honor?: string
}

interface Heading {
  title: string
  // 한국어 제목 옆에 붙는 영어 부제. 영어 페이지에서는 제목과 같아 생략한다.
  sub?: string
}

export interface ResumeContent {
  eyebrow: string
  title: string
  lead: string
  status: string
  expertise: {term: string; detail: string}[]
  navLabel: string
  sections: {id: string; label: string}[]
  experience: Heading & {note: string; jobs: Job[]}
  publications: Heading & {
    books: {title: string; role: string; subject: string; href: string}[]
    publisherLink: string
    writing: {
      eyebrow: string
      items: {title: string; href: string; note: string}[]
    }
  }
  openSource: Heading
  activities: Heading & {entries: Entry[]}
  education: Heading & {entries: Entry[]}
}

const ko: ResumeContent = {
  eyebrow: 'EXPERIENCE & CONTRIBUTIONS',
  title: '화면과 데이터를 연결하는 소프트웨어를 만듭니다.',
  lead: '관제 웹 서비스와 데이터 처리 시스템을 개발해 왔습니다. React와 TypeScript로 화면을 만들고 Java와 Spring Boot로 데이터 흐름을 연결합니다. 개발과 운영에서 얻은 판단을 이 블로그에 기록합니다.',
  status: 'Software Engineer, ENITT 재직 중',
  expertise: [
    {term: '웹 서비스', detail: 'React, TypeScript, JavaScript'},
    {term: '백엔드와 데이터', detail: 'Java, Spring Boot, 데이터 처리'},
    {term: '운영과 시각화', detail: '관제 시스템, Linux, 컨테이너'},
  ],
  navLabel: '이력서 목차',
  sections: [
    {id: 'experience', label: '경력'},
    {id: 'activities', label: '교육과 활동'},
    {id: 'education', label: '학력'},
  ],
  experience: {
    title: '경력',
    sub: 'Experience',
    note: '현재와 이전 직장에서의 개발 경험입니다.',
    jobs: employments.map((entry) => ({
      company: entry.organization,
      role: entry.title,
      period: entry.period,
      description: entry.role,
      contributions: entry.highlights,
      stack: entry.techStack.join(', '),
    })),
  },
  publications: {
    title: '저술',
    books: [],
    publisherLink: '',
    writing: {eyebrow: '', items: []},
  },
  openSource: {title: '오픈소스'},
  activities: {
    title: '교육과 활동',
    sub: 'Activities',
    entries: activities.map((entry) => ({
      period: entry.period,
      title: entry.title,
      description: `${entry.organization}. ${entry.role}`,
    })),
  },
  education: {
    title: '학력',
    sub: 'Education',
    entries: educations.map((entry) => ({
      period: entry.period,
      title: entry.title,
      description: entry.role,
    })),
  },
}

const en: ResumeContent = {
  ...ko,
  title: 'Software that connects interfaces and data',
  lead: 'I build monitoring web services and data processing systems with React, TypeScript, Java, and Spring Boot. This blog records the decisions and lessons from development and operations.',
  status: 'Software Engineer at ENITT',
  navLabel: 'Resume contents',
  sections: [
    {id: 'experience', label: 'Experience'},
    {id: 'activities', label: 'Training'},
    {id: 'education', label: 'Education'},
  ],
  experience: {
    ...ko.experience,
    title: 'Experience',
    sub: undefined,
    note: 'Roles and contributions. Detailed entries are available in Korean.',
  },
  activities: {
    ...ko.activities,
    title: 'Training and activities',
    sub: undefined,
  },
  education: {...ko.education, title: 'Education', sub: undefined},
}

export const resumeContent: Record<Locale, ResumeContent> = {ko, en}
