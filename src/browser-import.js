import Sprite from 'svg-baker-runtime/src/browser-sprite'
import SpriteSymbol from 'svg-baker-runtime/src/browser-symbol'

const spriteNodeId = '__SVG_SPRITE_NODE__'
const spriteGlobalVarName = '__SVG_SPRITE__'

const loadSprite = () => {
  /**
   * Check for page already contains sprite node
   * If found - attach to and reuse it's content
   * If not - render and mount the new sprite
   */
  const existing = document.getElementById(spriteNodeId)

  if (existing) {
    sprite.attach(existing)
  } else {
    sprite.mount(document.body, true)
  }
}

/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 */
const createDomReady = () => {
  var fns = [],
    listener,
    doc = document,
    hack = doc.documentElement.doScroll,
    domContentLoaded = 'DOMContentLoaded',
    loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)

  if (!loaded)
    doc.addEventListener(
      domContentLoaded,
      (listener = function () {
        doc.removeEventListener(domContentLoaded, listener)
        loaded = 1
        while ((listener = fns.shift())) listener()
      })
    )

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }
}

let sprite = new Sprite({
  attrs: {
    id: spriteNodeId,
    'aria-hidden': 'true'
  },
  autoConfigure: typeof document !== 'undefined',
  listenLocationChangeEvent: typeof window !== 'undefined'
})

const init = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  if (window[spriteGlobalVarName]) {
    sprite = window[spriteGlobalVarName]
  } else {
    window[spriteGlobalVarName] = sprite
  }

  if (document.body) {
    loadSprite()
  } else {
    createDomReady()(loadSprite)
  }
}

init()

export { sprite, SpriteSymbol }
