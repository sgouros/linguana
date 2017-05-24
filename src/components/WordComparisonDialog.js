import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class WordComparisonDialog extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.object,
    onClose: PropTypes.func
  };

  closeDialog = event => {
    event.preventDefault();
    // close on enter as well
    if (event.keyCode === 13) {
      this.props.onClose(event);
    }
  };

  render() {
    return (
      <ModalContainer onClose={this.props.onClose}>
        <ModalDialog
          onClose={this.props.onClose}
          className="start-modal"
          dismissOnBackgroundClick={true}
          width="70%"
        >
          <h1>{this.props.title}</h1>
          <div>{this.props.content}</div>
          <button
            autoFocus
            className="css-modal-dialog-ok-button"
            onKeyDown={this.closeDialog}
            onClick={this.props.onClose}
          >
            OK I got it
          </button>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
