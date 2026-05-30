'use client'

import {useSearchParams} from 'next/navigation'
import {Suspense} from 'react'

import {AboutHero} from '@/components/about/AboutHero'
import {AboutIntro} from '@/components/about/AboutIntro'
import {Resume} from '@/components/about/Resume'

function AboutPageContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'about'

  const handleTabChange = (newTab: string) => {
    const url = new URL(window.location.href)
    if (newTab === 'about') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', newTab)
    }
    window.history.pushState({}, '', url)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="page-view">
      <AboutHero />

      <div className="tabs">
        <button
          type="button"
          data-active={tab === 'about'}
          onClick={() => handleTabChange('about')}
        >
          About
        </button>
        <button
          type="button"
          data-active={tab === 'resume'}
          onClick={() => handleTabChange('resume')}
        >
          Resume
        </button>
      </div>

      <div className="mt-4">
        {tab === 'about' ? <AboutIntro /> : <Resume />}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutPageContent />
    </Suspense>
  )
}
