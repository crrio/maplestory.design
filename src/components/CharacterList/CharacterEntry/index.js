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
    const link = `https://maplestory.io/api/${localStorage['region']}/${localStorage['version']}/character/detailed/${character.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${character.action}/0?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}&tryCount=${tryCount}&flipX=${character.flipX}&name=${encodeURI(character.name || '')}`

    if (isSync) {
      this.state.linkUsed = link
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data,
            actions: _.keys(res.data.item3),
            frames: res.data.item3,
            frameDelay: res.data.item4 || 1000
          })
        }
      }.bind(this))
    } else this.setState({ linkUsed: link }, () => {
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data,
            actions: _.keys(res.data.item3),
            frames: res.data.item3,
            frameDelay: res.data.item4 || 1000
          })
        }
      }.bind(this))
    })
  }

  render() {
    const { character, isSelected, canvasMode, onUpdateCharacter, onDeleteCharacter, ...otherProps } = this.props
    return (
      <Tooltip html={this.customizeCharacter(character)} delay={[100, 300]} position={canvasMode ? undefined : 'bottom'} interactive={true} theme='light' distance={400} arrow={true}>
        <div
          className={'character ' + (character.visible ? 'disabled ' : 'enabled ') + (isSelected ? 'active' : 'inactive')}
          style={{
            backgroundImage: 'url('+character.summary+')'
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
      <div>
        <a href="#" className='btn bg-red text-white right' onClick={this.deleteCharacter.bind(this)}>{localized.deleteCharacter}</a>
      </div>
      <label>
        <span>{localized.name}</span>
        <input type='text' value={character.name} onChange={this.changeName.bind(this)} />
      </label>
      <label>
        {
          isGMSRegion && hasName ? <a href={`https://henesys.chat/#${character.skin};${_.values(character.selectedItems).map(item => item.id).join(',')};${character.name}`} target='_blank'>Play on Henesys.Chat</a>
          : isGMSRegion ? <span>Give your character a name to play on Henesys.Chat!</span>
          : <span>Customize your character on GMS to play on Henesys.Chat!</span>
        }
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
          {
            actions.map(a => (
              <option value={a} key={a}>{a}</option>
            ))
          }
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
          </select>
      </label>
      <label>
        <span>{localized.illiumEars}</span>
        <Toggle
          onChange={this.changeIlliumEars.bind(this)}
          checked={character.illiumEars} />
      </label>
      <label>
        <span>{localized.mercEars}</span>
        <Toggle
          onChange={this.changeMercEars.bind(this)}
          checked={character.mercEars} />
      </label>
      <label>
        <span>{localized.frame}</span>
        <Slider
          value={character.frame || 0}
          min={0}
          max={frames[character.action] - 1}
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
        <span>{localized.visible}</span>
        <Toggle onChange={this.toggleVisibility.bind(this)} checked={character.visible} />
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
      <div className='clone-btn' onClick={this.onClone.bind(this)}>Clone</div>
      <a href={`https://maplestory.io/api/${localStorage['region']}/${localStorage['version']}/character/download/${character.skin}/${_.map(character.selectedItems, i => i.hue ? `${i.id};${i.hue}` : i.id).join(',')}?showears=${character.mercEars}&showLefEars=${character.illiumEars}`} target='_blank'  rel="noopener noreferrer">
        <div className='download-bar bg-blue'>
          <div className='equipped-items-item-meta'>
            <div className='equipped-items-item-meta-name text-white'>{localized.downloadSpriteSheet}</div>
            <div className='equipped-items-item-meta-category text-white'>({localized.willDownloadZip})</div>
          </div>
        </div>
      </a>
      <div className="flex">
        <a href={`https://maplestory.io/api/${localStorage['region']}/${localStorage['version']}/character/download/${character.skin}/${_.map(character.selectedItems, i => i.hue ? `${i.id};${i.hue}` : i.id).join(',')}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&format=1`} target='_blank'  rel="noopener noreferrer">
          <div className='download-bar bg-blue'>
            <div className='equipped-items-item-meta'>
              <div className='equipped-items-item-meta-name text-white'>{localized.downloadLayeredSpriteSheet}</div>
              <div className='equipped-items-item-meta-category text-white'>({localized.willDownloadZip})</div>
              <div className='equipped-items-item-meta-category text-white'>{localized.requiresPDNPlugin} &gt;</div>
            </div>
          </div>
        </a>
        <a href="https://forums.getpaint.net/topic/31996-zip-archive-filetype-plugin-zip/" className='flex-column pdn-button'  target='_blank'  rel="noopener noreferrer">
          <div className='download-bar bg-red text-white'>
            PDN
          </div>
        </a>
      </div>
    </div></div>)
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
    this.props.onDeleteCharacter(this.props.character)
  }

  onClone() {
    this.props.onClone(this.props.character)
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
