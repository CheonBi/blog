import Image from 'next/image'

import type {ContentProps} from '@/type'
import {chunk, getMedia, JOURNALS_PER_SCENE} from '@/utils/Layout'

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

          {scene.map((page, slotIndex) => {
            const media = getMedia(page.id)

            return (
              <article
                className="journal-card"
                data-slot={slotIndex + 1}
                key={page.id}
              >
                <span className="card-number" aria-hidden="true">
                  {page.id}
                </span>
                <div
                  className={`journal-media ${media.className}`}
                  aria-hidden="true"
                >
                  <Image
                    src={media.src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 82vw, (max-width: 1023px) 45vw, 31vw"
                  />
                  <span>Frame {page.id}</span>
                </div>
                <div className="card-caption">
                  <h2>{page.title}</h2>
                </div>
              </article>
            )
          })}
        </section>
      ))}
    </div>
  )
}
