import React, { Component } from 'react'
import './index.css'
import Modal from 'react-modal'

let chosenAvatar = null;

class IntroModal extends Component {
  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        className={{
          base: 'intro-modal',
          afterOpen: 'intro-modal-opened',
        }}
        overlayClassName={{
          base: 'intro-modal-overlay',
          afterOpen: 'intro-modal-overlay-opened'
        }}>
        <img src="/finalicon.svg" className="intro-logo"/><span onClick={this.closeModal.bind(this)} className="btn bg-green text-white right intro-dismiss"><i className="fa fa-check"></i> I understand</span>
        <h1>
          <b>MapleStory:</b> Design
          <br/>
          <span className="modal-desc">The <b>unofficial</b> MapleStory simulator and designer.</span>
        </h1>
        <h3>Latest Updates</h3>
        <p>Visit our <a href="http://blog.crr.io">blog</a> for more information about our latest updates, new features, and bug fixes on MapleStory: Design.</p>
        <h3>Have feedback or want to report a bug?</h3>
        <p>Let us know on our <a href="https://discord.gg/D65Grk9">Discord</a> or by email at support@crr.io.</p>
        <h3>Disclaimer</h3><span className="avatar-box">{this.getRandomAvatar()}</span>
        <p>All assets and resources regarding MapleStory thereof are the sole property of <a href="//nexon.net">Nexon</a> and applies to their Terms of Use. By using this service, you agree to respect all copyrights and to not use any assets commercially without permission from Nexon.</p>
        <p>We are not an official MapleStory server nor fansite; <i>we provide this service for free in the spirit of free-to-play gaming.</i></p>
      </Modal>
    )
  }

  closeModal () {
    this.props.onSetModalOpen(false)
  }

  getRandomAvatar () {
    const knownAvatars = [
      '2000/1073181,1053109,1053109,1004862,33005,21544', // Tyler Corsair (Crrio)
      '2000/1052923,1052923,1002186,33515,21136', // Andy (Pink Bean's developer)
      '2001/20305,30130,1050118', // Dray86 (Maple Kombat)
      '2000/1004776,21645,35707,1042245,1062232', // Paul (Artist and Logo designer)
      '2001/23855,1010004,1042046,33040,1062040,1072234,1102059,1082162,1402010' // Austin (Character API help + developer)
    ].map(avatar => `https://maplestory.io/api/gms/latest/character/center/${avatar}/sit/0`).concat(
      [
        // Senpai
        'https://maplestory.io/api/character/%7B%22itemId%22%3A38595%2C%22hue%22%3A%2240%22%2C%22saturation%22%3A3%7D%2C%7B%22itemId%22%3A24159%2C%22animationName%22%3A%22blink%22%7D%2C%7B%22itemId%22%3A1053351%2C%22region%22%3A%22KMS%22%7D%2C%7B%22itemId%22%3A1072258%7D%2C%7B%22itemId%22%3A1702045%2C%22hue%22%3A4%7D%2C%7B%22itemId%22%3A2010%2C%22region%22%3A%22GMS%22%2C%22version%22%3A%22latest%22%7D%2C%7B%22itemId%22%3A12010%2C%22region%22%3A%22GMS%22%2C%22version%22%3A%22latest%22%7D/sit/0',
        // Nozzy
        'https://maplestory.io/api/character/%7B%22itemId%22%3A1003404%7D%2C%7B%22itemId%22%3A23417%2C%22animationName%22%3A%22default%22%7D%2C%7B%22itemId%22%3A33140%7D%2C%7B%22itemId%22%3A1042151%2C%22hue%22%3A340%7D%2C%7B%22itemId%22%3A1062157%2C%22saturation%22%3A0%7D%2C%7B%22itemId%22%3A2000%2C%22region%22%3A%22GMS%22%2C%22version%22%3A%22latest%22%7D%2C%7B%22itemId%22%3A12000%2C%22region%22%3A%22GMS%22%2C%22version%22%3A%22latest%22%7D/sit/0'
      ]
    )

    if (!chosenAvatar) chosenAvatar = knownAvatars[Math.floor(Math.random() * knownAvatars.length)]

    return (<img src={chosenAvatar} alt={`avatar`} />)
  }
}

export default IntroModal
