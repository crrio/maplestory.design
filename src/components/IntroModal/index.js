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
        <img src="finalicon.svg" className="intro-logo"/>
        <h1>
          <b>MapleStory:</b> Design (v1.0)
          <br/>
          <span className="modal-desc">The <b>unofficial</b> MapleStory simulator and designer.</span>
        </h1>
        <h3>Hello mapler!</h3>
        <p>Welcome to our <b>open source</b> version of the service. Please remember to check the <a href="https://maplestory.design" target="_blank">main site</a> for updates and other news.</p>
        <p>This is an experimental version. If items or characters aren't rendering, please switch from the "latest" Maplestory version to any other available.</p>
        <h3>Need assistance or have a question?</h3>
        <p>Join our community on <a href="https://discord.gg/D65Grk9">Discord</a> to ask questions or reach out to our team by <a href="mailto:support@crr.io" target="_blank">email</a> if you need more help.</p>
        <h3>Disclaimer</h3><span className="avatar-box"><img src="https://maplestory.io/api/gms/latest/character/center/2000/1073181,1053109,1053109,1004862,33005,21544/sit/0"/></span>
        <p>All assets and resources regarding MapleStory thereof are the sole property of <a href="//nexon.net">Nexon</a> and applies to their Terms of Use. By using this service, you agree to respect all copyrights and to not use any assets commercially without permission from Nexon.</p>
        <span onClick={this.closeModal.bind(this)} className="btn bg-green text-white intro-dismiss"><i className="fa fa-check"></i> I understand</span>
      </Modal>
    )
  }

  closeModal () {
    this.props.onSetModalOpen(false)
  }
}

export default IntroModal
