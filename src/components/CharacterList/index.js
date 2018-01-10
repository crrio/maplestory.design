import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'
import Toggle from 'react-toggle'
import { Tooltip } from 'react-tippy'
import CharacterEntry from './CharacterEntry'

class CharacterList extends Component {
  render() {
    const { characters, selectedCharacterIndex } = this.props
    return (
      <div className='character-list'>
        <div>
          {characters.map((c, i) =>
            <CharacterEntry
              character={c}
              isSelectedCharacter={i == selectedCharacterIndex}
              onClick={this.clickCharacter.bind(this, c)}
              onUpdateCharacter={this.props.onUpdateCharacter}
              onDeleteCharacter={this.props.onDeleteCharacter} />
          )}
          <div onClick={this.addCharacter.bind(this)} className='add-character'><span>+</span></div>
        </div>
      </div>
    )
  }

  addCharacter() {
    this.props.onAddCharacter()
  }

  clickCharacter(character, e) {
    if (e.target == e.currentTarget)
      this.props.onUpdateSelectedCharacter(character)
  }
}

export default CharacterList
