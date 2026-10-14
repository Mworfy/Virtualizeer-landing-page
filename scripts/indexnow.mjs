// Notify IndexNow search engines (Bing, Yandex, Naver, Seznam, Yep) after a deploy:
//   node scripts/indexnow.mjs
import { ROUTES, SITE_URL } from '../src/seo.js'

const key = 'd02303ca986a0fc1aaa32609ec52b6ee'
const host = new URL(SITE_URL).host
const urlList = Object.keys(ROUTES).map((p) => `${SITE_URL}${p === '/' ? '/' : p}`)
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList }),
})
console.log('IndexNow:', res.status, res.statusText || '', `(${urlList.length} URLs)`)
