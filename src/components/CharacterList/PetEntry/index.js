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

const petLoader = axios.get(`https://labs.maplestory.io/api/gms/latest/pet`)
  .then(petResp =>
    {
      let petPairs = _.toPairs(petResp.data)
      let uniqPets = _.uniqBy(petPairs, pet => pet[1])
      pets = uniqPets.map(pet => {
        return {
          petId: pet[0],
          name: pet[1]
        }
      })
    }) // For some reason the standard [].map doesn't work here. :(

let pets = []

class PetEntry extends Component {
  constructor(props) {
    super(props)
    this.state = {
      actions: ['stand1', 'stand0']
    }

    // Populate true action list
    axios.get(`https://labs.maplestory.io/api/gms/latest/pet/actions/${(props.pet || {}).petId || 5000000}`)
      .then(response => this.setState({actions: _.sortBy(_.keys(response.data), a => a)}))
    if (pets.length > 0) this.state.petsLoaded = true;
    else petLoader.then(() => this.setState({ petsLoaded: true }))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pet && this.props.pet && prevProps.pet.petId == this.props.pet.petId) return
    const { pet: { petId } } = this.props

    axios.get(`https://labs.maplestory.io/api/gms/latest/pet/actions/${petId || 5000000}`)
      .then(response => this.setState({actions: _.sortBy(_.keys(response.data), a => a)}))
  }

  render() {
    const { pet, isSelected, canvasMode, onUpdatePet, onDeletePet, ...otherProps } = this.props
    return (
      <Tooltip html={this.customizePet(pet)} delay={[100, 300]} position={canvasMode ? undefined : 'bottom'} interactive={true} theme='light' distance={250} arrow={true}>
        <div
          className={'pet ' + (pet.visible ? 'disabled ' : 'enabled ') + (isSelected ? 'active' : 'inactive')}
          style={{
            backgroundImage: 'url('+pet.summary+')',
            transform: pet.flipX ? 'scaleX(-1)' : ''
          }}
          {...otherProps}>&nbsp;</div>
      </Tooltip>
    )
  }

  customizePet(pet) {
    return (<div className='pet-customizeable-options'>
      <div>
        <a href="#" className='btn bg-red text-white right' onClick={this.deletePet.bind(this)}>Delete Pet</a>
      </div>
      <label>
        <span>Pet Type</span>
        <select onChange={this.changePetId.bind(this)} value={pet.petId}>
          {
            pets.map(a => (
              <option value={a.petId} key={'petSelect' + a.petId}>{a.name}</option>
            ))
          }
        </select>
      </label>
      <label>
        <span>Pose / Action</span>
        <select onChange={this.changeAction.bind(this)} value={pet.animation}>
          {
            this.state.actions.map(a => (
              <option value={a} key={a}>{a}</option>
            ))
          }
        </select>
      </label>
      <label>
        <span>Frame</span>
        <Slider
          value={pet.frame || 0}
          min={0}
          max={10}
          handle={handle}
          onChange={this.changeFrame.bind(this)} />
      </label>
      <label>
        <span>Zoom</span>
        <Slider
          value={pet.zoom || 1}
          min={1}
          max={10}
          handle={handle}
          onChange={this.changeZoom.bind(this)} />
      </label>
      <label>
        <span>Visible</span>
        <Toggle onChange={this.toggleVisibility.bind(this)} checked={pet.visible} />
      </label>
      <label>
        <span>Flip Horizontal</span>
        <Toggle onChange={this.toggleFlipX.bind(this)} checked={pet.flipX} />
      </label>
      <label>
        <span>Foothold Snapping</span>
        <Toggle onChange={this.toggleFHSnap.bind(this)} checked={pet.fhSnap || false} />
      </label>
      <label>
        <span>Lock</span>
        <Toggle onChange={this.toggleLock.bind(this)} checked={pet.locked} />
      </label>
    </div>)
  }

  toggleFHSnap(e) {
    this.props.onUpdateCharacter(this.props.pet, { fhSnap: !this.props.pet.fhSnap })
  }

  toggleFlipX(e) {
    this.props.onUpdatePet(this.props.pet, { flipX: !this.props.pet.flipX })
  }

  deletePet() {
    this.props.onDeletePet(this.props.pet)
  }

  changePetId (e) {
    this.props.onUpdatePet(this.props.pet, { petId: e.target.value })
  }

  changeAction (e) {
    this.props.onUpdatePet(this.props.pet, { animation: e.target.value })
  }

  changeFrame(e) {
    this.props.onUpdatePet(this.props.pet, { frame: e });
  }

  changeZoom(e) {
    this.props.onUpdatePet(this.props.pet, { zoom: e });
  }

  toggleVisibility(e) {
    this.props.onUpdatePet(this.props.pet, { visible: !this.props.pet.visible })
  }

  toggleLock(e) {
    this.props.onUpdatePet(this.props.pet, { locked: !this.props.pet.locked })
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

export default PetEntry
