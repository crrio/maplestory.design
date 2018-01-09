import React, { Component } from 'react'
import './index.css'

class PlayerCanvas extends Component {
  render() {
    const { selectedItems, action, emotion, skin, mercEars, illiumEars, zoom, frame } = this.props

    const itemsWithEmotion = selectedItems
      .filter(item => item.Id)
      .map(item => {
        var itemEntry = item.Id >= 20000 && item.Id <= 29999 ? `${item.Id}:${emotion}` : item.Id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });

    return (
      <div className="canvas">
        <img src={`https://labs.maplestory.io/api/gms/latest/character/center/${skin}/${(itemsWithEmotion.join(',') || 1102039)}/${action}/${frame}?showears=${mercEars}&showLefEars=${illiumEars}&resize=${zoom}`} alt="character"/>
      </div>
    )
  }
}

export default PlayerCanvas
