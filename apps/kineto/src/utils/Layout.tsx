type journalIndex = {
  sceneIndex: number
  slotIndex: number
}

const MEDIA_ASSETS = [
  {
    className: 'media-river',
    src: '/images/journal/river-seoul.png',
  },
  {
    className: 'media-night',
    src: '/images/journal/night-seoul.png',
  },
  {
    className: 'media-rain',
    src: '/images/journal/rain-seoul.png',
  },
] as const

export const JOURNALS_PER_SCENE = 5

export function getMedia(seed: number) {
  const normalizedSeed = Math.abs(Math.trunc(seed))
  let mixedSeed = normalizedSeed

  mixedSeed = Math.imul(mixedSeed ^ (mixedSeed >>> 16), 0x45d9f3b)
  mixedSeed = Math.imul(mixedSeed ^ (mixedSeed >>> 16), 0x45d9f3b)
  mixedSeed ^= mixedSeed >>> 16

  return MEDIA_ASSETS[(mixedSeed >>> 0) % MEDIA_ASSETS.length]
}

export function getMediaClass(seed: number) {
  return getMedia(seed).className
}

export function getJournalLayoutIndex(index: number): journalIndex {
  return {
    sceneIndex: Math.floor(index / JOURNALS_PER_SCENE),
    slotIndex: index % JOURNALS_PER_SCENE,
  }
}

export function chunk<T>(items: T[], size = JOURNALS_PER_SCENE): T[][] {
  return Array.from(
    {
      length: Math.ceil(items.length / size),
    },
    (_, index) => items.slice(index * size, (index + 1) * size),
  )
}
