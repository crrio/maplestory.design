import React, { Component } from 'react'
import './index.css'
import _ from 'lodash'

class EquippedItems extends Component {
  render() {
    const { equippedItems, skinId } = this.props

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
              </div>
            ))
          }
          <a href={`https://labs.maplestory.io/api/gms/latest/character/download/${skinId}/${_.map(equippedItems, i => i.Id).join(',')}`} target='_blank'  rel="noopener noreferrer">
            <div className='download-bar bg-blue'>
              <div className='equipped-items-item-meta'>
                <div className='equipped-items-item-meta-name text-white'>Download Spritesheet</div>
                <div className='equipped-items-item-meta-category text-white'>(will download a <b>.zip</b>)</div>
              </div>
            </div>
          </a>
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
}

export default EquippedItems
