import React, { Component } from 'react'
import './index.css'
import PlayerCanvas from '../PlayerCanvas'
import ItemListing from '../ItemListing'
import EquippedItems from '../EquippedItems'
import CharacterProperties from '../CharacterProperties'
import _ from 'lodash'
import IntroModal from '../IntroModal'

class App extends Component {
  constructor(props) {
    super(props)

    let isOpen = (localStorage || {})['hideModal'] !== 'true'
    if (isOpen === '' || isOpen === undefined || isOpen === 'undefined')
      isOpen = true

    this.state = {
      selectedItems: JSON.parse((localStorage || [])['selectedItems'] || '{}'),
      action: 'stand1',
      emotion: 'default',
      skin: Number(localStorage['skin']) || 2000,
      isModalOpen: isOpen,
      zoom: Number(localStorage['zoom']) || 1,
      mercEars: localStorage['mercEars'] == "true" || localStorage['mercEars'] === true,
      illiumEars: localStorage['illiumEars'] == "true" || localStorage['illiumEars'] === true
    }

    this.updateBannerAdBlur()
  }

  updateBannerAdBlur() {
    const topAd = document.getElementById("top-banner-ad")
    topAd.className = this.state.isModalOpen ? "modal-blur" : "";
  }

  render() {
    const { selectedItems, action, emotion, skin, isModalOpen, mercEars, illiumEars, zoom } = this.state
    this.updateBannerAdBlur()

    return (
      <div className={"App" + (isModalOpen ? ' modal-blur' : '')}>
        <div className="App-header">
          <span className="logo">
            <b>MapleStory:</b> Design<br/>
            <span className="desc"><span className="alpha">Public Alpha</span> </span>
          </span>
          <ul className="Nav-right">
            <li><a href="//medium.com/crrio/tagged/maplestory-design" target="_blank" rel="noopener noreferrer">Blog</a></li>
            <li><a href="https://discord.gg/D65Grk9" target="_blank" rel="noopener noreferrer">Discord</a></li>
          </ul>
        </div>
        <PlayerCanvas
          selectedItems={_.values(selectedItems).map(item => item.Id)}
          action={action}
          emotion={emotion}
          skin={skin}
          mercEars={mercEars}
          illiumEars={illiumEars}
          zoom={zoom} />
        <ItemListing onItemSelected={this.userSelectedItem.bind(this)} />
        <EquippedItems
          equippedItems={selectedItems}
          skinId={skin}
          onRemoveItem={this.userRemovedItem.bind(this)}
          mercEars={mercEars}
          illiumEars={illiumEars}
          onRemoveItems={this.userRemovedItems.bind(this)} />
        <CharacterProperties
          equippedItems={selectedItems}
          action={action}
          emotion={emotion}
          skin={skin}
          mercEars={mercEars}
          illiumEars={illiumEars}
          zoom={zoom}
          onChangeAction={this.userChangedAction.bind(this)}
          onChangeEmotion={this.userChangedEmotion.bind(this)}
          onChangeSkin={this.userChangedSkin.bind(this)}
          onChangeMercEars={this.userChangedMercEars.bind(this)}
          onChangeIlliumEars={this.userChangesIlliumEars.bind(this)}
          onChangeZoom={this.userChangedZoom.bind(this)} />
        <IntroModal
          isOpen={isModalOpen}
          onSetModalOpen={this.setModalOpen.bind(this)} />
      </div>
    )
  }

  setModalOpen (isModalOpen) {
    this.setState({ isModalOpen })
  }

  userChangesIlliumEars(illiumEars) {
    this.setState({ illiumEars });
    localStorage['illiumEars'] = illiumEars;
  }

  userChangedMercEars(mercEars) {
    this.setState({ mercEars });
    localStorage['mercEars'] = mercEars;
  }

  userChangedSkin (skin) {
    this.setState({ skin })
    localStorage['skin'] = skin
  }

  userChangedEmotion (emotion) {
    this.setState({ emotion })
    console.log('Changed emotion: ', emotion)
  }

  userChangedAction (action) {
    this.setState({ action })
    console.log('Changed action: ', action)
  }

  userChangedZoom (zoom) {
    this.setState({ zoom });
    console.log('Set zoom: ', zoom);
  }

  userSelectedItem (item) {
    let selectedItems = {
      ...this.state.selectedItems,
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
      ...this.state.selectedItems,
    }
    delete selectedItems[item.TypeInfo.SubCategory]
    this.updateItems(selectedItems);
  }

  userRemovedItems () {
    let selectedItems = {}
    this.updateItems(selectedItems);
  }

  updateItems (selectedItems) {
    console.log('New Items: ', selectedItems)
    this.setState({
      selectedItems
    })

    localStorage['selectedItems'] = JSON.stringify(selectedItems)
  }
}

export default App
