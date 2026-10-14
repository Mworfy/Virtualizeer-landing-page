import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertCircle, Check, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { PageHero, Reveal, usePageMeta } from '../components/ui.jsx'
import { company, services } from '../content.js'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Contact() {
  usePageMeta('Contact', 'Tell us about your space and get a quote from Virtualizeer.')
  const { state } = useLocation()
  const [values, setValues] = useState({
    name: '', email: '', company: '', size: '', message: '',
    services: state?.service ? [state.service] : [],
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const formRef = useRef(null)

  const validate = (v) => {
    const e = {}
    if (!v.name.trim()) e.name = 'Please enter your name.'
    if (!v.email.trim()) e.email = 'Please enter your email.'
    else if (!emailOk(v.email)) e.email = 'That email doesn’t look right. Check for typos.'
    if (v.services.length === 0) e.services = 'Choose at least one service.'
    if (v.message.trim().length < 10) e.message = 'Tell us a little about your space (at least 10 characters).'
    return e
  }

  const update = (field, value) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (touched[field]) setErrors(validate(next))
  }

  const toggleService = (name) => {
    const list = values.services.includes(name) ? values.services.filter((s) => s !== name) : [...values.services, name]
    update('services', list)
    setTouched((t) => ({ ...t, services: true }))
    setErrors(validate({ ...values, services: list }))
  }

  const blur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate(values))
  }

  const submit = (ev) => {
    ev.preventDefault()
    const e = validate(values)
    setErrors(e)
    setTouched({ name: true, email: true, services: true, message: true })
    if (Object.keys(e).length) {
      const first = formRef.current.querySelector(`[name="${Object.keys(e)[0]}"]`)
      first?.focus()
      return
    }
    // TODO: connect to a form service (Formspree, Web3Forms, your API) here.
    setSent(true)
  }

  const err = (f) => touched[f] && errors[f]
  const ErrorMsg = ({ f }) =>
    err(f) ? (
      <span className="field__error" id={`${f}-error`}><AlertCircle aria-hidden="true" />{errors[f]}</span>
    ) : null

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk about your space."
        lead="Share a few details and we’ll reply within one business day with a tailored quote."
      />
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container split split--top">
          <Reveal className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
            {sent ? (
              <div className="form-success" role="status">
                <div className="icon-tile"><Check aria-hidden="true" /></div>
                <h2 className="h3" style={{ marginBottom: 8 }}>Thanks, {values.name.split(' ')[0]}!</h2>
                <p className="muted">We’ve received your message and will reply to {values.email} within one business day.</p>
                <button
                  className="btn btn--secondary"
                  style={{ marginTop: 24 }}
                  onClick={() => {
                    setSent(false)
                    setValues({ name: '', email: '', company: '', size: '', message: '', services: [] })
                    setTouched({})
                    setErrors({})
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form ref={formRef} className="form" onSubmit={submit} noValidate>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" autoComplete="name" value={values.name}
                      onChange={(e) => update('name', e.target.value)} onBlur={() => blur('name')}
                      aria-invalid={!!err('name')} aria-describedby={err('name') ? 'name-error' : undefined} />
                    <ErrorMsg f="name" />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email}
                      onChange={(e) => update('email', e.target.value)} onBlur={() => blur('email')}
                      aria-invalid={!!err('email')} aria-describedby={err('email') ? 'email-error' : undefined} />
                    <ErrorMsg f="email" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="company">Company <span className="opt">(optional)</span></label>
                    <input id="company" name="company" autoComplete="organization" value={values.company}
                      onChange={(e) => update('company', e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="size">Approximate size <span className="opt">(optional)</span></label>
                    <select id="size" name="size" value={values.size} onChange={(e) => update('size', e.target.value)}>
                      <option value="">Select a size</option>
                      <option>Under 150 m²</option>
                      <option>150 to 500 m²</option>
                      <option>500 to 2,000 m²</option>
                      <option>Over 2,000 m²</option>
                      <option>Not sure / website only</option>
                    </select>
                  </div>
                </div>
                <fieldset className="field" style={{ border: 0, padding: 0 }}
                  aria-describedby={err('services') ? 'services-error' : undefined}>
                  <legend style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 8 }}>What do you need?</legend>
                  <div className="chip-select">
                    {services.map((s, i) => (
                      <label key={s.slug}>
                        <input type="checkbox" name={i === 0 ? 'services' : undefined}
                          checked={values.services.includes(s.name)} onChange={() => toggleService(s.name)} />
                        {values.services.includes(s.name) && <Check aria-hidden="true" />}
                        {s.name}
                      </label>
                    ))}
                  </div>
                  <ErrorMsg f="services" />
                </fieldset>
                <div className="field">
                  <label htmlFor="message">Tell us about your space</label>
                  <textarea id="message" name="message" value={values.message}
                    placeholder="Type of property, location, timeline, anything else we should know…"
                    onChange={(e) => update('message', e.target.value)} onBlur={() => blur('message')}
                    aria-invalid={!!err('message')} aria-describedby={err('message') ? 'message-error' : undefined} />
                  <ErrorMsg f="message" />
                </div>
                <button type="submit" className="btn btn--primary" style={{ justifySelf: 'start' }}>Send message</button>
              </form>
            )}
          </Reveal>

          <Reveal delay={100}>
            <h2 className="h3" style={{ marginBottom: 8 }}>Prefer to reach us directly?</h2>
            <p className="muted" style={{ marginBottom: 20 }}>We’re happy to jump on a quick call or chat on WhatsApp.</p>
            <div className="contact-list">
              <a href={`mailto:${company.email}`}>
                <span className="icon-tile"><Mail aria-hidden="true" /></span>
                <span><span className="contact-list__label">Email</span><br /><span className="contact-list__value">{company.email}</span></span>
              </a>
              <a href={`tel:${company.phone.replace(/\s/g, '')}`}>
                <span className="icon-tile"><Phone aria-hidden="true" /></span>
                <span><span className="contact-list__label">Phone</span><br /><span className="contact-list__value">{company.phone}</span></span>
              </a>
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                <span className="icon-tile"><MessageCircle aria-hidden="true" /></span>
                <span><span className="contact-list__label">WhatsApp</span><br /><span className="contact-list__value">Chat with us</span></span>
              </a>
              <div>
                <span className="icon-tile"><MapPin aria-hidden="true" /></span>
                <span><span className="contact-list__label">Based in</span><br /><span className="contact-list__value">{company.location}</span></span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
