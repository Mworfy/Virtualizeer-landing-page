import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/ui.jsx'

export default function NotFound() {
  usePageMeta('Page not found', 'This page does not exist.', { noindex: true })
  return (
    <section className="not-found">
      <div className="container">
        <img src="/brand/mark-navy.png" alt="" />
        <h1 className="h1">This room isn’t on the tour.</h1>
        <p className="lead" style={{ marginTop: 16 }}>The page you’re looking for doesn’t exist or has moved.</p>
        <div className="btn-row">
          <Link to="/" className="btn btn--primary">Back to home</Link>
          <Link to="/projects" className="btn btn--secondary">View projects</Link>
        </div>
      </div>
    </section>
  )
}
