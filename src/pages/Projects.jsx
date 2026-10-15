import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CTABand, PageHero, ProjectCard, Reveal, SectionHeader, usePageMeta } from '../components/ui.jsx'
import { projects } from '../content.js'

const groups = [
  { key: 'tours', label: 'Virtual Tours', lead: '360° tours people explore from any screen.' },
  { key: 'twins', label: 'Digital Twins', lead: 'Interactive 3D models of compounds, plants and districts.' },
  { key: 'web', label: 'Web Development', lead: 'Websites and platforms we designed and built.' },
]

export default function Projects() {
  usePageMeta('Projects', 'Virtual tours, digital twins and websites delivered by Virtualizeer.')
  const { state } = useLocation()
  const shown = groups.map((g) => ({ ...g, items: projects.filter((p) => p.category === g.key) })).filter((g) => g.items.length)

  useEffect(() => {
    if (state?.filter) document.getElementById(`work-${state.filter}`)?.scrollIntoView({ block: 'start' })
  }, [state])

  return (
    <>
      <PageHero eyebrow="Projects" title="Spaces we’ve brought online." lead="Tours, twins and websites we’ve built.">
        <nav className="jump-nav" aria-label="Project categories">
          {shown.map((g) => (
            <a key={g.key} href={`#work-${g.key}`}>{g.label}<span className="count">{g.items.length}</span></a>
          ))}
        </nav>
      </PageHero>
      {shown.map((g, n) => (
        <section key={g.key} id={`work-${g.key}`} className={`section${n % 2 ? ' section--alt' : ''} work-group`} aria-labelledby={`work-${g.key}-title`}>
          <div className="container">
            <SectionHeader eyebrow={`${String(n + 1).padStart(2, '0')} · ${g.items.length} projects`} title={<span id={`work-${g.key}-title`}>{g.label}</span>} lead={g.lead} />
            <div className="grid grid-3">
              {g.items.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 60}>
                  <ProjectCard project={p} headingLevel={3} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}
      <CTABand title="Have a space in mind?" />
    </>
  )
}
