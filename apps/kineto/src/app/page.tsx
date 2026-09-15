import ContentWrap from '@/components/ContentWrap'

import KinetographStudio from './KinetographStudio'

export default function Home() {
  return (
    <main className="journal-shell" id="top">
      <KinetographStudio />
      <ContentWrap />
    </main>
  )
}
