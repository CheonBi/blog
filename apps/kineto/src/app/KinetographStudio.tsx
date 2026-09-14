import Image from 'next/image'

const videos = [
  {
    title: '퇴근길 한강',
    description: '해가 지기 전 강변을 따라 걸었습니다.',
    date: '2026.09.02',
    duration: '1:12',
  },
  {
    title: '을지로의 밤',
    description: '늦게까지 불이 켜진 골목의 풍경.',
    date: '2026.08.18',
    duration: '0:54',
  },
  {
    title: '눈 오는 창밖',
    description: '조용히 눈이 쌓이던 오후의 기록.',
    date: '2026.01.11',
    duration: '0:37',
  },
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  )
}

export default function KinetographStudio() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Kinetograph</span>
        </a>
        <nav className="site-nav" aria-label="주요 메뉴">
          <a href="#videos">Archive</a>
          <a className="blog-link" href="https://cheonbi.kr">
            Blog
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <section className="intro" id="top">
        <div className="intro-title">
          <p className="section-label">Independent video journal</p>
          <h1>
            영상으로
            <br />
            남긴 일상.
          </h1>
        </div>
        <div className="intro-note">
          <p>직접 촬영한 짧은 영상을 모아두는 곳입니다.</p>
          <p>
            Seoul, Korea
            <br />
            2026 — Present
          </p>
        </div>
      </section>

      <article className="featured" aria-labelledby="featured-title">
        <div className="featured-image">
          <Image
            src="/featured-seoul.png"
            alt="비가 그친 뒤 불빛이 비치는 서울의 주택가 골목"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 68vw"
          />
          <span className="play-mark" aria-hidden="true">
            <PlayIcon />
          </span>
          <span className="duration">0:48</span>
        </div>

        <div className="featured-copy">
          <div>
            <p className="section-label">Featured film</p>
            <p className="film-number">KNT / 004</p>
          </div>
          <div className="featured-details">
            <h2 id="featured-title">비 온 뒤, 서울</h2>
            <p className="description">
              비가 그친 저녁, 동네 골목을 천천히 걸으며 찍었습니다.
            </p>
            <div className="video-meta">
              <time dateTime="2026-09-14">14 Sep 2026</time>
              <span>Seoul</span>
              <span>4K</span>
            </div>
          </div>
        </div>
      </article>

      <section className="video-list" id="videos">
        <div className="list-heading">
          <h2>모든 영상</h2>
          <span>Archive · {videos.length} films</span>
        </div>

        <div>
          {videos.map((video, index) => (
            <article className="video-row" key={video.title}>
              <span className="index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="video-title">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
              <time dateTime={video.date.replaceAll('.', '-')}>
                {video.date}
              </time>
              <span className="row-duration">{video.duration}</span>
              <span className="row-arrow">
                <ArrowIcon />
              </span>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>© 2026 CheonBi</p>
        <p>일상의 짧은 장면들</p>
      </footer>
    </main>
  )
}
