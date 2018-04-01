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
    const { equippedItems, localized } = this.props

    const ad = document.querySelector(".adsbygoogle")
    if (ad.offsetParent === null)
      document.querySelector('.anti-ad').className = 'anti-ad show'

    return (
      <div className='equipped-items'>
        <div className='equipped-items-header'>
          <span className="equipped-items-title">{localized.quickView}</span> <span onClick={this.removeItems.bind(this)} className="btn bg-red text-white right">Remove All</span>
        </div>
        <div className='equipped-items-listing'>
          {
            _.map(equippedItems, item => {
              return (<Tooltip html={this.customizeItem(item)} position='right' interactive={true} theme='light' distance={250} arrow={true} key={item.id}>
                <div className='equipped-items-item'>
                  <img src={`https://labs.maplestory.io/api/gms/latest/item/${item.id}/icon`} alt={item.name} />
                  <div className='equipped-items-item-meta'>
                    <div className='equipped-items-item-meta-name'><a href={'https://maplestory.wiki/item/' + item.id} target='_blank'>{item.name}</a></div>
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
