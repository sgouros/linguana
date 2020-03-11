import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class CustomModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    text: PropTypes.string,
    onClose: PropTypes.func
  };

  closeDialogIfEnterPressed = event => {
    event.preventDefault();
    if (event.keyCode === 13) {
      this.props.onClose(event);
    }
  };

  render() {
    return (
      <ModalContainer className="customModal">
        <ModalDialog
          onClose={this.props.onClose}
          onKeyDown={this.closeDialogIfEnterPressed}
          dismissOnBackgroundClick={true}
          width="50%"
        >
          <div>
            <img src="/img/correct.png" alt="happy linguana" />
            <h1>{this.props.title}</h1>
            <div>{this.props.text}</div>
            <button autoFocus className="customModal__okButton" onClick={this.props.onClose}>
              Ok I got it
            </button>
          </div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
