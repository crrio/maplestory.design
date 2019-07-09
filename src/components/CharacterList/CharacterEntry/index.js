import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'
import Toggle from 'react-toggle'
import { Tooltip } from 'react-tippy'
import axios from 'axios'
import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-tippy/dist/tippy.css';
import RcTooltip from 'rc-tooltip'
import Slider from 'rc-slider'

class CharacterEntry extends Component {
  constructor(props) {
    super(props)
    this.state = {
      actions: ['stand1', 'stand2'],
      emotions: [
        'angry',
        'bewildered',
        'blaze',
        'blink',
        'bowing',
        'cheers',
        'chu',
        'cry',
        'dam',
        'default',
        'despair',
        'glitter',
        'hit',
        'hot',
        'hum',
        'love',
        'oops',
        'pain',
        'qBlue',
        'shine',
        'smile',
        'stunned',
        'troubled',
        'vomit',
        'wink'
      ],
      frames: { stand1: 3, stand2: 3 },
      frameDelay: 1000
    }

    this.updateCharacterDetails(props, true)
  }

  componentDidUpdate(prevProps) {
    const ifChanged = ['skin', 'selectedItems', 'action', 'frame', 'mercEars', 'illiumEars', 'zoom', 'flipX']
    if (_.find(ifChanged, (property) => this.props.character[property] != prevProps.character[property])){
      this.updateCharacterDetails(this.props, false)
    }
  }

