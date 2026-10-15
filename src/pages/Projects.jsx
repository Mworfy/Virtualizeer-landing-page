import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CTABand, PageHero, ProjectCard, Reveal, categoryLabels, usePageMeta } from '../components/ui.jsx'
import { projects } from '../content.js'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'tours', label: 'Virtual Tours' },
  { key: 'twins', label: 'Digital Twins' },
  { key: 'web', label: 'Web' },
]

export default function Projects() {
  usePageMeta('Projects', 'Virtual tours, digital twins and websites delivered by Virtualizeer.')
  const { state } = useLocation()
  const [filter, setFilter] = useState(state?.filter ?? 'all')
  const shown = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
  const count = (k) => (k === 'all' ? projects.length : projects.filter((p) => p.category === k).length)

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Spaces we’ve brought online."
        lead="Tours, twins and websites we’ve built."
      />
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="segmented" role="group" aria-label="Filter projects by service">
            {filters.map((f) => (
              <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}<span className="count">{count(f.key)}</span>
              </button>
            ))}
          </div>
          <p className="visually-hidden" aria-live="polite">
            Showing {shown.length} {filter === 'all' ? '' : categoryLabels[filter]} projects
          </p>
          <div className="grid grid-3">
            {shown.map((p, i) => (
              <Reveal key={`${filter}-${p.slug}`} delay={(i % 3) * 60}>
                <ProjectCard project={p} headingLevel={2} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABand title="Have a space in mind?" />
    </>
  )
}
