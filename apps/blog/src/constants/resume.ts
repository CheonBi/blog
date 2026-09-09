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
    id: 'ssafy-surfer',
    title: 'Frontend, Surfer',
    organization: '삼성청년 SW·AI 아카데미 (SSAFY)',
    period: '2025.04 ~ 2025.05',
    role: '분석 대시보드 UI 및 통합 배포 구조 설계',
    highlights: [
      '각 API 요청을 독립된 탭 세션으로 관리하는 다중 테스트 추적 인터페이스 구현',
      'Chart.js와 Polling을 연동해 응답 시간과 에러율을 1초 단위로 시각화',
      'Vite 결과물을 Spring Boot 정적 리소스에 복사하고 JAR 패키징까지 연결하는 Gradle Task 설계',
      '별도 설정 없이 웹 화면이 통합 서빙되는 프론트엔드·백엔드 통합 빌드 구조 구현',
      '서버 fallback과 리소스 핸들러를 구성해 SPA 직접 경로 접근 시 발생하는 404 해결',
      'PathResourceResolver 재정의로 정적 리소스와 클라이언트 라우트를 분리해 직접 접근과 새로고침 안정성 확보',
    ],
    techStack: [
      'React',
      'Tailwind CSS',
      'TypeScript',
      'Vite',
      'Chart.js',
      'Java',
      'Gradle',
    ],
  },
  {
    id: 'ssafy-myfairy',
    title: 'Frontend, MyFairy',
    organization: '삼성청년 SW·AI 아카데미 (SSAFY)',
    period: '2025.01 ~ 2025.02',
    role: '인증, 실시간 상태 동기화 및 스트리밍 개발',
    highlights: [
      '카카오 OAuth와 연동한 JWT 인증 상태 및 Axios 인터셉터 기반 토큰 갱신 흐름 구축',
      'Protected Layout을 적용해 인증 상태에 따른 사용자 접근 제어 구현',
      'STOMP와 WebSocket으로 4인 Room의 입장·준비·시작 Lifecycle 및 상태 동기화 구현',
      '입력 상태와 화면 상태를 분리해 수정된 스토리가 생성 단계까지 일관되게 전달되는 데이터 흐름 설계',
      'OpenVidu와 LiveKit을 활용해 사용자의 드로잉 과정을 다른 참여자에게 실시간 스트리밍',
      'HTML Canvas 기반 자체 드로잉 컴포넌트로 외부 라이브러리 의존성 제거',
      'forwardRef와 useImperativeHandle을 활용한 명령형 인터페이스로 게임 로직과 캔버스 기능 결합',
      '30FPS 더미 렌더링 Heartbeat를 도입해 입력 중단 시 스트리밍 화면이 정지하는 문제 해결',
    ],
    techStack: [
      'React',
      'Tailwind CSS',
      'JavaScript',
      'Vite',
      'STOMP',
      'OpenVidu',
      'LiveKit',
      'Zustand',
    ],
  },
]
