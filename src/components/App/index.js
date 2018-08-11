import React, { Component } from 'react'
import './index.css'
import ItemListing from '../ItemListing'
import EquippedItems from '../EquippedItems'
import CharacterProperties from '../CharacterProperties'
import _ from 'lodash'
import IntroModal from '../IntroModal'
import CharacterList from '../CharacterList'
import 'react-notifications/lib/notifications.css'
import {NotificationContainer, NotificationManager} from 'react-notifications'
import RenderCanvas from '../RenderCanvas'
import axios from 'axios'
import VirtualizedSelect from 'react-virtualized-select'
import 'react-select/dist/react-select.css'
import createFilterOptions from 'react-select-fast-filter-options'
import Slider from 'rc-slider'
import RcTooltip from 'rc-tooltip'
import { SketchPicker } from 'react-color'
import Localization from '../../const/localize'
import Localize from '../../const/localize'
import { Tooltip } from 'react-tippy'
import FontAwesome from 'react-fontawesome'
import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-tippy/dist/tippy.css';
import Toggle from 'react-toggle'

if (localStorage['initialized'] != '2') {
  localStorage['region'] = 'GMS'
  localStorage['version'] = 'latest'
  localStorage['initialized'] = '2'
}

if (!localStorage['language']) {
  if (navigator.language.startsWith('ko')) localStorage['language'] = 'kr'
  else if (navigator.language.startsWith('ja')) localStorage['language'] = 'jp'
  else if (navigator.language.startsWith('zh')) localStorage['language'] = 'ch'
  else if (navigator.language.startsWith('nl')) localStorage['language'] = 'nl'
  else if (navigator.language.startsWith('pt')) localStorage['language'] = 'br'
  else localStorage['language'] = 'en'
}

var creatingId = null
const throttledErrorNotification = _.throttle(NotificationManager.error.bind(NotificationManager), 1500, { leading:true })
let mapsIndexed = null
let versions = {
  GMS: [{region: 0, MapleVersionId: "latest", IsReady: true}], 
  KMS: [{region: 0, MapleVersionId: "latest", IsReady: true}], 
  CMS: [{region: 0, MapleVersionId: "latest", IsReady: true}], 
  JMS: [{region: 0, MapleVersionId: "latest", IsReady: true}], 
  SEA: [{region: 0, MapleVersionId: "latest", IsReady: true}]
}

const regionCodeToName = ['GMS', 'JMS', 'KMS', 'TMS', 'CMS', 'SEA'];

function toCamel(o) {
  var newO, origKey, newKey, value
  if (o instanceof Array) {
    return o.map(function(value) {
        if (typeof value === "object") {
          value = toCamel(value)
        }
        return value
    })
  } else {
    newO = {}
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
        value = o[origKey]
        if (value instanceof Array || (value !== null && value.constructor === Object)) {
          value = toCamel(value)
        }
        newO[newKey] = value
      }
    }
  }
  return newO
}

let wzPromise = axios.get(`https://maplestory.io/api/wz`)
.then(response => {
  let WZs = _.map(response.data.filter(wzEntry => wzEntry.isReady), wzEntry => {
    return {
      ...wzEntry,
      region: regionCodeToName[wzEntry.region]
    }
  })
  versions = _.groupBy(WZs, 'region')

  let region = localStorage['region'], version = localStorage['version']

  if (!region || (version != 'latest' && _.findIndex(versions[region], ver => ver.mapleVersionId == version) == -1)) {
    localStorage['region'] = 'GMS'
    localStorage['version'] = 'latest'
    window.location.reload()
  }

  console.log(versions);
  return versions;
})

