import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'
import Toggle from 'react-toggle'
import { Tooltip } from 'react-tippy'
import CharacterEntry from './CharacterEntry'
import PetEntry from './PetEntry'

class CharacterList extends Component {
  render() {
    const { renderables, selectedIndex, localized } = this.props
    return (
      <div className='character-list'>
        <div>
          {renderables.map((c, i) => {
            if (c.type === undefined || c.type == 'character') {
              return (<CharacterEntry
                character={c}
                isSelected={i == selectedIndex}
                onClick={this.clickCharacter.bind(this, c)}
                onUpdateCharacter={this.props.onUpdateCharacter}
                key={'character' + i}
                localized={localized}
                onClone={this.props.onCloneCharacter}
                onDeleteCharacter={this.props.onDeleteCharacter} />)
            } else if (c.type == 'pet') {
              return (<PetEntry
                  pet={c}
                  isSelected={i == selectedIndex}
                  key={'pet' + i}
                  localized={localized}
                  onClick={this.clickCharacter.bind(this, c)}
                  onUpdatePet={this.props.onUpdatePet}
                  onDeletePet={this.props.onDeletePet}
                />);
            }
          })}
          <Tooltip html={this.renderAddList()} position='top' theme='light' title="Create a new.." interactive={true}>
            <div className='add'><span>+</span>
          </div></Tooltip>
          <input type='file' id='importFile' style={{display: 'none'}} onChange={this.props.onImportCharacter.bind(this)} multiple />
        </div>
      </div>
    )
  }

  renderAddList() {
    return (<ul className='add-possible'>
      <li className='add-title'>Create a new..</li>
      <li className='clickable' onClick={this.props.onAddCharacter}>{this.props.localized.character}</li>
      <li className='clickable' onClick={this.props.onAddPet}>{this.props.localized.pet}</li>
      <li className='clickable bold' onClick={this.onOpenImportCharacter}>{this.props.localized.importCharacter}</li>
    </ul>);
  }

  onOpenImportCharacter() {
    document.getElementById('importFile').click()
  }

  clickCharacter(character, e) {
    if (e.target == e.currentTarget)
      this.props.onUpdateSelectedCharacter(character)
  }
}

export default CharacterList