  updateCharacterDetails(props, isSync) {
    const { character } = props
    const itemsWithEmotion = _.values(character.selectedItems)
    .filter(item => item.id && (item.visible === undefined || item.visible))
    .map(item => {
      var itemEntry = item.id >= 20000 && item.id <= 29999 ? `${item.id}:${character.emotion}` : item.id
      return itemEntry
    });

    const { tryCount } = this.state

    let itemEntries = Object.values(character.selectedItems).filter(item => item.id && (item.visible === undefined || item.visible)).map(item => { 
      let itemEntry = { 
        itemId: Number(item.id)
      }
  
      if ((item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.animationName = character.emotion
      if (item.region && item.region.toLowerCase() != 'gms') itemEntry.region = item.region
      if (item.version && item.version.toLowerCase() != 'latest') itemEntry.version = item.version
      if (item.hue) itemEntry.hue = item.hue
      if (item.saturation != 1) itemEntry.saturation = item.saturation
      if (item.contrast != 1) itemEntry.contrast = item.contrast
      if (item.brightness != 1) itemEntry.brightness = item.brightness
      if (item.alpha != 1) itemEntry.alpha = item.alpha
      if (item.islot) itemEntry.islot = item.islot
      if (item.vslot) itemEntry.vslot = item.vslot
  
      return itemEntry
    })

    let backgroundColor = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`
  
    let itemEntriesPayload = JSON.stringify([
      ...itemEntries,
      { itemId: Number(character.skin), region: localStorage['region'], version: localStorage['version'] },
      { itemId: Number(character.skin) + 10000, region: localStorage['region'], version: localStorage['version'] }
    ])
    itemEntriesPayload = encodeURIComponent(itemEntriesPayload.substr(1, itemEntriesPayload.length - 2))

    const link = `https://maplestory.io/api/character/${itemEntriesPayload}/${character.action}/${character.animating ? 'animated' : character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&showHighLefEars=${character.highFloraEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')

    if (isSync) {
      this.state.linkUsed = link
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data
          })
        }
      }.bind(this))
    } else this.setState({ linkUsed: link }, () => {
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data
          })
        }
      }.bind(this))
    })
  }

  render() {
    const { character, isSelected, canvasMode, onUpdateCharacter, onDeleteCharacter, ...otherProps } = this.props

    let itemEntries = Object.values(character.selectedItems).filter(item => item.id && (item.visible === undefined || item.visible)).map(item => { 
      let itemEntry = { 
        itemId: Number(item.id)
      }
  
      if ((item.id >= 20000 && item.id < 30000) || (item.id >= 1010000 && item.id < 1020000)) itemEntry.animationName = character.emotion
      if (item.region && item.region.toLowerCase() != 'gms') itemEntry.region = item.region
      if (item.version && item.version.toLowerCase() != 'latest') itemEntry.version = item.version
      if (item.hue) itemEntry.hue = item.hue
      if (item.saturation != 1) itemEntry.saturation = item.saturation
      if (item.contrast != 1) itemEntry.contrast = item.contrast
      if (item.brightness != 1) itemEntry.brightness = item.brightness
      if (item.alpha != 1) itemEntry.alpha = item.alpha
      if (item.islot) itemEntry.islot = item.islot
      if (item.vslot) itemEntry.vslot = item.vslot
  
      return itemEntry
    })

    let backgroundColor = JSON.parse(localStorage['backgroundColor'] || false) || {"hsl":{"h":0,"s":0,"l":0,"a":0},"hex":"transparent","rgb":{"r":0,"g":0,"b":0,"a":0},"hsv":{"h":0,"s":0,"v":0,"a":0},"oldHue":0,"source":"rgb"}
    const bgColorText = `${backgroundColor.rgb.r},${backgroundColor.rgb.g},${backgroundColor.rgb.b},${backgroundColor.rgb.a}`
  
    let itemEntriesPayload = JSON.stringify([
      ...itemEntries,
      { itemId: Number(character.skin), region: localStorage['region'], version: localStorage['version'] },
      { itemId: Number(character.skin) + 10000, region: localStorage['region'], version: localStorage['version'] }
    ])
    itemEntriesPayload = encodeURIComponent(itemEntriesPayload.substr(1, itemEntriesPayload.length - 2))

    const link = `https://maplestory.io/api/character/${itemEntriesPayload}/${character.action}/${character.animating ? 'animated' : character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&showHighLefEars=${character.highFloraEars}&resize=${character.zoom}&name=${encodeURI(character.name || '')}&flipX=${character.flipX}` + (character.includeBackground ? `&bgColor=${bgColorText}` : '')

    return (
      <Tooltip html={this.customizeCharacter(character)} delay={[100, 300]} position={canvasMode ? undefined : 'bottom'} interactive={true} theme='light' distance={400} arrow={true}>
        <div
          className={'character ' + (character.visible ? 'disabled ' : 'enabled ') + (isSelected ? 'active' : 'inactive')}
          style={{
            backgroundImage: 'url('+link+')'
          }}
          {...otherProps}>&nbsp;</div>
      </Tooltip>
    )
  }

  customizeCharacter(character) {
    const { localized } = this.props
    const { actions, frames, emotions } = this.state
    const isGMSRegion = localStorage['region'].toLowerCase() == 'gms'
    const hasName = character.name && character.name.length > 0
    return (<div className='character-customizeable-options-container'>
    <div className='character-customizeable-options'>
      <label className='name'>
        <span>{localized.name}</span>
        <input type='text' value={character.name} onChange={this.changeName.bind(this)} />
      </label>
      <label>
        <span>{localized.expression}</span>
        <select disabled={!character.selectedItems.Face} onChange={this.changeEmotion.bind(this)} value={character.emotion}>
          {
            emotions.map(e => (
              <option value={e} key={e}>{e}</option>
            ))
          }
        </select>
      </label>
      <label>
        <span>{localized.action}</span>
        <select onChange={this.changeAction.bind(this)} value={character.action}>
        <option value="stand1">Standing (1-Handed)</option>
        <option value="stand2">Standing (2-Handed)</option>
        <option value="walk1">Walking (1-Handed)</option>
        <option value="walk2">Walking (2-Handed)</option>
        <option value="alert">Alert</option>
        <option value="fly">Flying</option>
        <option value="heal">Healing</option>
        <option value="jump">Jumping</option>
        <option value="ladder">Ladder</option>
        <option value="rope">Rope</option>
        <option value="prone">Prone</option>
        <option value="proneStab">Prone + Stab</option>
        <option value="shoot1">Shoot (1-Handed)</option>
        <option value="shoot2">Shoot (2-Handed)</option>
        <option value="shootF">Shoot (0F)</option>
        <option value="sit">Sitting</option>
        <option value="stabO1">Stab (01)</option>
        <option value="stabO2">Stab (02)</option>
        <option value="stabOF">Stab (0F)</option>
        <option value="stabT1">Stab (T1)</option>
        <option value="stabT2">Stab (T2)</option>
        <option value="stabTF">Stab (TF)</option>
        <option value="swingO1">Swing (01)</option>
        <option value="swingO2">Swing (02)</option>
        <option value="swingO3">Swing (03)</option>
        <option value="swingOF">Swing (0F)</option>
        <option value="swingP1">Swing (P1)</option>
        <option value="swingP2">Swing (P2)</option>
        <option value="swingPF">Swing (PF)</option>
        <option value="swingT1">Swing (T1)</option>
        <option value="swingT2">Swing (T2)</option>
        <option value="swingT3">Swing (T3)</option>
        <option value="swingTF">Swing (TF)</option>
        </select>
      </label>
      <label>
        <span>{localized.skin}</span>
        <select onChange={this.changeSkin.bind(this)} value={character.skin}>
            <option value='2000'>Light</option>
            <option value='2004'>Ashen</option>
            <option value='2010'>Pale Pink</option>
            <option value='2001'>Tanned</option>
            <option value='2003'>Pale</option>
            <option value='2005'>Green</option>
            <option value='2013'>Ghostly</option>
            <option value='2002'>Dark</option>
            <option value='2011'>Clay</option>
            <option value='2009'>White</option>
            <option value='2012'>Mercedes</option>
            <option value="2015">Soft Petal</option>
            <option value="2016">Blushing Petal</option>
          </select>
      </label>
      <label>
        <span>{localized.visible}</span>
        <Toggle onChange={this.toggleVisibility.bind(this)} checked={character.visible} />
      </label>
      <label className="section-title">
        <span>Ears</span>
      </label>
      <label>
        <span>{localized.illiumEars}</span>
        <Toggle
          onChange={this.changeIlliumEars.bind(this)}
          checked={character.illiumEars} />
      </label>
      <label>
        <span>{localized.highFloraEars}</span>
        <Toggle
          onChange={this.changeHighFloraEars.bind(this)}
          checked={character.highFloraEars} />
      </label>
      <label>
        <span>{localized.mercEars}</span>
        <Toggle
          onChange={this.changeMercEars.bind(this)}
          checked={character.mercEars} />
      </label>
      <label className="section-title">
        <span>Additional Options</span>
      </label>
      <label>
        <span>{localized.frame}</span>
        <Slider
          value={character.frame || 0}
          min={0}
          max={4 - 1}
          handle={handle}
          disabled={character.animating}
          onChange={this.changeFrame.bind(this)} />
      </label>
      <label>
        <span>{localized.animate}</span>
        <Toggle
          onChange={this.changeAnimating.bind(this)}
          checked={character.animating} />
      </label>
      <label>
        <span>{localized.zoom}</span>
        <Slider
          value={character.zoom || 1}
          min={1}
          max={10}
          handle={handle}
          onChange={this.changeZoom.bind(this)} />
      </label>
      <label>
        <span>{localized.addBgToGif}</span>
        <Toggle
          onChange={this.changeIncludeBackground.bind(this)}
          checked={character.includeBackground} />
      </label>
      <label>
        <span>{localized.flipHorizontal}</span>
        <Toggle onChange={this.toggleFlipX.bind(this)} checked={character.flipX} />
      </label>
      <label>
        <span>{localized.footholdSnapping}</span>
        <Toggle onChange={this.toggleFHSnap.bind(this)} checked={character.fhSnap || false} />
      </label>
      <label>
        <span>{localized.lock}</span>
        <Toggle onChange={this.toggleLock.bind(this)} checked={character.locked} />
      </label>
      <br />
      <div className='flex'>
        <div className='clone-btn' onClick={this.onClone.bind(this)}>{localized.clone}</div>
        <div className='clone-btn' onClick={this.onExport.bind(this)}>{localized.export}</div>
      </div>
      <label className="section-title">
        <span>Spritesheets</span>
      </label>
      <a href={`${window.generateAvatarLink(character, 'download')}`} target='_blank'  rel="noopener noreferrer">
        <div className='download-bar bg-blue'>
          <div className='equipped-items-item-meta'>
            <div className='equipped-items-item-meta-name text-white'>{localized.downloadSpriteSheet}</div>
            <div className='equipped-items-item-meta-category text-white'>({localized.willDownloadZip})</div>
          </div>
        </div>
      </a>
      <a href={`${window.generateAvatarLink(character, 'download')}&format=2`} target='_blank'  rel="noopener noreferrer">
        <div className='download-bar bg-blue'>
          <div className='equipped-items-item-meta'>
            <div className='equipped-items-item-meta-name text-white'>{localized.downloadMinimalSpriteSheet}</div>
            <div className='equipped-items-item-meta-category text-white'>({localized.willDownloadZip})</div>
          </div>
        </div>
      </a>
      <div className="flex">
        <a className='layered-link' href={`${window.generateAvatarLink(character, 'download')}&format=1`} target='_blank'  rel="noopener noreferrer">
          <div className='download-bar bg-blue'>
            <div className='equipped-items-item-meta'>
              <div className='equipped-items-item-meta-name text-white'>{localized.downloadLayeredSpriteSheet}</div>
              <div className='equipped-items-item-meta-category text-white'>({localized.willDownloadZip})</div>
              <div className='equipped-items-item-meta-category text-white bold'>{localized.requiresPDNPlugin}</div>
            </div>
          </div>
        </a>
      </div>
      <div className="flex">
        <a className='layered-link' href={`${window.generateAvatarLink(character, 'download')}&format=3`} target='_blank'  rel="noopener noreferrer">
          <div className='download-bar bg-blue'>
            <div className='equipped-items-item-meta'>
              <div className='equipped-items-item-meta-name text-white'>{localized.downloadMinimalLayeredSpriteSheet}</div>
              <div className='equipped-items-item-meta-category text-white'>({localized.willDownloadZip})</div>
              <div className='equipped-items-item-meta-category text-white bold'>{localized.requiresPDNPlugin}</div>
            </div>
          </div>
        </a>
      </div>
    </div>
    <div className="margin-top-10">
      <a href="#" className='btn btn-large bg-red text-white right' onClick={this.deleteCharacter.bind(this)}>{localized.deleteCharacter}</a>
    </div>
    </div>)
  }

  changeIncludeBackground() {
    this.props.onUpdateCharacter(this.props.character, { includeBackground: !this.props.character.includeBackground })
  }

  changeAnimating() {
    this.props.onUpdateCharacter(this.props.character, { animating: !this.props.character.animating })
  }

  changeName(e) {
    this.props.onUpdateCharacter(this.props.character, { name: e.target.value })
  }

  toggleFHSnap(e) {
    this.props.onUpdateCharacter(this.props.character, { fhSnap: !this.props.character.fhSnap })
  }

  toggleFlipX(e) {
    this.props.onUpdateCharacter(this.props.character, { flipX: !this.props.character.flipX })
  }

  deleteCharacter() {
    const { localized } = this.props;
    const confirmation = window.confirm(localized.deleteCharacterConfirm);
    
    if(confirmation) {
      this.props.onDeleteCharacter(this.props.character)
    }
  }

  onClone() {
    this.props.onClone(this.props.character)
  }

  onExport() {
    const a = document.createElement('a')
    a.style = 'display: none;'
    document.body.appendChild(a)

    const payload = JSON.stringify(this.props.character, null, 2),
      blob = new Blob([payload], {type: 'octet/stream'}),
      url = window.URL.createObjectURL(blob)
    a.href = url
    if (this.props.character.name)
      a.download = this.props.character.name + '-data.json'
    else
      a.download = 'character-data.json'
    a.click()

    window.URL.revokeObjectURL(url)
    a.remove()
  }

  changeSkin(e) {
    this.props.onUpdateCharacter(this.props.character, {skin: e.target.value})
  }

  changeEmotion(e) {
    this.props.onUpdateCharacter(this.props.character, {emotion: e.target.value})
  }

  changeAction (e) {
    this.props.onUpdateCharacter(this.props.character, { action: e.target.value })
  }

  changeMercEars(e) {
    this.props.onUpdateCharacter(this.props.character, { mercEars: e.target.checked });
  }

  changeHighFloraEars(e) {
    this.props.onUpdateCharacter(this.props.character, { highFloraEars: e.target.checked });
  }

  changeIlliumEars(e) {
    this.props.onUpdateCharacter(this.props.character, { illiumEars: e.target.checked });
  }

  changeZoom(e) {
    this.props.onUpdateCharacter(this.props.character, { zoom: e });
  }

  changeFrame(e) {
    this.props.onUpdateCharacter(this.props.character, { frame: e });
  }

  toggleVisibility(e) {
    this.props.onUpdateCharacter(this.props.character, { visible: !this.props.character.visible })
  }

  toggleLock(e) {
    this.props.onUpdateCharacter(this.props.character, { locked: !this.props.character.locked })
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

export default CharacterEntry
