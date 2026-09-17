type journalIndex = {
  sceneIndex: number
  slotIndex: number
}

const MEDIA_CLASSES = ['media-river', 'media-night', 'media-rain'] as const

export const JOURNALS_PER_SCENE = 5

export function getMediaClass(seed: number) {
  const normalizedSeed = Math.abs(Math.trunc(seed))
  let mixedSeed = normalizedSeed

  mixedSeed = Math.imul(mixedSeed ^ (mixedSeed >>> 16), 0x45d9f3b)
  mixedSeed = Math.imul(mixedSeed ^ (mixedSeed >>> 16), 0x45d9f3b)
  mixedSeed ^= mixedSeed >>> 16

  return MEDIA_CLASSES[(mixedSeed >>> 0) % MEDIA_CLASSES.length]
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
