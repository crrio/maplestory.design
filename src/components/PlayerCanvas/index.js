import React, { Component } from 'react'
import './index.css'
import Draggable from 'react-draggable'
import CharacterEntry from '../CharacterList/CharacterEntry'

class PlayerCanvas extends Component {
  render() {
    const { summary, onClick } = this.props
    return (
      <Draggable>
        <img src={summary} alt="character" onClick={onClick}/>
      </Draggable>
    )
  }
}

export default PlayerCanvas
