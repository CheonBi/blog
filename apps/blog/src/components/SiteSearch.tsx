'use client'

import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'

import {useLocale} from '@/hooks/useLocale'

interface SearchItem {
  slug: string
  title: string
  description: string
  tags: string[]
  body: string
  date: string
}

const MAX_RESULTS = 20

// 토큰별로 가장 강한 필드 하나에서만 점수를 매겨(긴 본문이 점수를 독식하지 않도록)
// 합산한다. 모든 토큰이 어딘가에 매칭돼야 결과에 남는다(AND). 미매칭이면 -1.
function scoreItem(item: SearchItem, tokens: string[], phrase: string): number {
  const title = item.title.toLowerCase()
  const tags = item.tags.join(' ').toLowerCase()
  const body = item.body.toLowerCase()
  const description = item.description.toLowerCase()

  let score = 0
  for (const t of tokens) {
    if (title.includes(t)) {
      score += 10
    } else if (tags.includes(t)) {
      score += 6
    } else if (body.includes(t)) {
      score += 4
    } else if (description.includes(t)) {
      score += 2
    } else {
      return -1
    }
  }

  if (title === phrase) {
    score += 20
  } else if (title.startsWith(phrase)) {
    score += 8
  } else if (title.includes(phrase)) {
    score += 4
  }

  return score
}

export default function SiteSearch() {
  const {locale, pathPrefix} = useLocale()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadIndex = useCallback(async () => {
    if (index || loading) {
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search-index?locale=${locale}`)
      const data = await res.json()
      setIndex(data.index ?? [])
    } catch {
      setIndex([])
    } finally {
      setLoading(false)
    }
  }, [index, loading, locale])

  const handleOpen = useCallback(() => {
    setOpen(true)
    loadIndex()
  }, [loadIndex])

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        loadIndex()
      } else if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loadIndex, handleClose])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  const tokens = query
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const phrase = tokens.join(' ')
  const results =
    tokens.length === 0
      ? []
      : (index ?? [])
          .map((item) => ({item, score: scoreItem(item, tokens, phrase)}))
          .filter((r) => r.score >= 0)
          .sort((a, b) =>
            b.score !== a.score
              ? b.score - a.score
              : a.item.date < b.item.date
                ? 1
                : -1,
          )
          .slice(0, MAX_RESULTS)
          .map((r) => r.item)

  return (
    <>
      <button
        type="button"
        className="icon-btn"
        aria-label={locale === 'en' ? 'Search' : '검색'}
        onClick={handleOpen}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'en' ? 'Search posts' : '글 검색'}
          onClick={handleClose}
        >
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-row">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                className="search-input"
                placeholder={locale === 'en' ? 'Search posts…' : '글 검색…'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="search-esc"
                onClick={handleClose}
                aria-label={locale === 'en' ? 'Close' : '닫기'}
              >
                esc
              </button>
            </div>

            <div className="search-results">
              {loading && (
                <p className="search-hint">
                  {locale === 'en' ? 'Loading…' : '불러오는 중…'}
                </p>
              )}
              {!loading && tokens.length > 0 && results.length === 0 && (
                <p className="search-hint">
                  {locale === 'en' ? 'No results' : '검색 결과가 없습니다'}
                </p>
              )}
              {results.map((item) => (
                <Link
                  key={item.slug}
                  href={`${pathPrefix}/${item.slug}`}
                  className="search-result"
                  onClick={handleClose}
                  prefetch={false}
                >
                  <span className="search-result-title">{item.title}</span>
                  {item.description && (
                    <span className="search-result-desc">
                      {item.description}
                    </span>
                  )}
                  <span className="search-result-meta">
                    {item.date}
                    {item.tags.length > 0 &&
                      ` · ${item.tags
                        .slice(0, 3)
                        .map((t) => `#${t}`)
                        .join(' ')}`}
                  </span>
                </Link>
              ))}
            </div>

            {locale !== 'en' && (
              <div className="search-foot">
                <Link
                  href="/archive"
                  className="search-archive-link"
                  onClick={handleClose}
                >
                  연도별로 둘러보기 →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
