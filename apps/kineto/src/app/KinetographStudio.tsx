import RailIndex from '@/components/RailIndex'

type KinetographStudioProps = {
  currentIndex?: number
  totalIndex: number
}

export default function KinetographStudio({
  currentIndex = 1,
  totalIndex,
}: KinetographStudioProps) {
  return (
    <>
      <header className="site-header">
        <span className="wordmark">Kinetograph</span>

        <p className="header-note">Independent journal · Seoul</p>

        <nav aria-label="주요 메뉴">
          <a href="#archive">Archive</a>
          <a href="https://cheonbi.kr">
            Blog <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <aside className="side-rail" aria-label="저널 정보">
        <div className="rail-axis">
          <p className="side-description">기억을 남기는 공간</p>
          <div className="rail-line" aria-hidden="true" />
        </div>

        <RailIndex current={currentIndex} total={totalIndex} />
      </aside>
    </>
  )
}
