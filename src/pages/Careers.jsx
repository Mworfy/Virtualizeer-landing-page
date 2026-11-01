import { useRef, useState } from 'react'
import { AlertCircle, ArrowRight, Briefcase, Check, MapPin } from 'lucide-react'
import { PageHero, Reveal, usePageMeta } from '../components/ui.jsx'
import { company, formEndpoint, jobs } from '../content.js'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const phoneOk = (v) => /^\+?[\p{Nd}\s()-]{8,20}$/u.test(v.trim())

// Keep in sync with CV_TYPES and CV_MAX_BYTES in apps-script/Code.gs
const CV_EXTENSIONS = ['pdf', 'doc', 'docx']
const CV_MAX_MB = 5

const emptyForm = { name: '', email: '', phone: '', role: jobs[0].title, linkedin: '', message: '', cv: null }

// The Apps Script endpoint takes plain form fields, so the file travels as base64.
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export default function Careers() {
  usePageMeta('Careers', 'Join Virtualizeer. See open roles and apply online.')
  const [values, setValues] = useState(emptyForm)
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
    if (!v.phone.trim()) e.phone = 'Please enter your phone number.'
    else if (!phoneOk(v.phone)) e.phone = 'That number doesn’t look right. Include digits only, with the country code if you’re outside Egypt.'
    if (!v.cv) e.cv = 'Please attach your CV.'
    else if (!CV_EXTENSIONS.includes(v.cv.name.split('.').pop().toLowerCase())) e.cv = 'Please upload your CV as a PDF or Word file.'
    else if (v.cv.size === 0) e.cv = 'That file is empty. Please choose another one.'
    else if (v.cv.size > CV_MAX_MB * 1024 * 1024) e.cv = `Your CV must be under ${CV_MAX_MB} MB.`
    return e
  }

  const update = (field, value) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (touched[field]) setErrors(validate(next))
  }

  const blur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate(values))
  }

  const chooseCv = (file) => {
    const next = { ...values, cv: file ?? null }
    setValues(next)
    setTouched((t) => ({ ...t, cv: true }))
    setErrors(validate(next))
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validate(values)
    setErrors(e)
    setTouched({ name: true, email: true, phone: true, cv: true })
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
            type: 'Application',
            role: values.role, name: values.name, email: values.email, phone: values.phone,
            linkedin: values.linkedin, message: values.message,
            cv_name: values.cv.name, cv_data: await toBase64(values.cv),
            page: window.location.href, website: trap,
          }),
        })
      } catch {
        setSending(false)
        setSendError(`We couldn’t send your application. Check your connection, or email your CV to ${company.email}.`)
        return
      }
      setSending(false)
    }
    setSent(true)
  }

  const err = (f) => touched[f] && errors[f]
  const errorMsg = (f) =>
    err(f) ? (
      <span className="field__error" id={`${f}-error`}><AlertCircle aria-hidden="true" />{errors[f]}</span>
    ) : null

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Help people step inside."
        lead="We bring real places online with virtual tours, digital twins and websites. Join the team behind them."
      >
        <div className="btn-row">
          <a href="#apply" className="btn btn--primary">Apply now <ArrowRight aria-hidden="true" /></a>
        </div>
      </PageHero>
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container split split--top">
          <div className="job-list">
            <h2 className="h2">Open roles</h2>
            {jobs.map((job) => (
              <Reveal as="article" key={job.slug} className="job">
                <h3 className="h3">{job.title}</h3>
                <ul className="job__meta">
                  <li><Briefcase aria-hidden="true" />{job.type}</li>
                  <li><MapPin aria-hidden="true" />{job.location}</li>
                </ul>
                <p className="muted">{job.summary}</p>
                <h4>What you’ll do</h4>
                <ul className="check-list">
                  {job.responsibilities.map((r) => <li key={r}><Check aria-hidden="true" />{r}</li>)}
                </ul>
                <h4>What we’re looking for</h4>
                <ul className="check-list">
                  {job.requirements.map((r) => <li key={r}><Check aria-hidden="true" />{r}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal id="apply" className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
            {sent ? (
              <div className="form-success" role="status">
                <div className="icon-tile"><Check aria-hidden="true" /></div>
                <h2 className="h3" style={{ marginBottom: 8 }}>Thanks, {values.name.trim().split(/\s+/)[0]}!</h2>
                <p className="muted">We’ve received your application for the {values.role}. We’ll review your CV and contact you at {values.email} about next steps.</p>
              </div>
            ) : (
              <form ref={formRef} className="form" onSubmit={submit} noValidate>
                <h2 className="h3">Apply now</h2>
                {jobs.length > 1 && (
                  <div className="field">
                    <label htmlFor="role">Role</label>
                    <select id="role" name="role" value={values.role} onChange={(e) => update('role', e.target.value)}>
                      {jobs.map((job) => <option key={job.slug}>{job.title}</option>)}
                    </select>
                  </div>
                )}
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" name="name" autoComplete="name" value={values.name}
                    onChange={(e) => update('name', e.target.value)} onBlur={() => blur('name')}
                    aria-invalid={!!err('name')} aria-describedby={err('name') ? 'name-error' : undefined} />
                  {errorMsg('name')}
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email}
                      onChange={(e) => update('email', e.target.value)} onBlur={() => blur('email')}
                      aria-invalid={!!err('email')} aria-describedby={err('email') ? 'email-error' : undefined} />
                    {errorMsg('email')}
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone number</label>
                    <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={values.phone}
                      onChange={(e) => update('phone', e.target.value)} onBlur={() => blur('phone')}
                      aria-invalid={!!err('phone')} aria-describedby={err('phone') ? 'phone-error' : undefined} />
                    {errorMsg('phone')}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="cv">CV</label>
                  <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx"
                    onChange={(e) => chooseCv(e.target.files[0])}
                    aria-invalid={!!err('cv')} aria-describedby={err('cv') ? 'cv-error' : 'cv-hint'} />
                  {err('cv') ? errorMsg('cv') : <span className="field__hint" id="cv-hint">PDF or Word, up to {CV_MAX_MB} MB.</span>}
                </div>
                <div className="field">
                  <label htmlFor="linkedin">LinkedIn profile <span className="opt">(optional)</span></label>
                  <input id="linkedin" name="linkedin" type="url" inputMode="url" value={values.linkedin}
                    onChange={(e) => update('linkedin', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="message">Why this role? <span className="opt">(optional)</span></label>
                  <textarea id="message" name="message" value={values.message}
                    onChange={(e) => update('message', e.target.value)} />
                </div>
                <div className="visually-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </div>
                {sendError && <p className="field__error" role="alert"><AlertCircle aria-hidden="true" />{sendError}</p>}
                <button type="submit" className="btn btn--primary" style={{ justifySelf: 'start' }} disabled={sending}>
                  {sending ? 'Sending…' : 'Send application'}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
