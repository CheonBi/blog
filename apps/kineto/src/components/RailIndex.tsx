'use client'

import {type CSSProperties, useEffect, useMemo, useState} from 'react'

type RailIndexProps = {
  current: number
  total: number
  windowSize?: number
}

function normalizeIndex(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : fallback
}

function formatIndex(value: number) {
  return String(value).padStart(2, '0')
}

export default function RailIndex({
  current,
  total,
  windowSize = 5,
}: RailIndexProps) {
  const safeTotal = normalizeIndex(total, 1)
  const safeWindowSize = normalizeIndex(windowSize, 5)
  const controlledCurrent = Math.min(safeTotal, normalizeIndex(current, 1))
  const [observedIndex, setObservedIndex] = useState<number | null>(null)
  const activeIndex = Math.min(safeTotal, observedIndex ?? controlledCurrent)

  useEffect(() => {
    let animationFrame = 0
    const scrollRoot = document.querySelector<HTMLElement>('.journal-list')

    if (!scrollRoot) {
      return undefined
    }

    const shell = scrollRoot.closest<HTMLElement>('.journal-shell')

    const updateActiveIndex = () => {
      animationFrame = 0

      const scrollRange = scrollRoot.scrollHeight - scrollRoot.clientHeight
      const scrollProgress =
        scrollRange > 0 ? scrollRoot.scrollTop / scrollRange : 0

      shell?.style.setProperty(
        '--scroll-progress',
        Math.min(1, Math.max(0, scrollProgress)).toFixed(4),
      )

      const pages = Array.from(
        scrollRoot.querySelectorAll<HTMLElement>('[data-kineto-page]'),
      )

      if (pages.length === 0) {
        return
      }

      const rootBounds = scrollRoot.getBoundingClientRect()
      const viewportAnchor =
        rootBounds.top + scrollRoot.clientTop + scrollRoot.clientHeight * 0.5

      let closestIndex: number | null = null

      let closestDistance = Number.POSITIVE_INFINITY

      pages.forEach((page, index) => {
        const bounds = page.getBoundingClientRect()

        if (bounds.height === 0) {
          return
        }

        const declaredIndex = Number(page.dataset.kinetoPage)
        const pageIndex =
          Number.isFinite(declaredIndex) && declaredIndex > 0
            ? declaredIndex
            : index + 1
        const cardCenter = bounds.top + bounds.height / 2
        const distance = Math.abs(cardCenter - viewportAnchor)

        if (closestIndex === null || distance < closestDistance) {
          closestDistance = distance
          closestIndex = Math.min(safeTotal, Math.trunc(pageIndex))
        }
      })

      if (closestIndex === null) {
        return
      }

      const nextIndex = closestIndex
      setObservedIndex((previousIndex) =>
        previousIndex === nextIndex ? previousIndex : nextIndex,
      )
    }

    const scheduleUpdate = () => {
      if (animationFrame === 0) {
        animationFrame = requestAnimationFrame(updateActiveIndex)
      }
    }

    scheduleUpdate()
    scrollRoot.addEventListener('scroll', scheduleUpdate, {passive: true})
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      cancelAnimationFrame(animationFrame)
      scrollRoot.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      shell?.style.removeProperty('--scroll-progress')
    }
  }, [safeTotal])

  const windowStart =
    Math.floor((activeIndex - 1) / safeWindowSize) * safeWindowSize + 1

  const visibleIndices = useMemo(
    () =>
      Array.from(
        {length: Math.min(safeWindowSize, safeTotal - windowStart + 1)},
        (_, index) => windowStart + index,
      ),
    [safeTotal, safeWindowSize, windowStart],
  )

  return (
    <div
      className="rail-index"
      style={
        {
          '--rail-index-digits': Math.max(2, String(safeTotal).length),
        } as CSSProperties
      }
    >
      <ol
        className="rail-index-list"
        key={windowStart}
        start={windowStart}
        aria-hidden="true"
      >
        {visibleIndices.map((index) => (
          <li
            className={index === activeIndex ? 'is-active' : undefined}
            key={index}
          >
            {formatIndex(index)}
          </li>
        ))}
      </ol>

      <span className="rail-index-status" aria-live="polite" aria-atomic="true">
        {activeIndex} / {safeTotal} 페이지
      </span>
    </div>
  )
}
