import {ResumeTimeline, ResumeTimelineItem} from './ResumeTimeline'

export function Resume() {
  return (
    <div className="w-full space-y-8 pb-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Profile
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>
              <span className="font-semibold">생년월일:</span> 1997.11.29
            </li>
            <li>
              <span className="font-semibold">이메일:</span>{' '}
              <a
                href="mailto:root@cheonbi.kr"
                className="text-primary-600 hover:underline dark:text-primary-400"
              >
                root@cheonbi.kr
              </a>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Technical Focus
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'JavaScript',
              'TypeScript',
              'React',
              'Next.js',
              'Node.js',
              'Web Performance',
              'Design Systems',
              'Developer Tools',
              'Java',
              'Spring',
            ].map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Summary
        </h2>
        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
          Summary
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Employment History
        </h2>
        <ResumeTimeline>
          <ResumeTimelineItem title="ENITT" period="2022-2024">
            <div className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              <ul className="list-disc space-y-1 pl-5">
                <li>서비스 개발</li>
                <li>레거시 애플리케이션 업그레이드</li>
                <li>개발 및 운영</li>
                <li>서비스 전반을 풀스택으로 관리</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Tech Stack:</span> Angular,
              AngularJS, JavaScript, TypeScript, Ruby on Rails, MySQL, Redis
            </p>
          </ResumeTimelineItem>

          <ResumeTimelineItem title="파워이십일" period="2022-2024">
            <div className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              {' '}
              <ul className="list-disc space-y-1 pl-5">
                <li>서비스 개발</li>
                <li>레거시 애플리케이션 업그레이드</li>
                <li>개발 및 운영</li>
                <li>서비스 전반을 풀스택으로 관리</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Tech Stack:</span> Angular,
              AngularJS, JavaScript, TypeScript, Ruby on Rails, MySQL, Redis
            </p>
          </ResumeTimelineItem>
        </ResumeTimeline>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Education
        </h2>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Activities
        </h2>
      </section>
    </div>
  )
}
