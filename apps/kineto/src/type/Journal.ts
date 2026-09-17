type JournalPage = {
  id: number
  title: string
}

type ContentProps = {
  pages: JournalPage[]
  titles: string[]
}

export type {JournalPage, ContentProps}
