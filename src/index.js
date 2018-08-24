import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker, { unregister } from './registerServiceWorker';
import './index.css';

window.generateAvatarLink = function (character, linkType) {
  let itemEntries = Object.values(character.selectedItems).filter(item => item.id && (item.visible === undefined || item.visible)).map(item => { 
    return { 
      itemId: Number(item.id), 
      region: item.region || window.localStorage["region"], 
      version: item.version || window.localStorage["version"],
      hue: item.hue,
      brightness: item.brightness === undefined ? 1 : item.brightness,
      saturation: item.saturation === undefined ? 1 : item.saturation,
      contrast: item.contrast === undefined ? 1 : item.contrast,
      alpha: item.alpha === undefined ? 1 : item.alpha,
      animationName: (item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000) ? character.emotion : character.action
    } 
  })

  let backgroundColor = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
  const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

  let itemEntriesPayload = JSON.stringify([
    ...itemEntries,
    { itemId: Number(character.skin) },
    { itemId: Number(character.skin) + 10000 }
  ])
  itemEntriesPayload = encodeURIComponent(itemEntriesPayload.substr(1, itemEntriesPayload.length - 2))
  return `https://maplestory.io/api/character/${itemEntriesPayload}/${linkType ? linkType : (`${character.action}/${character.frame}`)}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')
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
