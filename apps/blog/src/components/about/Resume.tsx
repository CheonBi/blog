import {
  activities,
  employments,
  educations,
  type ResumeEntry,
} from '@/constants/resume'

import {ExperienceTimeline, ExperienceTimelineEntry} from './ExperienceTimeline'

function Experience({entry}: {entry: ResumeEntry}) {
  return (
    <ExperienceTimelineEntry
      title={`${entry.title}, ${entry.organization}`}
      period={entry.period}
    >
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          {entry.role}
        </p>
        {entry.highlights.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {entry.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
        {entry.techStack.length > 0 && (
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Tech Stack:</span>{' '}
            {entry.techStack.join(', ')}
          </p>
        )}
      </div>
    </ExperienceTimelineEntry>
  )
}

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
        <ExperienceTimeline>
          {employments.map((employment) => (
            <Experience key={employment.id} entry={employment} />
          ))}
        </ExperienceTimeline>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Education
        </h2>
        <ExperienceTimeline>
          <Experience key={educations[0].id} entry={educations[0]} />
        </ExperienceTimeline>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 md:p-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Activities
        </h2>
        <ExperienceTimeline>
          {activities.map((activity) => (
            <Experience key={activity.id} entry={activity} />
          ))}
        </ExperienceTimeline>
      </section>
    </div>
  )
}
