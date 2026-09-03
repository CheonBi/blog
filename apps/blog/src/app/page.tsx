import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section>
        <h1>CheonBi</h1>

        <p>개발하면서 배우고 만든 것을 기록합니다.</p>

        <nav>
          <Link href="/blog">Blog</Link>

          <a href="https://github.com/CheonBi" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </section>
    </main>
  )
}
