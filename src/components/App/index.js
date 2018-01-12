import React, { Component } from 'react'
import './index.css'
import ItemListing from '../ItemListing'
import EquippedItems from '../EquippedItems'
import CharacterProperties from '../CharacterProperties'
import _ from 'lodash'
import IntroModal from '../IntroModal'
import CharacterList from '../CharacterList'
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import RenderCanvas from '../RenderCanvas'

var creatingId = null;

const throttledErrorNotification = _.throttle(NotificationManager.error.bind(NotificationManager), 1500, { leading:true })

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
      pets: JSON.parse(localStorage['pets'] || 'false') || [],
      selectedIndex: JSON.parse(localStorage['selectedIndex'] || 'false') || 0
    }

    if (this.state.selectedIndex < 0) this.state.selectedIndex = false;

    // If we have a legacy character, upgrade to latest now
    if (!_.isEmpty(this.state.selectedItems || {})) {
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
      character.type = 'character'
      character.action = character.action || 'stand1'
      character.frame = character.frame || 0
      character.zoom = character.zoom || 1
      character.emotion = character.emotion || 'default'
      character.skin = character.skin || 2000
      character.mercEars = character.mercEars || false
      character.illiumEars = character.illiumEars || false
      character.selectedItems = character.selectedItems || []
      character.visible = character.visible || false
      const itemsWithEmotion = _.values(character.selectedItems)
      .filter(item => item.Id && (item.visible === undefined || item.visible))
      .map(item => {
        var itemEntry = item.Id >= 20000 && item.Id <= 29999 ? `${item.Id}:${character.emotion}` : item.Id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });
      character.summary = `https://labs.maplestory.io/api/gms/latest/character/${character.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${character.action}/${character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}`
      delete character.characters
      delete character.otherCharacters
      delete character.allCharacters
    })

    this.state.pets.forEach((pet, index) => {
      if (!pet.id) pet.id = Date.now() + (index + 1)
      pet.type = 'pet'
      pet.summary = `https://labs.maplestory.io/api/gms/latest/pet/${pet.petId}/${pet.animation || 'stand0'}/${pet.frame || 0}/${_.values(pet.selectedItems).map(item => item.Id).join(',')}?resize=${pet.zoom || 1}`
    })

    if ((this.state.selectedIndex + 1) > (this.state.characters.length + this.state.pets.length) || !this.state.characters.length)
      this.state.selectedIndex = false;

    this.updateBannerAdBlur()
  }

  updateBannerAdBlur() {
    const topAd = document.getElementById("top-banner-ad")
    topAd.className = this.state.isModalOpen ? "modal-blur" : "";
  }

  render() {
    const { characters, pets, selectedIndex, selectedItems, action, emotion, skin, isModalOpen, mercEars, illiumEars, zoom, frame, summary } = this.state
    this.updateBannerAdBlur()

    const renderables = characters.concat(pets)

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
        <RenderCanvas
          renderables={renderables}
          selectedRenderable={selectedIndex}
          onUpdateRenderable={this.updateRenderable.bind(this)}
          onClick={this.clickCanvas.bind(this)}
          onClickRenderable={this.userUpdateSelectedRenderable.bind(this)}/>
        { (selectedIndex !== false) ? <ItemListing target={renderables[selectedIndex]} onItemSelected={this.userSelectedItem.bind(this)} /> : '' }
        <CharacterList
          renderables={renderables}
          selectedIndex={selectedIndex}
          onAddCharacter={this.addCharacter.bind(this)}
          onAddPet={this.addPet.bind(this)}
          onDeleteCharacter={this.removeCharacter.bind(this)}
          onDeletePet={this.removePet.bind(this)}
          onUpdateSelectedCharacter={this.userUpdateSelectedRenderable.bind(this)}
          onUpdateCharacter={this.userUpdateCharacter.bind(this)}
          onUpdatePet={this.userUpdatePet.bind(this) }/>
        {
          (selectedIndex !== false && !_.isEmpty(renderables[selectedIndex].selectedItems) ? <EquippedItems
            equippedItems={renderables[selectedIndex].selectedItems}
            onRemoveItem={this.userRemovedItem.bind(this)}
            onUpdateItem={this.updateItem.bind(this)}
            onRemoveItems={this.userRemovedItems.bind(this)} /> : '')
        }
        <div className="disclaimer"><div>This project is actively being developed and considered a <b>prototype</b>.</div></div>
        <IntroModal
          isOpen={isModalOpen}
          onSetModalOpen={this.setModalOpen.bind(this)} />
        <NotificationContainer />
      </div>
    )
  }

  updateRenderable(renderable, newProps) {
    if (renderable.type == 'pet') this.userUpdatePet(renderable, newProps)
    if (renderable.type == 'character') this.userUpdateCharacter(renderable, newProps)
  }

  clickCanvas(e) {
    if (e.target == e.currentTarget && (this.state.characters.length + this.state.pets.length) > 1) {
      this.setState({ selectedIndex: false })
      localStorage['selectedIndex'] = 'false'
    }
  }

  addPet() {
    var pets = [...(this.state.pets || []), this.getNewPet()]
    this.setState({pets, selectedIndex: this.state.characters.length + this.state.pets.length})
    localStorage['pets'] = JSON.stringify(pets)
  }

  removePet(pet) {
    var pets = this.state.pets.filter(c => c != pet)
    this.setState({ pets, selectedIndex: false }) // Unselect any pet in case we delete the last pet
    localStorage['pets'] = JSON.stringify(pets)
  }

  getNewPet() {
    const andysFavePetIds = [5000000, 5000001, 5000002, 5000003, 5000004, 5000005]
    const petId = andysFavePetIds[Math.floor(Math.random() * andysFavePetIds.length)]
    return {
      petId,
      selectedItems: [],
      id: Date.now(),
      type: 'pet',
      summary: `https://labs.maplestory.io/api/gms/latest/pet/${petId}/stand0`,
      animation: 'stand0',
      visible: true,
      frame: 0,
      zoom: 1
    }
  }

  addCharacter() {
    var characters = [ ...this.state.characters, this.getNewCharacter() ]
    this.setState({ characters, selectedIndex: this.state.characters.length })
    localStorage['characters'] = JSON.stringify(characters)
  }

  removeCharacter(character) {
    var characters = this.state.characters.filter(c => c != character)
    this.setState({ characters, selectedIndex: false }) // Unselect any character in case we delete the last character
    localStorage['characters'] = JSON.stringify(characters)
  }

  userUpdateSelectedRenderable(renderable) {
    let selectedIndex = this.state.characters.indexOf(renderable)
    if (selectedIndex == -1) {
      selectedIndex = this.state.pets.indexOf(renderable)
      if (selectedIndex != -1) selectedIndex += this.state.characters.length
    }
    this.setState({
      selectedIndex
    })
    localStorage['selectedIndex'] = selectedIndex
  }

  userUpdatePet(pet, newProps) {
    if (pet.locked === true && newProps.locked === undefined) {
      throttledErrorNotification('Pet is locked and can not be modified', '', 1000)
      return;
    }

    const pets = [...this.state.pets]
    const petIndex = pets.indexOf(pet)

    const currentPet = pets[petIndex] = {
      ...pet,
      ...newProps
    }

    currentPet.summary = `https://labs.maplestory.io/api/gms/latest/pet/${currentPet.petId}/${currentPet.animation || 'stand0'}/${currentPet.frame || 0}/${_.values(currentPet.selectedItems).map(item => item.Id).join(',')}?resize=${currentPet.zoom || 1}`

    this.setState({
        pets: pets
    })
    localStorage['pets'] = JSON.stringify(pets)
  }

  userUpdateCharacter(character, newProps) {
    if (character.locked === true && newProps.locked === undefined) {
      throttledErrorNotification('Character is locked and can not be modified', '', 1000)
      return;
    }

    const characters = [...this.state.characters]
    const characterIndex = characters.indexOf(character)

    const currentCharacter = characters[characterIndex] = {
      ...character,
      ...newProps
    }

    const itemsWithEmotion = _.values(currentCharacter.selectedItems)
      .filter(item => item.Id && (item.visible === undefined || item.visible))
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

  updateSelectedRenderable(props) {
    if (this.state.selectedIndex+1 > this.state.characters.length)
      this.userUpdatePet(this.state.pets[this.state.selectedIndex - this.state.characters.length], props)
    else
      this.userUpdateCharacter(this.state.characters[this.state.selectedIndex], props)
  }

  setModalOpen (isModalOpen) {
    this.setState({ isModalOpen })
  }

  userSelectedItem (item) {
    let selectedRenderable = null
    if (this.state.selectedIndex+1 > this.state.characters.length) selectedRenderable = this.state.pets[this.state.selectedIndex - this.state.characters.length]
    else selectedRenderable = this.state.characters[this.state.selectedIndex]

    let selectedItems = {
      ...selectedRenderable.selectedItems,
    }

    if (item.TypeInfo) {
      if (item.TypeInfo.SubCategory === 'Overall') {
        delete selectedItems['Top']
        delete selectedItems['Bottom']
      }
    }

    if (item.similar) {
      item = { ...item }
      delete item['similar']
    }

    if (item.TypeInfo) {
      selectedItems[item.TypeInfo.SubCategory] = item
    }
    this.updateItems(selectedItems)
  }

  userRemovedItem (item) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedIndex].selectedItems,
    }
    delete selectedItems[item.TypeInfo.SubCategory]
    this.updateItems(selectedItems);
  }

  userRemovedItems () {
    let selectedItems = {}
    this.updateItems(selectedItems);
  }

  updateItem (item, newProps) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedIndex].selectedItems,
    }
    selectedItems[item.TypeInfo.SubCategory] = {
      ...item,
      ...newProps
    }
    this.updateItems(selectedItems);
  }

  updateItems (selectedItems) {
    console.log('New Items: ', selectedItems)
    this.updateSelectedRenderable({
      selectedItems
    })
  }
}

export default App
