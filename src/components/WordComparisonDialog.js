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
          className="wordComparisonDialog"
          dismissOnBackgroundClick={true}
          width="85%"
        >
          <img src="/img/redCross.png" alt="I don't think so" className="modalImg" />
          <h1>{this.props.title}</h1>
          <div>{this.props.content}</div>
          <button
            autoFocus
            className="wordComparisonDialog__okButton"
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
