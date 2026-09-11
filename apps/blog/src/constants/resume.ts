export interface ResumeEntry {
  id: string
  title: string
  organization: string
  period: string
  role: string
  highlights: string[]
  techStack: string[]
}

export const employments: ResumeEntry[] = [
  {
    id: 'enitt',
    title: 'Software Engineer',
    organization: 'ENITT',
    period: '2026.05 ~ 현재',
    role: '관제 Web Service 개발',
    highlights: [],
    techStack: [
      'Java',
      'Spring Boot',
      'JavaScript',
      'TypeScript',
      'React',
      'Figma',
    ],
  },
  {
    id: 'power21',
    title: 'Software Engineer',
    organization: '(주)파워이십일',
    period: '2022.01 ~ 2024.03',
    role: '한국전력공사 SCADA 시스템 유지관리 및 전력 데이터 기반 웹·데스크톱 소프트웨어 개발',
    highlights: [
      '실시간 전력계통 관성 모니터링 시스템의 풀스택',
      'amCharts 기반으로 5가지 실시간 전력 데이터와 과거 데이터를 조회하는 통합 대시보드 구현',
      'CSV 파일 기반 환경(None-RDB)에 맞춘 API 개발',
      'Java WatchService와 파일 크기 감지 로직을 활용한 파일 수집 및 JSON 변환 파이프라인 구현',
      '분산된 로직을 Vuex Store로 통합해 데이터 불일치를 해소하고 디버깅 시간을 약 60% 단축',
      '동적 Charset(BOM) 탐지로 CSV 인코딩 문제를 해결해 데이터 등록 시간을 30분에서 10초로 단축',
      '제주 HVDC 계통 유연성 평가 시스템의 UI/UX 및 데이터 시각화 개발 전담',
      'Java와 Eclipse RCP 기반 분석 환경에서 전력 해석 데이터를 시각화하는 커스텀 차트와 위젯 구현',
      'Eclipse RCP 3 환경에서 대용량 시계열 데이터를 안정적으로 처리하는 인터페이스 구현',
    ],
    techStack: [
      'Vue 3',
      'JavaScript',
      'amCharts',
      'Spring Boot',
      'Java 17',
      'Eclipse RCP',
      'TeeChart',
    ],
  },
]

export const educations: ResumeEntry[] = [
  {
    id: 'mokpo-university',
    title: '목포대학교',
    organization: '컴퓨터공학과',
    period: '2016.03 ~ 2022.02',
    role: '컴퓨터공학과 전공 학사 졸업 (151 학점, GPA 3.9 / 4.0)',
    highlights: [],
    techStack: [],
  },
]

export const activities: ResumeEntry[] = [
  {
    id: 'ssafy',
    title: 'SSAFY 12기',
    organization: '삼성청년 SW·AI 아카데미 (SSAFY) 수료',
    period: '2024.07 ~ 2025.07',
    role: '알고리즘·웹 개발 교육, 팀 프로젝트 수행',
    highlights: [],
    techStack: ['Java', 'Spring Boot', 'JavaScript', 'TypeScript', 'React'],
  },
]
