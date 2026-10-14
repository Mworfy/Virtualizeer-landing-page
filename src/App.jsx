import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ServicePage from './pages/ServicePage.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import { lazy, Suspense } from 'react'

const NewZayedAtlas = lazy(() => import('./pages/NewZayedAtlas.jsx'))

export default function App() {
  return (
    <Routes>
      <Route path="new-zayed-atlas" element={<Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#efe6d3' }} />}><NewZayedAtlas /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="virtual-tours" element={<ServicePage key="vt" slug="virtual-tours" />} />
        <Route path="digital-twins" element={<ServicePage key="dt" slug="digital-twins" />} />
        <Route path="web-development" element={<ServicePage key="wd" slug="web-development" />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
