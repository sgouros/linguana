import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";
import ReactSpinner from "react-spinjs";

export default class StartModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.object,
    onClose: PropTypes.func,
    isLoading: PropTypes.bool
  };

  closeDialogIfEnterPressed = event => {
    event.preventDefault();
    if (event.keyCode === 13) {
      this.props.onClose(event);
    }
  };

  render() {
    return (
      <ModalContainer onClose={this.props.onClose}>
        {this.props.isLoading ? (
          <ReactSpinner />
        ) : (
          <ModalDialog
            onClose={this.props.onClose}
            className="startModal"
            dismissOnBackgroundClick={true}
            onKeyDown={this.closeDialogIfEnterPressed}
            width="85vw"
          >
            <img src={this.props.imageUrl} alt={this.props.title} className="modalImg" />
            <h1>{this.props.title}</h1>
            <div>{this.props.content}</div>
            <button autoFocus className="customModal__okButton" onClick={this.props.onClose}>
              I'm ready!
            </button>
          </ModalDialog>
        )}
      </ModalContainer>
    );
  }
}
