import React, { Component } from 'react'
import './index.css'
import Draggable from 'react-draggable'
import CharacterEntry from '../CharacterList/CharacterEntry'
import { NotificationManager } from 'react-notifications'

class PlayerCanvas extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tryCount: 0
    }
  }
  render() {
    const { renderable, onUpdateRenderablePosition, summary, onStart, onStop, onClick } = this.props
    const { tryCount } = this.state
    let imgLink = summary
    if (summary.indexOf('?') !== -1) imgLink = summary + `&tryCount=${tryCount}`
    else imgLink = summary + `?tryCount=${tryCount}`
    return (
      <Draggable
        onStart={onStart}
        onStop={onStop}
        onDrag={onUpdateRenderablePosition}
        position={renderable.position}
        >
        <div>
          <img
            src={imgLink}
            alt=''
            className='renderable-instance'
            draggable={false}
            onClick={onClick.bind(this, renderable)}
            onError={this.showError.bind(this)}
            style={{
              position: 'relative'
            }}
            />
        </div>
        </Draggable>
    )
  }

  showError() {
    NotificationManager.warning(`There was an error rendering your ${this.props.renderable.type}`, '', 7000)
    setTimeout(function () {
      if (this.state.tryCount < 10) {
        NotificationManager.warning(`Retrying to render your ${this.props.renderable.type}`, '', 2000)
        setTimeout(function () {
          this.setState({ tryCount: this.state.tryCount + 1 })
        }.bind(this), 2500)
      }
    }.bind(this), 7500)
  }
}

export default PlayerCanvas
