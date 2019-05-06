import React, { Component } from 'react'
import './index.css'
import Draggable, { DraggableCore } from 'react-draggable'
import { NotificationManager } from 'react-notifications'

class GenericCanvasElement extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tryCount: 0
    }
  }
  render() {
    const { renderable, onUpdateRenderablePosition, summary, onStart, onStop, onClick, selected } = this.props
    const { tryCount } = this.state
    let imgLink = summary
    if (summary.indexOf('?') !== -1) imgLink = summary + `&tryCount=${tryCount}`
    else imgLink = summary + `?tryCount=${tryCount}`
    return (
      <DraggableCore
        onStart={onStart}
        onStop={onStop}
        onDrag={onUpdateRenderablePosition}
        position={renderable.position}
        >
        <div className={'flex' + (selected ? ' selected-canvas-element' : '')} style={{ transform: `translate(${renderable.position.x}px, ${renderable.position.y}px) translate(-50%, -100%)` }}>
          <img
            src={imgLink}
            alt=''
            className='renderable-instance'
            draggable={false}
            onClick={onClick}
            onError={this.showError.bind(this)}
            style={{
              position: 'relative',
              touchAction: 'none',
              transform: renderable.flipX ? 'scaleX(-1)' : ''
            }}
            />
        </div>
        </DraggableCore>
    )
  }

  showError() {
    setTimeout(function () {
      if (this.state.tryCount < 10) {
        setTimeout(function () {
          this.setState({ tryCount: this.state.tryCount + 1 })
        }.bind(this), 2500)
      }
    }.bind(this), 7500)
  }
}

export default GenericCanvasElement
