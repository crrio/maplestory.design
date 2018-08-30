import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'
import axios from 'axios'
import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-tippy/dist/tippy.css';
import GenericCanvasElement from './GenericCanvasElement'
import CharacterCanvasElement from './CharacterCanvasElement'
import Draggable, { DraggableCore } from 'react-draggable'
import { NotificationManager } from 'react-notifications'
import ItemListing from '../ItemListing'

const renderFootholds = JSON.parse(localStorage['isDebugMode'] || 'false') === true

const region = !localStorage['region'] ? 'GMS' : localStorage['region']
const version = !localStorage['version'] ? 'latest' : localStorage['version']

class RenderCanvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      x: Number(localStorage['canvasX']) || 0,
      y: Number(localStorage['canvasX']) || 0,
      childDragCount: 0
    }

    if (props.selectedRenderable !== undefined && (Number.isNaN(Number(localStorage['canvasX'])) || Number.isNaN(Number(localStorage['canvasY'])))) {
      const renderable = props.renderables[props.selectedRenderable]
      if (renderable){
        this.state = {
          ...this.state,
          x: Math.round(-renderable.position.x),
          y: Math.round(-renderable.position.y)
        }
      }
    }

    if (props.mapId) {
      axios.get(`https://maplestory.io/api/${region}/${version}/map/${props.mapId}`)
        .then(response => this.setState({mapData: response.data}))
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.focusRenderable !== this.props.focusRenderable){
      const { focusRenderable, mapId } = this.props
      const { mapData } = this.state

      const renderable = this.props.renderables[focusRenderable]
      if (renderable)
        this.setState({ x: -renderable.position.x + (mapData ? mapData.vrBounds.x : 0), y: -renderable.position.y + (mapData ? mapData.vrBounds.y : 0) })
    }
    if (prevProps.mapId != this.props.mapId && this.props.mapId) {
      axios.get(`https://maplestory.io/api/${region}/${version}/map/${this.props.mapId}`)
        .then(response => {
          let stateChanges = {
            mapData: response.data
          };

          if (this.state.mapData === undefined) {
            const { focusRenderable, mapId } = this.props
            const { mapData } = stateChanges

            const renderable = this.props.renderables[focusRenderable]
            if (renderable)
              stateChanges = {
                ...stateChanges,
                x: Math.round(-renderable.position.x + (mapData ? mapData.vrBounds.x : 0)),
                y: Math.round(-renderable.position.y + (mapData ? mapData.vrBounds.y : 0))
              }

              localStorage['canvasX'] = stateChanges.x
              localStorage['canvasY'] = stateChanges.y
          }

          this.setState(stateChanges)
        })
    }
  }

  render() {
    const { renderables, mapId, zoom, backgroundColor, localized, selectedRenderable } = this.props
    const { mapData } = this.state
    const mapOrigin = {}

    const styleOptions = { transform: `translate(${this.state.x}px, ${this.state.y}px) translateZ(0)` }
    if (zoom != 1) styleOptions.transform = styleOptions.transform + ` scale(${zoom})`

    if (mapData) mapOrigin.transform = `translate(${-mapData.vrBounds.x}px, ${-mapData.vrBounds.y}px)`

    return (
      <div className={'canvas-bg' + (this.state.dragging ? ' dragging' : '')} style={{ backgroundPositionX: `${this.state.x}px`, backgroundPositionY: `${this.state.y}px` }}>
        <DraggableCore
          onDrag={(e, o) => {
            if (!o.deltaX && !o.deltaY) return
            if(!this.state.childDragging && (e.target.classList.contains('canvas-characters') || e.target.classList.contains('map'))) {
              let stateChanges = { x: this.state.x + o.deltaX, y: this.state.y + o.deltaY, dragCount: (this.state.dragCount || 0) + 1 }
              localStorage['canvasX'] = stateChanges.x
              localStorage['canvasY'] = stateChanges.y
              this.setState(stateChanges)
            }
          }}
          onStart={(function() { this.setState({ dragging: true, dragCount: 0 }); console.log('dragging') }).bind(this)}
          onStop={(function() { this.setState({ dragging: false }); console.log('done') }).bind(this)}
          >
          <div className={'canvas-characters' + (this.state.dragging ? ' dragging' : '')} onClick={this.clickCanvas.bind(this)} style={{ backgroundColor }}>
            <div className={'renderables-container' + (this.state.dragging ? ' dragging' : '')} style={styleOptions}>
            {
              mapId ? <img className='map' src={`https://maplestory.io/api/${region}/${version}/map/${mapId}/render`} draggable={false} onClick={this.clickCanvas.bind(this)} onError={this.mapLoadingError} /> : ''
            }
            {
              (mapData && renderFootholds) ? <svg className='map' onClick={this.clickCanvas.bind(this)} width={mapData.vrBounds.width} height={mapData.vrBounds.height} viewBox={`${mapData.vrBounds.x} ${mapData.vrBounds.y} ${mapData.vrBounds.width} ${mapData.vrBounds.height}`}>{
                ((_.values(mapData.footholds) || []).map((fh, i) =>
                  <line x1={fh.x1} x2={fh.x2} y1={fh.y1} y2={fh.y2} strokeWidth='2' stroke='black' key={'svg' + i} />
                ))
              }</svg> : ''
            }
              <div style={mapOrigin} className='character-container'>
                { 
                  selectedRenderable || selectedRenderable === 0 ? (
                    <ItemListing 
                      target={renderables[selectedRenderable]}
                      onItemSelected={this.props.onItemSelected}
                      localized={localized} />
                  ) : ''
                }
                {
                  renderables
                    .filter(renderable => renderable.visible)
                    .map((renderable, i) => {
                      return this.getRenderableElement(renderable, i)
                    })
                }
              </div>
            </div>
          </div>
        </DraggableCore>
      </div>
    )
  }

  clickCanvas(e) {
    console.log(this.state.dragCount, 'click')
    if (!this.state.dragCount)
      this.props.onClick(e)
  }

  getRenderableElement(renderable, index) {
    const { selectedRenderable } = this.props
    return renderable.type == 'character' ? (
    <CharacterCanvasElement
      onStart={this.childDragging.bind(this)}
      onStop={this.childStopDragging.bind(this)}
      onClick={(function (){
        if (this.state.childDragCount === 0)
          this.props.onClickRenderable(renderable)
      }).bind(this)}
      onUpdateRenderablePosition={this.handleRenderableElementMovement.bind(this, renderable)}
      character={renderable}
      selected={selectedRenderable === index}
      localized={this.props.localized}
      key={'canvas' + renderable.id} />
    ) : (
    <GenericCanvasElement
      onStart={this.childDragging.bind(this)}
      onStop={this.childStopDragging.bind(this)}
      onClick={(function (){
        if (this.state.childDragCount === 0)
          this.props.onClickRenderable(renderable)
      }).bind(this)}
      onUpdateRenderablePosition={this.handleRenderableElementMovement.bind(this, renderable)}
      renderable={renderable}
      summary={renderable.summary}
      selected={selectedRenderable === index}
      localized={this.props.localized}
      key={'canvas' + renderable.id} />
    )
  }

  handleRenderableElementMovement(renderable, o,e) {
    if (!e.deltaX && !e.deltaY) return

    const { zoom } = this.props
    const { mapData } = this.state
    const footholds = _.values((mapData || {}).footholds)

    const { deltaX, deltaY } = e
    const cursorX = e.x, cursorY = e.y
    this.setState({ childDragCount: this.state.childDragCount + 1 })
    renderable.position = renderable.position || { x:0, y:0 }
    if(Number.isNaN(renderable.position.x)) renderable.position.x = 0
    if(Number.isNaN(renderable.position.y)) renderable.position.y = 0
    let { x, y } = renderable.position
    x = Math.round(cursorX / zoom);
    y = Math.round(cursorY / zoom);
    if (footholds && renderable.fhSnap) {
      const validFootholds = footholds.filter(fh => {
        const isVertical = fh.x1 == fh.x2
        const isWithin = (fh.x1 < x && fh.x2 > x) || (fh.x2 < x && fh.x1 > x)
        if (isVertical || !isWithin) return false
        const { x1, x2, y1, y2 } = fh
        const yAtX = (x == x1 || x2 == x1 || y2 == y1) ? y1 : (y1 + ((y2 - y1) * ((x - x1) / (x2 - x1))))
        return Math.abs(yAtX - y) < 50
      })

      const alignedFootholds = validFootholds.map(fh => {
        const { x1, x2, y1, y2 } = fh
        const yAtX = (x == x1 || x2 == x1 || y2 == y1) ? y1 : (y1 + ((y2 - y1) * ((x - x1) / (x2 - x1))))
        return {
          ...fh,
          yAtX,
          difference: Math.abs(yAtX - y)
        }
      })

      const snapFoothold = _.find(alignedFootholds, fh => fh.difference < 50)
      if (snapFoothold) y = snapFoothold.yAtX
    }
    this.props.onUpdateRenderable(renderable, {
      position: {
        x,
        y
      }
    })
  }

  mapLoadingError() {
    NotificationManager.warning(`There was an error rendering that map`, '', 10000)
  }

  childDragging() { this.setState({childDragging: true, childDragCount: 0}) }
  childStopDragging() { this.setState({childDragging: false}) }
}

export default RenderCanvas
