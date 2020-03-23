import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class FinishModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.object,
    onClose: PropTypes.func
  };

  render() {
    return (
      <ModalContainer onClose={this.props.onClose} id="finishModalContainer">
        <ModalDialog onClose={this.props.onClose} id="finishModal" dismissOnBackgroundClick={true} width="75vw">
          <div className="finishModalImages">
            <img className="finishModalLinguanaFaceImg" src="/img/correct.png" alt="happy linguana" />
            <img className="css-congratulations-img" src="/img/congratulations.jpg" alt="congratulations" />
          </div>
          <h1 className="finishModalTitle">{this.props.title}</h1>
          <button autoFocus className="customModal__okButton" onClick={this.props.onClose}>
            Hurray!!
          </button>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
