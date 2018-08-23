import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker, { unregister } from './registerServiceWorker';
import './index.css';

window.generateAvatarLink = function (character) {
  let itemEntries = Object.values(character.selectedItems).map(c => { 
    return { 
      itemId: Number(c.id), 
      region: c.region || window.localStorage["region"], 
      version: c.version || window.localStorage["version"],
      hue: c.hue,
      brightness: c.brightness === undefined ? 1 : c.brightness,
      saturation: c.saturation === undefined ? 1 : c.saturation,
      contrast: c.contrast === undefined ? 1 : c.contrast,
      alpha: c.alpha === undefined ? 1 : c.alpha,
      animationName: c.itemId >= 20000 && c.itemId < 30000 ? character.emotion : character.action
    } 
  })

  let backgroundColor = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
  const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

  let itemEntriesPayload = JSON.stringify([
    ...itemEntries,
    { itemId: character.skin },
    { itemId: character.skin + 10000 }
  ])
  itemEntriesPayload = encodeURIComponent(itemEntriesPayload.substr(1, itemEntriesPayload.length - 2))
  return `https://maplestory.io/api/character/${itemEntriesPayload}/${character.action}/${character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')
}

const isOnDev = window.location.host.indexOf('.dev') !== -1
const isOnDomain = window.location.host.indexOf('.design') !== -1
const isOnHttps = window.location.protocol.indexOf('https') !== -1
if (isOnDomain && !isOnHttps)
  window.location.protocol = 'https'
else {
  ReactDOM.render(<App />, document.getElementById('root'));
  // if (!isOnDev) registerServiceWorker();
  unregister()
}
