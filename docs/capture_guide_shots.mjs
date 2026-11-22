// Capture element-cropped screenshots for the component guide.
// Run with:  node capture_guide_shots.mjs   (needs the dev server on :5433)
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE_URL || 'http://localhost:5433/'
const OUT = process.env.OUT_DIR || new URL('./guide-shots/', import.meta.url).pathname
const EXEC = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

import { mkdirSync } from 'node:fs'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: EXEC,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 950, deviceScaleFactor: 2 },
})

const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1500))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function setTheme(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark' ? /Switch to dark mode/ : /Switch to light mode/
    const b = Array.from(document.querySelectorAll('button')).find((x) => want.test(x.getAttribute('title') || ''))
    if (b) b.click()
  }, mode)
  await sleep(700)
}

async function goTab(label) {
  await page.evaluate((x) => {
    const b = Array.from(document.querySelectorAll('nav button')).find((y) =>
      y.textContent.trim().replace(/\s+/g, ' ').startsWith(x)
    )
    if (b) b.click()
  }, label)
  await sleep(800)
}

async function goRole(role) {
  await page.evaluate((r) => {
    const s = document.querySelectorAll('header select')[0]
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, r)
    s.dispatchEvent(new Event('change', { bubbles: true }))
  }, role)
  await sleep(700)
}

async function goDistrict(d) {
  await page.evaluate((v) => {
    const s = document.querySelectorAll('header select')[1]
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, v)
    s.dispatchEvent(new Event('change', { bubbles: true }))
  }, d)
  await sleep(700)
}

// Crop a region of the page by CSS selector, with padding, clamped to the page.
async function shootSelector(selector, name, { pad = 0, index = 0 } = {}) {
  const box = await page.evaluate(
    ({ sel, i, p }) => {
      const els = document.querySelectorAll(sel)
      const el = els[i]
      if (!el) return null
      const r = el.getBoundingClientRect()
      const x = Math.max(0, r.left + window.scrollX - p)
      const y = Math.max(0, r.top + window.scrollY - p)
      return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(Math.min(r.width + p * 2, document.documentElement.scrollWidth - x)),
        height: Math.round(r.height + p * 2),
        docH: document.body.scrollHeight,
      }
    },
    { sel: selector, i: index, p: pad }
  )
  if (!box) {
    console.log(`  MISS ${name} <- ${selector}`)
    return false
  }
  await page.screenshot({
    path: `${OUT}${name}.png`,
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
    captureBeyondViewport: true,
  })
  console.log(`  ok   ${name}  ${box.width}x${box.height}`)
  return true
}

// Screenshot the current viewport only (for overlays that are position:fixed).
async function shootViewport(name, { clip } = {}) {
  await page.screenshot({ path: `${OUT}${name}.png`, captureBeyondViewport: false })
  console.log(`  ok   ${name}  (viewport)`)
}

console.log('Capturing guide screenshots ->', OUT)

// ---------------------------------------------------------------- header
await setTheme('light')
await goTab('Overview')
await shootSelector('header.app-header, header', 'header-full', { pad: 0 })
await shootSelector('header .util-strip, header > div:first-child', 'header-utility-strip', { pad: 0 })
await shootSelector('header .nav-tabs, header nav', 'header-nav-tabs', { pad: 0 })
await shootSelector('header .chips, header > div:first-child > div:last-child', 'header-chips', { pad: 6 })
await setTheme('dark')
await shootSelector('header.app-header, header', 'header-dark', { pad: 0 })

// ---------------------------------------------------------------- overview
await setTheme('light')
await goTab('Overview')
await shootSelector('main .hero', 'ov-hero', { pad: 0 })
await shootSelector('main .grid:has(.kpi)', 'ov-kpi-cards', { pad: 8 })

// surge list panel = the card that contains "Statistically significant"
const surgeIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /Statistically significant/i.test(c.innerText))
})
if (surgeIdx >= 0) await shootSelector('main .card', 'ov-surge-list', { pad: 0, index: surgeIdx })

// action panels: capture the stacked right-hand column region that holds them
await shootSelector('main .card[class*="kpi"], main .rounded', 'ov-actions', { pad: 0 })

// ---------------------------------------------------------------- surveillance
await goTab('Surveillance')
await shootSelector('main .hero', 'sur-header', { pad: 0 })
await shootSelector('main .card', 'sur-alerts', { pad: 0, index: 0 })
// full ledger table
const ledgerIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => c.querySelector('table'))
})
if (ledgerIdx >= 0) await shootSelector('main .card', 'sur-ledger', { pad: 0, index: ledgerIdx })
// presets ribbon
await shootSelector('main .flex.flex-wrap', 'presets-ribbon', { pad: 6, index: 1 })

