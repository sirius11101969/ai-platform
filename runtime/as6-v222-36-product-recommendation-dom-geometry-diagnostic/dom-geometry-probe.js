(() => {
  const selectors = [
    ['body', 'body'],
    ['root', '#root'],
    ['app-shell', '.app-shell'],
    ['workspace', '.workspace'],
    ['main', '.command-center-page'],
    ['main-grid', '.command-main-grid'],
    ['core', '.command-core'],
    ['right-rail', '.command-right-rail'],
    ['copilot-card', '.copilot-hero'],
    ['recommendation-slot', '.as6-product-recommendation-slot-card'],
    ['recommendation-card', '.as6-product-recommendation-card'],
    ['recommendation-summary', '.as6-product-recommendation-card__summary'],
    ['recommendation-action', '.as6-product-recommendation-card__action'],
    ['recommendation-button', '.as6-product-recommendation-card__button'],
    ['event-card', '.event-card'],
    ['next-action-card', '.next-action-card']
  ]

  const pick = (style) => ({
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
    gridColumn: style.gridColumn,
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
    overflow: style.overflow
  })

  const result = selectors.map(([name, selector]) => {
    const el = document.querySelector(selector)
    if (!el) {
      return { name, selector, found: false }
    }

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
      computed: pick(style)
    }
  })

  const visibleText = {
    recommendation: document.querySelector('.as6-product-recommendation-card')?.innerText || null,
    button: document.querySelector('.as6-product-recommendation-card__button')?.innerText || null
  }

  return JSON.stringify({
    url: location.href,
    userAgent: navigator.userAgent,
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    },
    timestamp: new Date().toISOString(),
    visibleText,
    result
  }, null, 2)
})()
