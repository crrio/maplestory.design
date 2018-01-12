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

class RenderCanvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0
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
    const { selectedRenderable } = this.props

    const renderable = this.props.renderables[selectedRenderable]
    if (renderable)
      this.setState({ x: -renderable.position.x, y: -renderable.position.y })
  }

  render() {
    const { renderables } = this.props
    return (
      <DraggableCore
        onDrag={(e, o) => {
          if(!this.state.childDragging && e.target.classList.contains('canvas-characters'))
            this.setState({ x: this.state.x + o.deltaX, y: this.state.y + o.deltaY })
        }}
        >
        <div className='canvas-characters' onClick={this.props.onClick}>
          <div className='renderables-container' style={{ transform: `translate(${this.state.x}px, ${this.state.y}px)` }}>
          {
            renderables
              .filter(renderable => renderable.visible)
              .map(renderable => {
                return (<PlayerCanvas
                  onStart={this.childDragging.bind(this)}
                  onStop={this.childStopDragging.bind(this)}
                  onClick={() => {
                    this.props.onClickRenderable(renderable)
                  }}
                  onUpdateRenderablePosition={(o,e) => {
                    renderable.position = renderable.position || { x:0, y:0 }
                    if(Number.isNaN(renderable.position.x)) renderable.position.x = 0
                    if(Number.isNaN(renderable.position.y)) renderable.position.y = 0
                    this.props.onUpdateRenderable(renderable, {
                      position: {
                        x: (renderable.position || {}).x + e.deltaX,
                        y: (renderable.position || {}).y + e.deltaY
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

  childDragging() { this.setState({childDragging: true}) }
  childStopDragging() { this.setState({childDragging: false}) }
}

export default RenderCanvas