// ---------------------------------------------------------------- van siting
await goTab('Van Siting')
await shootSelector('main .hero', 'van-header', { pad: 0 })
const mapIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /Catchment/i.test(c.innerText))
})
if (mapIdx >= 0) await shootSelector('main .card', 'van-map', { pad: 0, index: mapIdx })
const fleetIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /Fleet|Optimal Route|HQ Town/i.test(c.innerText))
})
if (fleetIdx >= 0) await shootSelector('main .card', 'van-fleet-controls', { pad: 0, index: fleetIdx })

// ---------------------------------------------------------------- pharmacy
await goTab('Pharmacy')
await shootSelector('main .hero', 'ph-header', { pad: 0 })
const invIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /Days of Cover/i.test(c.innerText))
})
if (invIdx >= 0) await shootSelector('main .card', 'ph-inventory', { pad: 0, index: invIdx })
const rebIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /Donor \(Surplus\)|Transfer/i.test(c.innerText))
})
if (rebIdx >= 0) await shootSelector('main .card', 'ph-rebalance', { pad: 0, index: rebIdx })

// ---------------------------------------------------------------- retention
await goRole('Counsellor')
await goTab('Retention')
await shootSelector('main .hero', 'ret-header', { pad: 0 })
const funnelIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /Helpline Inflow/i.test(c.innerText))
})
if (funnelIdx >= 0) await shootSelector('main .card', 'ret-funnel', { pad: 0, index: funnelIdx })
const workIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => c.querySelector('table'))
})
if (workIdx >= 0) await shootSelector('main .card', 'ret-worklist', { pad: 0, index: workIdx })
// small-cell / privacy notice
const privIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => /suppression|Privacy|DPDP/i.test(c.innerText) && !c.querySelector('table'))
})
if (privIdx >= 0) await shootSelector('main .card', 'ret-privacy', { pad: 0, index: privIdx })
// role gate shot: switch back to State Director
await goRole('State Director')
await sleep(600)
await shootSelector('main .card', 'ret-rolegate', { pad: 0, index: workIdx })

// ---------------------------------------------------------------- retention check-in dialog
await goRole('Counsellor')
await sleep(600)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.trim() === 'Check In')
  if (b) b.click()
})
await sleep(800)
await shootViewport('ret-checkin-dialog')
// close it
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'))
  const close = btns.find((b) => b.textContent.trim() === '✕') || btns.reverse().find((b) => /cancel|close/i.test(b.textContent + (b.getAttribute('title') || '')))
  if (close) close.click()
})
await sleep(500)

// ---------------------------------------------------------------- audit
await goTab('Audit')
await shootSelector('main .hero', 'audit-header', { pad: 0 })
const chainIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card, main .hero'))
  return cards.findIndex((c) => /INTACT|Chain Verification|cryptographic/i.test(c.innerText) && !c.querySelector('table'))
})
if (chainIdx >= 0) await shootSelector('main .card, main .hero', 'audit-chain', { pad: 0, index: chainIdx })
const logIdx = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('main .card'))
  return cards.findIndex((c) => c.querySelector('table'))
})
if (logIdx >= 0) await shootSelector('main .card', 'audit-log', { pad: 0, index: logIdx })

// ---------------------------------------------------------------- method
await goTab('Method')
await shootSelector('main .hero', 'meth-header', { pad: 0 })
await shootSelector('main .card', 'meth-formulas', { pad: 0, index: 0 })

// ---------------------------------------------------------------- overlays
// command bar
await goTab('Overview')
await shootSelector('main > div:first-child, main .rounded-2xl', 'nl-commandbar', { pad: 6, index: 0 })

// evaluator tour (fixed position -> viewport shot)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('header button')).find((x) => x.textContent.trim() === 'Tour')
  if (b) b.click()
})
await sleep(1000)
await shootViewport('tour-panel')
await page.evaluate(() => {
  const d = Array.from(document.querySelectorAll('div')).find(
    (x) => getComputedStyle(x).position === 'fixed' && x.className.includes('bottom-4')
  )
  const b = d && Array.from(d.querySelectorAll('button')).find((x) => x.getAttribute('title') === 'Close evaluator walkthrough')
  if (b) b.click()
})
await sleep(600)

// decision memo (fixed overlay -> viewport shot)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('header button')).find((x) => x.textContent.trim() === 'Memo')
  if (b) b.click()
})
await sleep(1200)
await shootViewport('memo-modal')

// whole dark theme overview for contrast
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Switch to dark mode/.test(x.getAttribute('title') || ''))
  if (b) b.click()
})
await sleep(900)

await browser.close()
console.log('done')
