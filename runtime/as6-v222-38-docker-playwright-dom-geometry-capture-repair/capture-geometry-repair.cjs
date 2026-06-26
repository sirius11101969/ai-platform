let chromium
try {
  chromium = require('playwright').chromium
} catch (error) {
  console.error('PLAYWRIGHT_REQUIRE_FAILED')
  console.error(error && error.stack ? error.stack : error)
  process.exit(21)
}

const fs = require('fs')

const url = process.env.AS6_URL || 'https://www.as6.ru/command-center?diag=v22238repair'
const outJson = process.env.AS6_OUT_JSON || '/work/production-dom-geometry.repair.json'
const outPng = process.env.AS6_OUT_PNG || '/work/production-screenshot.repair.png'

const selectors = [
  ['body', 'body'],
  ['root', '#root'],
  ['main', '.command-center-page'],
  ['mainGrid', '.command-main-grid'],
  ['core', '.command-core'],
  ['rightRail', '.command-right-rail'],
  ['copilot', '.copilot-hero'],
  ['slot', '.as6-product-recommendation-slot-card'],
  ['card', '.as6-product-recommendation-card'],
  ['summary', '.as6-product-recommendation-card__summary'],
  ['action', '.as6-product-recommendation-card__action'],
  ['button', '.as6-product-recommendation-card__button'],
  ['eventCard', '.event-card'],
  ['nextAction', '.next-action-card']
]

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1500)

  const geometry = await page.evaluate((selectors) => {
    const pickStyle = (style) => ({
      display: style.display,
      position: style.position,
      boxSizing: style.boxSizing,
      width: style.width,
      minWidth: style.minWidth,
      maxWidth: style.maxWidth,
      height: style.height,
      minHeight: style.minHeight,
      maxHeight: style.maxHeight,
      padding: style.padding,
      margin: style.margin,
      border: style.border,
      gridTemplateColumns: style.gridTemplateColumns,
      gridTemplateRows: style.gridTemplateRows,
      gridColumn: style.gridColumn,
      gridRow: style.gridRow,
      gridArea: style.gridArea,
      columnGap: style.columnGap,
      rowGap: style.rowGap,
      flex: style.flex,
      flexGrow: style.flexGrow,
      flexShrink: style.flexShrink,
      flexBasis: style.flexBasis,
      alignSelf: style.alignSelf,
      justifySelf: style.justifySelf,
      alignItems: style.alignItems,
      justifyContent: style.justifyContent,
      overflow: style.overflow,
      transform: style.transform
    })

    return {
      url: location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      visibleText: {
        card: document.querySelector('.as6-product-recommendation-card')?.innerText || null,
        button: document.querySelector('.as6-product-recommendation-card__button')?.innerText || null
      },
      elements: selectors.map(([name, selector]) => {
        const el = document.querySelector(selector)
        if (!el) return { name, selector, found: false }

        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)

        return {
          name,
          selector,
          found: true,
          tag: el.tagName,
          className: String(el.className || ''),
          dataset: { ...el.dataset },
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
          },
          metrics: {
            offsetWidth: el.offsetWidth,
            offsetHeight: el.offsetHeight,
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight,
            scrollWidth: el.scrollWidth,
            scrollHeight: el.scrollHeight
          },
          computed: pickStyle(style)
        }
      })
    }
  }, selectors)

  fs.writeFileSync(outJson, JSON.stringify(geometry, null, 2))
  await page.screenshot({ path: outPng, fullPage: true })
  await browser.close()
})().catch((error) => {
  fs.writeFileSync('/work/playwright-repair-error.txt', String(error && error.stack ? error.stack : error))
  process.exit(1)
})
