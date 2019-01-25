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
        <img src="/finalicon.svg" className="intro-logo"/>
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
        <span onClick={this.closeModal.bind(this)} className="btn bg-green text-white intro-dismiss"><i className="fa fa-check"></i> I understand</span>
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
    ].map(avatar => `https://maplestory.io/api/gms/latest/character/center/${avatar}/sit/0`).concat(
      [
        // Extra characters using the new horrid URL format.
        ''
      ]
    )

    if (!chosenAvatar) chosenAvatar = knownAvatars[Math.floor(Math.random() * knownAvatars.length)]

    return (<img src={chosenAvatar} alt={`avatar`} />)
  }
}

export default IntroModal
