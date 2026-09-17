import type {ContentProps} from '@/type'
import {chunk, getMediaClass, JOURNALS_PER_SCENE} from '@/utils/Layout'

export default function Contents({pages, titles}: ContentProps) {
  const scenes = chunk(pages, JOURNALS_PER_SCENE)

  return (
    <div className="journal-list">
      {scenes.map((scene, sceneIndex) => (
        <section
          className="journal-page"
          key={sceneIndex}
          data-kineto-page={sceneIndex + 1}
        >
          {titles
            .slice(5 * sceneIndex, 5 * (sceneIndex + 1))
            .map((title, slotIndex) => (
              <h1
                className="stage-title"
                data-slot={slotIndex + 1}
                key={slotIndex}
              >
                {title}
              </h1>
            ))}

          {scene.map((page, slotIndex) => (
            <article
              className="journal-card"
              data-slot={slotIndex + 1}
              key={page.id}
            >
              <span className="card-number" aria-hidden="true">
                {page.id}
              </span>
              <div
                className={`journal-media ${getMediaClass(page.id)}`}
                aria-hidden="true"
              >
                <span>Frame {page.id}</span>
              </div>
              <div className="card-caption">
                <h2>{page.title}</h2>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}
