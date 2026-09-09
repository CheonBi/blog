import type {ReactNode} from 'react'

interface ExperienceTimelineProps {
  children?: ReactNode
}

interface ExperienceTimelineEntryProps {
  children?: ReactNode
  period?: string
  title: string
  last?: boolean
}

const markerClassName =
  'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-800'

const markerDotClassName = 'h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-500'

export function ExperienceTimeline({children}: ExperienceTimelineProps) {
  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700">
      {children}
    </ol>
  )
}

export function ExperienceTimelineEntry({
  children,
  period,
  title,
  last = false,
}: ExperienceTimelineEntryProps) {
  return (
    <li className={last ? 'ml-6' : 'mb-10 ml-6'}>
      <span className={markerClassName}>
        <span className={markerDotClassName} />
      </span>
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {period && (
        <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
          {period}
        </time>
      )}
      {children}
    </li>
  )
}
