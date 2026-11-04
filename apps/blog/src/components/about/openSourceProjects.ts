import type {Locale} from '@/utils/postPaths'

interface OpenSourceProject {
  name: string
  tags: string[]
  href: string
  category: Record<Locale, string>
  description: Record<Locale, string>
}

export const openSourceProjects: OpenSourceProject[] = []
