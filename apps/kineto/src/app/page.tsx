import ContentWrap from '@/components/ContentWrap'
import {pages} from '@/utils/EmptyPages'
import {JOURNALS_PER_SCENE} from '@/utils/Layout'

import KinetographStudio from './KinetographStudio'

export default function Home() {
  const totalScenes = Math.ceil(pages.length / JOURNALS_PER_SCENE)

  return (
    <main className="journal-shell" id="top">
      <KinetographStudio totalIndex={totalScenes} />
      <ContentWrap />
    </main>
  )
}
