import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'
import SuperSelect from 'react-super-select'

class CharacterList extends Component {
  render() {
    return (
      <div className='character-list'>
        <SuperSelect
            dataSource={_.concat(this.props.otherCharacters, {id: Date.now(), name: "Create New", create: true})}
            customOptionTemplateFunction={this.CharacterSummaryImg.bind(this)}
            customValueTemplateFunction={() => ("")}
            onChange={this.onChangeSelectedCharacter.bind(this)}
            />
      </div>
    )
  }

  onChangeSelectedCharacter(e) {
    this.props.onSelectedChanged(e);
  }

  CharacterSummaryImg(character) {
      return character.create ? ('Create New') : (<img src={character.summary} />)
  }
}

export default CharacterList
