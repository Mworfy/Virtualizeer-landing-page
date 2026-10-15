import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertCircle, Check, Clock, Mail, MapPin } from 'lucide-react'
import { PageHero, Reveal, usePageMeta } from '../components/ui.jsx'
import { company, formEndpoint, services } from '../content.js'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Contact() {
  usePageMeta('Contact', 'Tell us about your space and get a quote from Virtualizeer.')
  const { state } = useLocation()
  const [values, setValues] = useState({
    name: '', email: '', company: '', size: '',
    message: state?.partner ? 'We’d like to partner with Virtualizeer.' : '',
    services: state?.service ? [state.service] : [],
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [trap, setTrap] = useState('')
  const formRef = useRef(null)

  const validate = (v) => {
    const e = {}
    if (!v.name.trim()) e.name = 'Please enter your name.'
    if (!v.email.trim()) e.email = 'Please enter your email.'
    else if (!emailOk(v.email)) e.email = 'That email doesn’t look right. Check for typos.'
    if (v.services.length === 0 && !state?.partner) e.services = 'Choose at least one service.'
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

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validate(values)
    setErrors(e)
    setTouched({ name: true, email: true, services: true, message: true })
    if (Object.keys(e).length) {
      const first = formRef.current.querySelector(`[name="${Object.keys(e)[0]}"]`)
      first?.focus()
      return
    }
    if (formEndpoint) {
      setSending(true)
      setSendError('')
      try {
        // no-cors: Apps Script answers from another domain, so the reply can't be read
        await fetch(formEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams({
            type: state?.partner ? 'Partnership' : 'Quote',
            name: values.name, email: values.email, company: values.company, size: values.size,
            services: values.services.join(', '), message: values.message,
            page: window.location.href, website: trap,
          }),
        })
      } catch {
        setSending(false)
        setSendError(`We couldn’t send your message. Check your connection, or email us at ${company.email}.`)
        return
      }
      setSending(false)
    }
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
        title={state?.partner ? "Let’s partner up." : "Let’s talk about your space."}
        lead="We reply within one business day."
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
                <div className="visually-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </div>
                {sendError && <p className="field__error" role="alert"><AlertCircle aria-hidden="true" />{sendError}</p>}
                <button type="submit" className="btn btn--primary" style={{ justifySelf: 'start' }} disabled={sending}>
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={100} className="contact-side">
            <div className="contact-list">
              <a href={`mailto:${company.email}`}>
                <span className="icon-tile"><Mail aria-hidden="true" /></span>
                <span><span className="contact-list__label">Email</span><br /><span className="contact-list__value">{company.email}</span></span>
              </a>
              <div>
                <span className="icon-tile"><MapPin aria-hidden="true" /></span>
                <span><span className="contact-list__label">Based in</span><br /><span className="contact-list__value">{company.location}</span></span>
              </div>
              <div>
                <span className="icon-tile"><Clock aria-hidden="true" /></span>
                <span><span className="contact-list__label">Reply time</span><br /><span className="contact-list__value">Within one business day</span></span>
              </div>
            </div>
            <div className="contact-next">
              <h2 className="h3">What happens next</h2>
              <ol>
                <li>We read your message and reply by email.</li>
                <li>A short call to understand your space.</li>
                <li>You get a clear quote and timeline.</li>
              </ol>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
