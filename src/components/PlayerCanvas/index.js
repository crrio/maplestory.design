import React, { Component } from 'react'
import './index.css'

class PlayerCanvas extends Component {
  render() {
    const { summary } = this.props

    return (
      <div className="canvas">
        <img src={summary} alt="character"/>
      </div>
    )
  }
}

export default PlayerCanvas
