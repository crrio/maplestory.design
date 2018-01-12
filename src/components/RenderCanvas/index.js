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
import PlayerCanvas from '../PlayerCanvas'
import Draggable, { DraggableCore } from 'react-draggable'
import { NotificationManager } from 'react-notifications'

class RenderCanvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0,
      childDragCount: 0
    }

    if (props.selectedRenderable !== undefined) {
      const renderable = props.renderables[props.selectedRenderable]
      if (renderable){
        this.state = {
          ...this.state,
          x: -renderable.position.x,
          y: -renderable.position.y
        }
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedRenderable === this.props.selectedRenderable) return
    const { selectedRenderable, mapId } = this.props

    const renderable = this.props.renderables[selectedRenderable]
    if (renderable)
      this.setState({ x: -renderable.position.x, y: -renderable.position.y })
  }

  render() {
    const { renderables, mapId, zoom } = this.props

    const styleOptions = { transform: `translate(${this.state.x}px, ${this.state.y}px) scale(${zoom})` }

    return (
      <DraggableCore
        onDrag={(e, o) => {
          if(!this.state.childDragging && (e.target.classList.contains('canvas-characters') || e.target.classList.contains('map')))
            this.setState({ x: this.state.x + o.deltaX, y: this.state.y + o.deltaY })
        }}
        >
        <div className='canvas-characters' onClick={this.props.onClick}>
          <div className='renderables-container' style={styleOptions}>
          {
            mapId ? <img className='map' src={`https://labs.maplestory.io/api/gms/latest/map/${mapId}/render`} draggable={false} onClick={this.props.onClick} onError={this.mapLoadingError} /> : ''
          }
          {
            renderables
              .filter(renderable => renderable.visible)
              .map(renderable => {
                return (<PlayerCanvas
                  onStart={this.childDragging.bind(this)}
                  onStop={this.childStopDragging.bind(this)}
                  onClick={(function (){
                    if (this.state.childDragCount === 0)
                      this.props.onClickRenderable(renderable)
                  }).bind(this)}
                  onUpdateRenderablePosition={(o,e) => {
                    if (!e.deltaX && !e.deltaY) return
                    this.setState({ childDragCount: this.state.childDragCount + 1 })
                    renderable.position = renderable.position || { x:0, y:0 }
                    if(Number.isNaN(renderable.position.x)) renderable.position.x = 0
                    if(Number.isNaN(renderable.position.y)) renderable.position.y = 0
                    this.props.onUpdateRenderable(renderable, {
                      position: {
                        x: (renderable.position || {}).x + (e.deltaX / zoom),
                        y: (renderable.position || {}).y + (e.deltaY / zoom)
                      }
                    })
                  }}
                  renderable={renderable}
                  summary={renderable.summary}
                  key={'canvas' + renderable.id} />)
              })
          }
          </div>
        </div>
      </DraggableCore>
    )
  }

  mapLoadingError() {
    NotificationManager.warning(`There was an error rendering that map`, '', 10000)
  }

  childDragging() { this.setState({childDragging: true, childDragCount: 0}) }
  childStopDragging() { this.setState({childDragging: false}) }
}

export default RenderCanvas
