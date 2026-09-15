export default function KinetographStudio() {
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top">
          Kinetograph
        </a>

        <p className="header-note">Independent video journal · Seoul</p>

        <nav aria-label="주요 메뉴">
          <a href="#archive">Archive</a>
          <a href="https://cheonbi.kr">
            Blog <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <aside className="side-rail" aria-label="저널 정보">
        <p className="side-description">기억을 남기는 공간</p>
        <div className="rail-line" aria-hidden="true" />
        <p className="rail-index">
          <span>01</span>
          <span>04</span>
        </p>
      </aside>
    </>
  )
}