let maps = []
let mapsFilter = null
let mapPromise = axios.get(`https://maplestory.io/api/${localStorage['region']}/${localStorage['version']}/map`).then(response => {
      maps = _.map(response.data, map => {
        return {
          label: [map.streetName, map.name].join(' - '),
          value: map.id
        }
      });
      mapsFilter = createFilterOptions({options: maps})
    });

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
      selectedIndex: JSON.parse(localStorage['selectedIndex'] || 'false') || 0,
      selectedMap: JSON.parse(localStorage['selectedMap'] || 'false') || null,
      zoom: JSON.parse(localStorage['zoom'] || 'false') || 1,
      mapPosition: {x: 0, y: 0},
      backgroundColor: JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"},
      colorPickerOpen: false,
      language: localStorage['language'] == 'undefined' ? 'en' : localStorage['language'],
      music: false,
      region: localStorage['region'] ? localStorage['region'] : 'GMS',
      version: localStorage['version'] ? localStorage['version'] : 'latest',
      versions
    }

    if (versions.GMS.length > 1)
      this.state.versions = versions
    else
      wzPromise.then(ver => this.setState({versions}))

    if (this.state.selectedIndex < 0) this.state.selectedIndex = false;
    this.state.focusRenderable = this.state.selectedIndex

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
      character.position = character.position || {x:0,y:0}
      character.flipX = character.flipX || false;
      character.name = character.name || '';
      character.includeBackground = character.includeBackground === undefined ? true : character.includeBackground
      character.selectedItems = _.keyBy(_.values(toCamel(character.selectedItems)), (item) => item.typeInfo.subCategory)
      const itemsWithEmotion = _.values(character.selectedItems)
      .filter(item => item.id && (item.visible === undefined || item.visible))
      .map(item => {
        var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${character.emotion}` : item.id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });

      const { backgroundColor } = this.state
      const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`
      character.summary = `https://maplestory.io/api/${this.state.region}/${this.state.version}/character${ character.animating ? '/animated/' : '/' }${character.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${character.action}/${character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')
      delete character.characters
      delete character.otherCharacters
      delete character.allCharacters
    })

    this.state.pets.forEach((pet, index) => {
      if (!pet.id) pet.id = Date.now() + (index + 1)
      pet.type = 'pet'
      pet.position = pet.position || { x: 0, y: 0}
      pet.summary = `https://maplestory.io/api/${this.state.region}/${this.state.version}/pet/${pet.petId}/${pet.animation || 'stand0'}/${pet.frame || 0}/${_.values(pet.selectedItems).map(item => item.id).join(',')}?resize=${pet.zoom || 1}`
    })

    if ((this.state.selectedIndex + 1) > (this.state.characters.length + this.state.pets.length) || !this.state.characters.length)
      this.state.selectedIndex = false;

    this.updateBannerAdBlur()

    document.addEventListener("click", this.handleClick.bind(this))

    if (maps.length) this.state.mapsLoaded = true
    else mapPromise.then(() => setTimeout(() => this.setState({mapsLoaded : true}), 250))
  }

  changeRegionVersion(region, version) {
    localStorage['region'] = region
    localStorage['version'] = version

    // Much easier than trying to reload everything here :D
    window.location.reload()
  }

  handleClick(e) {
    let element = e.target
    let found = false
    while (this.state.colorPickerOpen && !found && (element = element.parentElement) != null) {
      if (element.className != 'bg-color-picker-container') continue;
      else {
        found = true;
        console.log('found bg-color-picker-container')
      }
    }

    if (!found && this.state.colorPickerOpen) this.setState({ colorPickerOpen: false })
  }

  updateBannerAdBlur() {
    const topAd = document.getElementById("top-banner-ad")
    topAd.className = this.state.isModalOpen ? "modal-blur" : "";
  }

  render() {
    const {
      characters,
      pets,
      selectedIndex,
      isModalOpen,
      zoom,
      summary,
      selectedMap,
      focusRenderable,
      backgroundColor,
      colorPickerOpen,
      language,
      music
    } = this.state
    this.updateBannerAdBlur()

    const localized = Localize.getLocalized(language)

    const bgColorText = `rgba(${backgroundColor.rgb.r}, ${backgroundColor.rgb.g}, ${backgroundColor.rgb.b}, ${backgroundColor.rgb.a})`

    const renderables = characters.concat(pets)

    return (
      <div className={"App" + (isModalOpen ? ' modal-blur' : '')}>
        <div className="App-header">
          <span className="logo">
            <b>{localized.maplestory}:</b> {localized.design}<br/>
            <span className="desc"><span className="alpha">{localized.alpha}</span></span>
          </span>
          <ul className="Nav-right">
            <li className='settings-cog'><Tooltip html={this.renderSettings()} delay={[100, 300]} position={'top'} interactive={true} theme='light' arrow={true}><FontAwesome name='cog' /></Tooltip></li>
            <li><a href="//medium.com/crrio/tagged/maplestory-design" target="_blank" rel="noopener noreferrer">Blog</a></li>
            <li><a href="https://discord.gg/D65Grk9" target="_blank" rel="noopener noreferrer">Discord</a></li>
          </ul>
        </div>
        <RenderCanvas
          backgroundColor={bgColorText}
          zoom={zoom}
          mapId={selectedMap}
          renderables={renderables}
          selectedRenderable={selectedIndex}
          focusRenderable={focusRenderable === undefined ? selectedIndex : focusRenderable}
          onUpdateRenderable={this.updateRenderable.bind(this)}
          onClick={this.clickCanvas.bind(this)}
          localized={localized}
          onClickRenderable={this.userUpdateSelectedRenderable.bind(this)}/>
        { (selectedIndex !== false) ?
          <ItemListing
            target={renderables[selectedIndex]}
            onItemSelected={this.userSelectedItem.bind(this)}
            localized={localized} /> : '' }
        <CharacterList
          renderables={renderables}
          selectedIndex={selectedIndex}
          onAddCharacter={this.addCharacter.bind(this)}
          onAddPet={this.addPet.bind(this)}
          onDeleteCharacter={this.removeCharacter.bind(this)}
          onCloneCharacter={this.cloneCharacter.bind(this)}
          onDeletePet={this.removePet.bind(this)}
          localized={localized}
          onUpdateSelectedCharacter={function (renderable) {
            this.userUpdateSelectedRenderable(renderable, () => {
              this.setState({
                focusRenderable: this.state.selectedIndex
              })
            })
          }.bind(this)}
          onUpdateCharacter={this.userUpdateCharacter.bind(this)}
          onUpdatePet={this.userUpdatePet.bind(this) }/>
        {
          (selectedIndex !== false && !_.isEmpty(renderables[selectedIndex].selectedItems) ? <EquippedItems
            equippedItems={renderables[selectedIndex].selectedItems}
            onRemoveItem={this.userRemovedItem.bind(this)}
            name={renderables[selectedIndex].name}
            skinId={renderables[selectedIndex].skin}
            onUpdateItem={this.updateItem.bind(this)}
            localized={localized}
            onRemoveItems={this.userRemovedItems.bind(this)} /> : '')
        }
        <div className="disclaimer"><div>{localized.prototype}</div></div>
        <IntroModal
          isOpen={isModalOpen}
          localized={localized}
          onSetModalOpen={this.setModalOpen.bind(this)} />
        <NotificationContainer />
        { music ? <audio src={`//maplestory.io/api/${this.state.region}/${this.state.version}/map/${selectedMap}/bgm`} autoPlay={true} loop={true} /> : '' }
      </div>
    )
  }

  renderSettings() {
    const {
      characters,
      pets,
      selectedIndex,
      isModalOpen,
      zoom,
      summary,
      selectedMap,
      focusRenderable,
      backgroundColor,
      colorPickerOpen,
      language
    } = this.state
    this.updateBannerAdBlur()

    const localized = Localize.getLocalized(language)

    const bgColorText = `rgba(${backgroundColor.rgb.r}, ${backgroundColor.rgb.g}, ${backgroundColor.rgb.b}, ${backgroundColor.rgb.a})`
    return (
      <div className='settings-container'>
        <label className='bg-color-picker-container' onClick={this.openColorPicker.bind(this)}>
        Background color
          <div className='bg-color-picker'>
            <div className='bg-color-grid' style={{ backgroundColor: bgColorText }}></div>
          </div>
          { colorPickerOpen ? <SketchPicker color={bgColorText} onChange={this.onChangeColor.bind(this)} /> : '' }
        </label>
        <label className='canvas-zoom'>
          <span>{localized.zoom}</span>
          <Slider
            value={zoom || 1}
            min={0.25}
            max={2}
            step={0.25}
            handle={handle}
            onChange={this.changeZoom.bind(this)} />
        </label>
        <label className='canvas-zoom'>
          <span>{localized.language}</span>
          <select value={this.state.language} onChange={this.changeLanguage.bind(this)}>
            <option value='en'>English</option>
            <option value='jp'>Japanese</option>
            <option value='kr'>Korean</option>
            <option value='ch'>Chinese (Traditional)</option>
            <option value='nl'>Dutch</option>
            <option value='br'>Portuguese (Brazil)</option>
          </select>
        </label>
        <div>
          <div className='map-select-container'>
            <VirtualizedSelect
              filterOptions={mapsFilter}
              isLoading={maps.length === 0}
              name='map-selection'
              searchable
              clearable
              simpleValue
              value={selectedMap}
              onChange={this.selectMap.bind(this)}
              options={maps}
              maxHeight={400}
              styles={{
                menuList: (styles, {data}) => {
                  return {
                    ...styles,
                    height: '400px'
                  }
                },
                menu: (styles, {data}) => {
                  return {
                    ...styles,
                    height: '400px'
                  }
                }
              }}
              />
          </div>
        </div>
        <label>
          <span>{localized.region}</span>
          <select value={this.state.region} onChange={(e) => this.changeRegionVersion(e.target.value, "latest")}>
            { _.keys(this.state.versions).map(versionName => <option value={versionName} key={versionName}>{versionName}</option>) }
          </select>
        </label>
        <label>
          <span>{localized.version}</span>
          <select value={this.state.version} onChange={(e) => this.changeRegionVersion(this.state.region, e.target.value)}>
            { this.state.versions[this.state.region].map(({mapleVersionId}) => <option value={mapleVersionId} key={mapleVersionId}>{mapleVersionId}</option>) }
            <option value='latest' key='latest'>latest</option>
          </select>
        </label>
        <label>
          <span>{localized.playMusic}</span>
          <Toggle
            onChange={this.toggleMusic.bind(this)}
            checked={this.state.music} />
        </label>
      </div>
    )
  }

  toggleMusic(e) {
    this.setState({
      music: !this.state.music
    })
  }

  changeLanguage(e) {
    this.setState({
      language: e.target.value
    })
    localStorage['language'] = e.target.value
  }

  changeZoom(newZoom) {
    this.setState({ zoom: newZoom })
    localStorage['zoom'] = newZoom
  }

  selectMap(mapId) {
    this.setState({
      selectedMap: mapId
    })
    localStorage['selectedMap'] = mapId
  }

  updateRenderable(renderable, newProps) {
    if (renderable.type == 'pet') this.userUpdatePet(renderable, newProps)
    if (renderable.type == 'character' || renderable.type === undefined) this.userUpdateCharacter(renderable, newProps)
  }

  clickCanvas(e) {
    if (e.target === e.currentTarget && (this.state.characters.length + this.state.pets.length) > 1) {
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
    this.setState({ pets, selectedIndex: false, zoom: 1 }) // Unselect any pet in case we delete the last pet
    localStorage['pets'] = JSON.stringify(pets)
    localStorage['selectedIndex'] = false
    localStorage['zoom'] = 1
  }

  getNewPet() {
    const andysFavePetIds = [5000000, 5000001, 5000002, 5000003, 5000004, 5000005]
    const petId = andysFavePetIds[Math.floor(Math.random() * andysFavePetIds.length)]
    return {
      petId,
      selectedItems: [],
      id: Date.now(),
      type: 'pet',
      summary: `https://maplestory.io/api/${this.state.region}/${this.state.version}/pet/${petId}/stand0`,
      animation: 'stand0',
      visible: true,
      frame: 0,
      zoom: 1,
      fhSnap: true,
      position: { x:0, y:0 }
    }
  }

  addCharacter() {
    var characters = [ ...this.state.characters, this.getNewCharacter() ]
    this.setState({ characters, selectedIndex: this.state.characters.length })
    localStorage['characters'] = JSON.stringify(characters)
  }

  removeCharacter(character) {
    var characters = this.state.characters.filter(c => c != character)
    this.setState({ characters, selectedIndex: false, zoom: 1 }) // Unselect any character in case we delete the last character
    localStorage['characters'] = JSON.stringify(characters)
    localStorage['selectedIndex'] = false
    localStorage['zoom'] = 1
  }

  cloneCharacter(character) {
    let characters = [
      ...this.state.characters
    ]

    let indexOfCharacter = characters.indexOf(character)
    characters.splice(indexOfCharacter + 1, 0, { 
      ...character, 
      id: Date.now(),
      position: {
        x: character.position.x + 100,
        y: character.position.y
      }
    })
    let newCharacterIndex = indexOfCharacter + 1

    this.setState({ characters, selectedIndex: newCharacterIndex, focusRenderable: newCharacterIndex + 1 })
    localStorage['selectedIndex'] = newCharacterIndex
    localStorage['characters'] = JSON.stringify(characters)
  }

  userUpdateSelectedRenderable(renderable, callback) {
    let selectedIndex = this.state.characters.indexOf(renderable)
    if (selectedIndex == -1) {
      selectedIndex = this.state.pets.indexOf(renderable)
      if (selectedIndex != -1) selectedIndex += this.state.characters.length
    }
    this.setState({
      selectedIndex,
      zoom: 1
    }, callback)
    localStorage['selectedIndex'] = selectedIndex
    localStorage['zoom'] = 1
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

    currentPet.summary = `https://maplestory.io/api/${this.state.region}/${this.state.version}/pet/${currentPet.petId}/${currentPet.animation || 'stand0'}/${currentPet.frame || 0}/${_.values(currentPet.selectedItems).map(item => item.id).join(',')}?resize=${currentPet.zoom || 1}`

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
      .filter(item => item.id && (item.visible === undefined || item.visible))
      .map(item => {
        var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${currentCharacter.emotion}` : item.id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });

    const { backgroundColor } = this.state
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

    currentCharacter.summary = `https://maplestory.io/api/${this.state.region}/${this.state.version}/character${ currentCharacter.animating ? '/animated/' : '/' }${currentCharacter.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${currentCharacter.action}/${currentCharacter.frame}?showears=${currentCharacter.mercEars}&showLefEars=${currentCharacter.illiumEars}&resize=${currentCharacter.zoom}&name=${encodeURI(character.name || '')}&flipX=${currentCharacter.flipX}` + (currentCharacter.includeBackground ? `&bgColor=${bgColorText}` : '')

    this.setState({
        characters: characters
    })
    localStorage['characters'] = JSON.stringify(characters)
  }

  getNewCharacter() {
    return {
      id: Date.now(),
      type: 'character',
      action: 'stand1',
      emotion: 'default',
      skin: 2000,
      zoom: 1,
      frame: 0,
      mercEars: false,
      illiumEars: false,
      selectedItems: [],
      visible: true,
      position: {x: 0, y: 0},
      fhSnap: true,
      summary: `https://maplestory.io/api/${this.state.region}/${this.state.version}/character/2000/1102039/stand1/0?showears=false&showLefEars=false&resize=1`,
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

    if (item.typeInfo) {
      if (item.typeInfo.subCategory === 'Overall') {
        delete selectedItems['Top']
        delete selectedItems['Bottom']
      }
    }

    if (item.similar) {
      item = { ...item }
      delete item['similar']
    }

    if (item.typeInfo) {
      selectedItems[item.typeInfo.subCategory] = item
    }
    this.updateItems(selectedItems)
  }

  userRemovedItem (item) {
    let selectedItems = {
      ...this.state.characters[this.state.selectedIndex].selectedItems,
    }
    delete selectedItems[item.typeInfo.subCategory]
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
    selectedItems[item.typeInfo.subCategory] = {
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

  onChangeColor(backgroundColor, event) {
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`

    const characters = this.state.characters.map((character, index) => {
      const itemsWithEmotion = _.values(character.selectedItems)
      .filter(item => item.id && (item.visible === undefined || item.visible))
      .map(item => {
        var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${character.emotion}` : item.id
        if (item.hue) itemEntry = itemEntry + ';' + item.hue
        return itemEntry
      });

      return {
        ...character,
        summary: `https://maplestory.io/api/${this.state.region}/${this.state.version}/character${ character.animating ? '/animated/' : '/' }${character.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${character.action}/${character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')
      }
    });

    this.setState({ backgroundColor, characters })
    localStorage['backgroundColor'] = JSON.stringify(backgroundColor)
  }

  openColorPicker() {
    this.setState({ colorPickerOpen: true })
  }
}

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <RcTooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      style={{border: "solid 2px hsl("+value+", 53%, 53%)"}}
      key={index}
    >
      <Handle value={value} {...restProps} />
    </RcTooltip>
  );
};

export default App
