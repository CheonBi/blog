export function AboutIntro() {
  return (
    <div className="pt-8 pb-8 xl:col-span-2">
      <div className="prose max-w-none dark:prose-dark">
        <p>
          이 블로그에는 React와 Next.js의 동작 원리, 웹 성능, JavaScript와
          TypeScript 도구, 백엔드 설계와 운영 경험을 기록하며, 개인 프로젝트를
          만들면서 얻은 판단과 시행착오도 함께 정리합니다.
        </p>
        <p>
          문제를 작게 나누고, 선택의 근거와 운영 중 발견한 문제를 글로 남깁니다.
          코드를 작성하는 일과 같은 문제를 다시 풀지 않도록 지식을 공유하는 일을
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
      </div>
    </div>
  )
}
