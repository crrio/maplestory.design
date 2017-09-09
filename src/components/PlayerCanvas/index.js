import React, { Component } from 'react'
import './index.css'

class PlayerCanvas extends Component {
  render() {
    const { selectedItems, action, emotion, skin, mercEars, zoom } = this.props

    const itemsWithEmotion = selectedItems
      .filter(itemId => itemId)
      .map(itemId => itemId >= 20000 && itemId <= 29999 ? `${itemId}:${emotion}` : itemId)

    return (
      <div className="canvas">
        <img src={`https://labs.maplestory.io/api/gms/latest/character/center/${skin}/${(itemsWithEmotion.join(',') || 1102039)}/${action}?showears=${mercEars}&resize=${zoom}`} alt="character"/>
      </div>
    )
  }
}

export default PlayerCanvas
