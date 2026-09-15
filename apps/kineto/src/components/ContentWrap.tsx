export default function ContentWrap() {
  return (
    <section
      className="journal-stage"
      id="archive"
      aria-labelledby="stage-title"
    >
      <h1 id="stage-title">지나가는 혹은 지나갔던 장면을 기록합니다</h1>

      <p className="stage-season">Life is a long journal / 1997.11.29 ~</p>

      <article className="journal-card journal-card-one">
        <span className="card-number" aria-hidden="true">
          1
        </span>
        <div className="journal-media media-rain" aria-hidden="true">
          <span>Frame 001</span>
        </div>
        <div className="card-caption">
          <h2>비 온 뒤, 서울</h2>
          <p>14 Sep 2026 · 00:48</p>
        </div>
      </article>

      <article className="journal-card journal-card-two">
        <span className="card-number" aria-hidden="true">
          2
        </span>
        <div className="journal-media media-river" aria-hidden="true">
          <span>Frame 002</span>
        </div>
        <div className="card-caption card-caption-vertical">
          <h2>한강의 저녁</h2>
          <p>02 Sep 2026 · 01:12</p>
        </div>
      </article>

      <article className="journal-card journal-card-three" aria-hidden="true">
        <span className="card-number">3</span>
        <div className="journal-media media-night">
          <span>Frame 003</span>
        </div>
      </article>

      <div className="stage-progress" aria-label="첫 번째 화면">
        <span>01</span>
        <span aria-hidden="true">/</span>
        <span>04</span>
      </div>
    </section>
  )
}
