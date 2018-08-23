import React, { Component } from 'react'
import './index.css'
import Draggable, { DraggableCore } from 'react-draggable'
import { NotificationManager } from 'react-notifications'
import axios from 'axios'
import _ from 'lodash'

const region = !localStorage['region'] ? 'GMS' : localStorage['region']
const version = !localStorage['version'] ? 'latest' : localStorage['version']

class CharacterCanvasElement extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tryCount: 0
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
    const link = `https://maplestory.io/api/${region}/${version}/character/detailed/${character.skin}/${(itemsWithEmotion.join(',') || 1102039)}/${character.action}/${character.frame}?showears=${character.mercEars}&showLefEars=${character.illiumEars}&resize=${character.zoom}&tryCount=${tryCount}&flipX=${character.flipX}`

    if (isSync) {
      this.state.linkUsed = link
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data
          })
        }
      }.bind(this), this.showError.bind(this))
    } else this.setState({ linkUsed: link }, () => {
      axios.get(link).then(function(res) {
        if (this.state.linkUsed == link) {
          this.setState({
            details: res.data
          })
        }
      }.bind(this), this.showError.bind(this))
    })
  }

  render() {
    const { character, onUpdateRenderablePosition, onStart, onStop, onClick, selected } = this.props
    const { zoom } = character
    const { details } = this.state
    const styling = {
      transform: `translate(${character.position.x}px, ${character.position.y}px) translate(${details ? -(details.item2.feetCenter.x) : 0}px, ${details ? -(details.item2.feetCenter.y) : 0}px)`
    }

    const imgStyle = {
      position: 'relative',
      touchAction: 'none'
    }

    return (
      <DraggableCore
        onStart={onStart}
        onStop={onStop}
        onDrag={onUpdateRenderablePosition}
        position={character.position}
        >
        <div className={selected ? 'selected-canvas-element' : ''} style={styling}>
         {
            details ? (<img
              src={window.generateAvatarLink(character)}
              alt=''
              className='renderable-instance'
              draggable={false}
              onClick={onClick}
              onError={this.showError.bind(this)}
              style={imgStyle}
              />) : <div className='loading-character'>&nbsp;</div>
         }
        </div>
        </DraggableCore>
    )
  }

  showError() {
    NotificationManager.warning(`There was an error rendering your ${this.props.character.type}`, '', 7000)
    setTimeout(function () {
      if (this.state.tryCount < 10) {
        NotificationManager.warning(`Retrying to render your ${this.props.character.type}`, '', 2000)
        setTimeout(function () {
          this.setState({ tryCount: this.state.tryCount + 1 }, () => {
            this.updateCharacterDetails(this.props)
          })
        }.bind(this), 2500)
      }
    }.bind(this), 7500)
  }
}

export default CharacterCanvasElement
