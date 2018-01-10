import React, { Component } from 'react'
import './index.css'
import PlayerCanvas from '../PlayerCanvas'
import ItemListing from '../ItemListing'
import EquippedItems from '../EquippedItems'
import CharacterProperties from '../CharacterProperties'
import _ from 'lodash'
import IntroModal from '../IntroModal'
import CharacterList from '../CharacterList'

var creatingId = null;

class App extends Component {
  constructor(props) {
    super(props)

    let isOpen = (localStorage || {})['hideModal'] !== 'true'
    if (isOpen === '' || isOpen === undefined || isOpen === 'undefined')
      isOpen = true

    // Try to recover any existing state
    this.state = {
      selectedItems: JSON.parse((localStorage || [])['selectedItems'] || '{}'),
      skin: Number(localStorage['skin']) || 2000,
      isModalOpen: isOpen,
      zoom: Number(localStorage['zoom']) || 1,
      frame: Number(localStorage['frame']) || 0,
      mercEars: localStorage['mercEars'] == "true" || localStorage['mercEars'] === true,
      illiumEars: localStorage['illiumEars'] == "true" || localStorage['illiumEars'] === true,
      characters: JSON.parse(localStorage['characters'] || 'false') || [false],
      selectedCharacterIndex: JSON.parse(localStorage['selectedCharacterIndex'] || 'false') || 0
    }

    // If we have a legacy character, upgrade to latest now
    if (!_.isEmpty(this.state.selectedItems)) {
      const currentCharacter = {
        selectedItems: this.state.selectedItems,
        skin: this.state.skin || 2000
      }
      if (this.state.characters[0] === false)
        this.state.characters[0] = currentCharacter;
      else
        this.state.characters.push(currentCharacter)
    }

    // If we have no characters at all, gen a new shell
    if (this.state.characters[0] === false)
      this.state.characters[0] = this.getNewCharacter()

    delete localStorage['selectedItems'];
    delete localStorage['skin'];
    delete localStorage['zoom'];
    delete localStorage['frame'];
    delete localStorage['mercEars'];
    delete localStorage['illiumEars'];

    if (localStorage['currentCharacter']) {
      this.state = JSON.parse(localStorage['currentCharacter'])
      delete localStorage['currentCharacter']
      localStorage['characters'] = JSON.stringify([...this.state.characters, this.state])
      this.state['characters'] = [...this.state.characters, this.state]
    }

    this.state.characters.forEach((character, index) => {
      if (!character.id) character.id = Date.now() + (index + 1)
      delete character.characters
      delete character.otherCharacters
      delete character.allCharacters
    })

    this.updateBannerAdBlur()
  }

  updateBannerAdBlur() {
    const topAd = document.getElementById("top-banner-ad")
    topAd.className = this.state.isModalOpen ? "modal-blur" : "";
  }

  render() {
    const { characters, selectedCharacterIndex, selectedItems, action, emotion, skin, isModalOpen, mercEars, illiumEars, zoom, frame, summary } = this.state
    this.updateBannerAdBlur()

    return (
      <div className={"App" + (isModalOpen ? ' modal-blur' : '')}>
        <div className="App-header">
          <span className="logo">
            <b>MapleStory:</b> Design<br/>
            <span className="desc"><span className="alpha">Public Alpha</span></span>
          </span>
          <ul className="Nav-right">
            <li><a href="//medium.com/crrio/tagged/maplestory-design" target="_blank" rel="noopener noreferrer">Blog</a></li>
            <li><a href="https://discord.gg/D65Grk9" target="_blank" rel="noopener noreferrer">Discord</a></li>
          </ul>
        </div>
        <div className='canvas-characters' onClick={this.clickCanvas.bind(this)}>
          {
            characters
              .filter(character => character.visible)
              .map(character => {
                return (<PlayerCanvas summary={character.summary} key={'canvas' + character.id} onClick={this.userUpdateSelectedCharacter.bind(this, character)} />)
              })
          }
        </div>
        { (selectedCharacterIndex !== false) ? <ItemListing onItemSelected={this.userSelectedItem.bind(this)} /> : '' }
        <CharacterList
          characters={characters}
          selectedCharacterIndex={selectedCharacterIndex}
          onAddCharacter={this.addCharacter.bind(this)}
          onDeleteCharacter={this.removeCharacter.bind(this)}
          onUpdateSelectedCharacter={this.userUpdateSelectedCharacter.bind(this)}
          onUpdateCharacter={this.userUpdateCharacter.bind(this)} />
        {
          (selectedCharacterIndex !== false && !_.isEmpty(characters[selectedCharacterIndex].selectedItems) ? <EquippedItems
            equippedItems={characters[selectedCharacterIndex].selectedItems}
            skinId={characters[selectedCharacterIndex].skin}
            onRemoveItem={this.userRemovedItem.bind(this)}
            mercEars={characters[selectedCharacterIndex].mercEars}
            illiumEars={characters[selectedCharacterIndex].illiumEars}
            onRemoveItems={this.userRemovedItems.bind(this)}
            onUpdateItemHue={this.updateItemHue.bind(this)} /> : '')
        }
        <div className="disclaimer"><div>This project is actively being developed and considered a <b>prototype</b>.</div></div>
        <IntroModal
          isOpen={isModalOpen}
          onSetModalOpen={this.setModalOpen.bind(this)} />
      </div>
    )
  }

