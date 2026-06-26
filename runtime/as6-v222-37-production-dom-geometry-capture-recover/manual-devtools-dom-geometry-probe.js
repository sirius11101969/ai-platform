(() => {
  const selectors = [
    ['body','body'],['root','#root'],['main','.command-center-page'],
    ['mainGrid','.command-main-grid'],['core','.command-core'],
    ['rightRail','.command-right-rail'],['copilot','.copilot-hero'],
    ['slot','.as6-product-recommendation-slot-card'],
    ['card','.as6-product-recommendation-card'],
    ['summary','.as6-product-recommendation-card__summary'],
    ['action','.as6-product-recommendation-card__action'],
    ['button','.as6-product-recommendation-card__button'],
    ['event','.event-card'],['nextAction','.next-action-card']
  ];
  const pick = s => ({
    display:s.display, boxSizing:s.boxSizing, width:s.width, minWidth:s.minWidth,
    maxWidth:s.maxWidth, height:s.height, padding:s.padding, margin:s.margin,
    gridTemplateColumns:s.gridTemplateColumns, gridColumn:s.gridColumn,
    flex:s.flex, flexGrow:s.flexGrow, flexShrink:s.flexShrink, flexBasis:s.flexBasis,
    alignSelf:s.alignSelf, justifySelf:s.justifySelf, alignItems:s.alignItems,
    justifyContent:s.justifyContent, overflow:s.overflow
  });
  return JSON.stringify({
    url: location.href,
    viewport: { innerWidth, innerHeight, devicePixelRatio },
    timestamp: new Date().toISOString(),
    elements: selectors.map(([name, selector]) => {
      const el = document.querySelector(selector);
      if (!el) return { name, selector, found:false };
      const r = el.getBoundingClientRect();
      return {
        name, selector, found:true, tag:el.tagName, className:String(el.className || ''),
        dataset:{...el.dataset},
        rect:{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,left:r.left,right:r.right,bottom:r.bottom},
        metrics:{offsetWidth:el.offsetWidth,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,offsetHeight:el.offsetHeight,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight},
        computed:pick(getComputedStyle(el))
      };
    })
  }, null, 2);
})();
