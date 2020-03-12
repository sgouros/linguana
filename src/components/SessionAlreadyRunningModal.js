import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class SessionAlreadyRunningModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    onCancel: PropTypes.func
  };

  closeDialogOnEnter = event => {
    event.preventDefault();
    // close on enter as well
    if (event.keyCode === 13) {
      this.props.onClose(event);
    }
  };

  render() {
    return (
      <ModalContainer id="sessionAlreadyRunningModal">
        <ModalDialog
          onClose={this.props.onClose}
          onKeyDown={this.closeDialogOnEnter}
          id="confirmNewSessionModal"
          dismissOnBackgroundClick={true}
          width="50%"
        >
          <div className="sessionAlreadyRunningModal">
            <img className="sessionAlreadyRunningModalImg" src="/img/start.png" alt="linguana" />

            <h1>You are in the middle of a running session!</h1>
            <div>Please finish with your current translation session first.</div>
            <button autoFocus className="wordComparisonDialog__okButton" onClick={this.props.onClose}>
              Ok I got it
            </button>
          </div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
