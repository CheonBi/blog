export function ResumeDetail() {
  return (
    <>
      <div className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <a
              href="https://together.kakao.com/"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              카카오 같이가치
            </a>{' '}
            서비스 개발
          </li>
          <li>AngularJS로 작성된 레거시 애플리케이션을 Angular로 업그레이드</li>
          <li>AngularJS 기반 관리자 어드민 개발 및 운영</li>
          <li>서비스 전반을 풀스택으로 관리</li>
        </ul>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Tech Stack:</span> Angular, AngularJS,
        JavaScript, TypeScript, Ruby on Rails, MySQL, Redis
      </p>
    </>
  )
}