  clickCanvas(e) {
    if (e.target == e.currentTarget && this.state.characters.length > 1) {
      this.setState({ selectedCharacterIndex: false })
      localStorage['selectedCharacterIndex'] = 'false'
    }
  }

  addCharacter() {
    var characters = [ ...this.state.characters, this.getNewCharacter() ]
    this.setState({ characters })
    localStorage['characters'] = JSON.stringify(characters)
  }

  removeCharacter(character) {
    var characters = this.state.characters.filter(c => c != character)
    this.setState({ characters, selectedCharacterIndex: 0 })
    localStorage['characters'] = JSON.stringify(characters)
  }

  userUpdateSelectedCharacter(character) {
    const selectedCharacterIndex = this.state.characters.indexOf(character)
    this.setState({
      selectedCharacterIndex
    })
    localStorage['selectedCharacterIndex'] = selectedCharacterIndex
  }

  userUpdateCharacter(character, newProps) {
    const characters = [...this.state.characters]
    const characterIndex = characters.indexOf(character)

    const currentCharacter = characters[characterIndex] = {
      ...character,
      ...newProps
    }

    const itemsWithEmotion = _.values(currentCharacter.selectedItems)
      .filter(item => item.Id)
      .map(item => {
        var itemEntry = item.Id >= 20000 && item.Id <= 29999 ? `${item.Id}:${currentCharacter.emotion}` : item.Id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });
    currentCharacter.summary = `https://labs.maplestory.io/api/gms/latest/character/${currentCharacter.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${currentCharacter.action}/${currentCharacter.frame}?showears=${currentCharacter.mercEars}&showLefEars=${currentCharacter.illiumEars}&resize=${currentCharacter.zoom}`

    this.setState({
        characters: characters
    })
    localStorage['characters'] = JSON.stringify(characters)
  }

  getNewCharacter() {
    return {
      id: Date.now(),
      action: 'stand1',
      emotion: 'default',
      skin: 2000,
      zoom: 1,
      frame: 0,
      mercEars: false,
      illiumEars: false,
      selectedItems: [],
      visible: true,
      summary: `https://labs.maplestory.io/api/gms/latest/character/2000/1102039/stand1/0?showears=false&showLefEars=false&resize=1`
    }
  }

  updateCurrentCharacter(props) {
    this.userUpdateCharacter(this.state.characters[this.state.selectedCharacterIndex], props)
  }

  setModalOpen (isModalOpen) {
    this.setState({ isModalOpen })
  }

  userSelectedItem (item) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedCharacterIndex].selectedItems,
    }

    if (item.TypeInfo.SubCategory === 'Overall') {
      delete selectedItems['Top']
      delete selectedItems['Bottom']
    }

    if (item.similar) {
      item = { ...item }
      delete item['similar']
    }

    selectedItems[item.TypeInfo.SubCategory] = item
    this.updateItems(selectedItems)
  }

  userRemovedItem (item) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedCharacterIndex].selectedItems,
    }
    delete selectedItems[item.TypeInfo.SubCategory]
    this.updateItems(selectedItems);
  }

  userRemovedItems () {
    let selectedItems = {}
    this.updateItems(selectedItems);
  }

  updateItemHue (item, newHue) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedCharacterIndex].selectedItems,
    }
    selectedItems[item.TypeInfo.SubCategory] = {
      ...item,
      hue: newHue
    }
    this.updateItems(selectedItems);
  }

  updateItems (selectedItems) {
    console.log('New Items: ', selectedItems)
    this.updateCurrentCharacter({
      selectedItems
    })
  }
}

export default App
