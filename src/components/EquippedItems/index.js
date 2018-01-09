import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'

class EquippedItems extends Component {
  render() {
    const { equippedItems, skinId, mercEars, illiumEars } = this.props

    const ad = document.querySelector(".adsbygoogle")
    if (ad.offsetParent === null)
      document.querySelector('.anti-ad').className = 'anti-ad show'

    return (
      <div className='equipped-items'>
        <div className='equipped-items-header'>
          <span className="equipped-items-title">Quick View</span> <span onClick={this.removeItems.bind(this)} className="btn bg-red text-white right">Remove All</span>
        </div>
        <div className='equipped-items-listing'>
          {
            _.map(equippedItems, item => (
              <div className='equipped-items-item' key={item.Id}>
                <img src={`https://labs.maplestory.io/api/gms/latest/item/${item.Id}/icon`} alt={item.Name} />
                <div className='equipped-items-item-meta'>
                  <div className='equipped-items-item-meta-name'><a href={'https://maplestory.wiki/item/' + item.Id} target='_blank'>{item.Name}</a></div>
                  <div className='equipped-items-item-meta-category'>{item.TypeInfo.SubCategory}</div>
                </div>
                <span onClick={this.removeItem.bind(this, item)} className="btn bg-red text-white right"><i className="fa fa-times"></i></span>
                <input className='hue-picker' type="range" value={item.hue || 0} min="0" max="360" onChange={this.updateItemHue.bind(this, item)} />
              </div>
            ))
          }
          <a href={`https://labs.maplestory.io/api/gms/latest/character/download/${skinId}/${_.map(equippedItems, i => i.hue ? `${i.Id};${i.hue}` : i.Id).join(',')}?showears=${mercEars}&showLefEars=${illiumEars}`} target='_blank'  rel="noopener noreferrer">
            <div className='download-bar bg-blue'>
              <div className='equipped-items-item-meta'>
                <div className='equipped-items-item-meta-name text-white'>Download Spritesheet</div>
                <div className='equipped-items-item-meta-category text-white'>(will download a <b>.zip</b>)</div>
              </div>
            </div>
          </a>
          <div className="flex">
            <a href={`https://labs.maplestory.io/api/gms/latest/character/download/${skinId}/${_.map(equippedItems, i => i.hue ? `${i.Id};${i.hue}` : i.Id).join(',')}?showears=${mercEars}&showLefEars=${illiumEars}&format=1`} target='_blank'  rel="noopener noreferrer">
              <div className='download-bar bg-blue'>
                <div className='equipped-items-item-meta'>
                  <div className='equipped-items-item-meta-name text-white'>Download Layered Spritesheet</div>
                  <div className='equipped-items-item-meta-category text-white'>(will download a <b>.zip</b>)</div>
                  <div className='equipped-items-item-meta-category text-white'>Requires PDN plugin &gt;</div>
                </div>
              </div>
            </a>
            <a href="https://forums.getpaint.net/topic/31996-zip-archive-filetype-plugin-zip/" className='flex-column pdn-button'  target='_blank'  rel="noopener noreferrer">
              <div className='download-bar bg-red text-white'>
                PDN
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  }

  removeItem(item) {
    this.props.onRemoveItem(item);
  }

  removeItems() {
    this.props.onRemoveItems();
  }

  updateItemHue(item, e) {
    this.props.onUpdateItemHue(item, e.target.value);
  }
}

export default EquippedItems
