import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'

import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import 'react-tippy/dist/tippy.css';
import RcTooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import { Tooltip } from 'react-tippy'
import Toggle from 'react-toggle'

class EquippedItems extends Component {
  render() {
    const { equippedItems, localized, name, skinId } = this.props

    const isGMSRegion = localStorage['region'].toLowerCase() == 'gms'
    const hasName = name && name.length > 0

    const ad = document.querySelector(".adsbygoogle")
    if (ad.offsetParent === null)
      document.querySelector('.anti-ad').className = 'anti-ad show'

    return (
      <div className='equipped-items'>
        <div className='equipped-items-header'>
          <span className="equipped-items-title">{localized.quickView}</span> <span onClick={this.removeItems.bind(this)} className="btn bg-red text-white right">Remove All</span>
        </div>
        <div className='equipped-items-listing'>
          { !isGMSRegion ? <p>Change to GMS to play on Henesys.Chat!</p> : !hasName ? <p>Give your character a name to play on Henesys.Chat!</p> : <a href={`https://henesys.chat/#${skinId};${_.map(equippedItems, i => i.id).join(',')};${name}`} target='_blank'  rel="noopener noreferrer">
            <div className='download-bar bg-blue'>
              <div className='equipped-items-item-meta'>
                <div className='equipped-items-item-meta-name text-white'>Play on Henesys.Chat</div>
              </div>
            </div>
          </a>
          }
          {
            _.map(equippedItems, item => {
              return (<Tooltip html={this.customizeItem(item)} position='right' interactive={true} theme='light' distance={250} arrow={true} key={item.id}>
                <div className='equipped-items-item'>
                  <img src={`https://maplestory.io/api/${localStorage['region']}/${localStorage['version']}/item/${item.id}/icon`} alt={item.name} />
                  <div className='equipped-items-item-meta'>
                    <div className='equipped-items-item-meta-name'><a href={`https://maplestory.wiki/${localStorage['region']}/${localStorage['version']}/item/${item.id}`} target='_blank'>{item.name}</a></div>
                    <div className='equipped-items-item-meta-category'>{item.typeInfo.subCategory}</div>
                  </div>
                  <span onClick={this.removeItem.bind(this, item)} className="btn bg-red text-white right"><i className="fa fa-times"></i></span>
                </div>
              </Tooltip>
            )})
          }
        </div>
      </div>
    )
  }

  removeItem(item) {
    this.props.onRemoveItem(item);
  }

  toggleVisibility(item) {
    this.props.onUpdateItem(item, { visible: !(item.visible === undefined ? true : item.visible) })
  }

  removeItems() {
    this.props.onRemoveItems();
  }

  updateItemHue(item, newHue) {
    if (newHue.target) newHue = newHue.target.value
    this.props.onUpdateItem(item, {hue: newHue});
  }

  updateItemContrast(item, newContrast) {
    if(newContrast.target) newContrast = newContrast.target.value
    this.props.onUpdateItem(item, {contrast: newContrast})
  }

  updateItemBrightness(item, newBrightness) {
    if(newBrightness.target) newBrightness = newBrightness.target.value
    this.props.onUpdateItem(item, {brightness: newBrightness})
  }

  updateItemAlpha(item, newAlpha) {
    if(newAlpha.target) newAlpha = newAlpha.target.value
    this.props.onUpdateItem(item, {alpha: newAlpha})
  }

  updateItemSaturation(item, newSaturation) {
    if(newSaturation.target) newSaturation = newSaturation.target.value
    this.props.onUpdateItem(item, {saturation: newSaturation})
  }

  customizeItem(item) {
    return (<div className='customizing-item'>
      <span>
        <span className='flex'>Hue<input type='number' className='hue-picker-value' value={item.hue || 0} onChange={this.updateItemHue.bind(this, item)} /></span>
        <Slider
          className='hue-picker'
          value={item.hue || 0}
          min={0}
          max={360}
          handle={handle}
          onChange={this.updateItemHue.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Contrast<input type='number' className='contrast-picker-value' value={item.contrast === undefined ? 1 : item.contrast} onChange={this.updateItemContrast.bind(this, item)} /></span>
        <Slider
          className='contrast-picker'
          value={item.contrast === undefined ? 1 : item.contrast}
          min={0}
          step={0.1}
          max={10}
          handle={handle}
          onChange={this.updateItemContrast.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Brightness<input type='number' className='brightness-picker-value' value={item.brightness === undefined ? 1 : item.brightness} onChange={this.updateItemBrightness.bind(this, item)} /></span>
        <Slider
          className='brightness-picker'
          value={item.brightness === undefined ? 1 : item.brightness}
          min={0}
          step={0.1}
          max={10}
          handle={handle}
          onChange={this.updateItemBrightness.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Saturation<input type='number' className='saturation-picker-value' value={item.saturation === undefined ? 1 : item.saturation} onChange={this.updateItemSaturation.bind(this, item)} /></span>
        <Slider
          className='saturation-picker'
          value={item.saturation === undefined ? 1 : item.saturation}
          min={0}
          step={0.1}
          max={10}
          handle={handle}
          onChange={this.updateItemSaturation.bind(this, item)} />
      </span>
      <span>
        <span className='flex'>Alpha<input type='number' className='alpha-picker-value' value={item.alpha === undefined ? 1 : item.alpha} onChange={this.updateItemAlpha.bind(this, item)} /></span>
        <Slider
          className='alpha-picker'
          value={item.alpha === undefined ? 1 : item.alpha}
          min={0}
          step={0.1}
          max={1}
          handle={handle}
          onChange={this.updateItemAlpha.bind(this, item)} />
      </span>
      <label>
        <span>Visible</span>
        <Toggle onChange={this.toggleVisibility.bind(this, item)} checked={item.visible === undefined ? true: item.visible} />
      </label>
    </div>);
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

export default EquippedItems
