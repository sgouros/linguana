import React, { Component } from "react";
import { ModalContainer, ModalDialog } from "react-modal-dialog";
import PropTypes from "prop-types";

export default class SemiFinishModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.object,
    onClose: PropTypes.func
  };

  render() {
    return (
      <ModalContainer onClose={this.props.onClose} id="semiFinishModal">
        <ModalDialog
          onClose={this.props.onClose}
          id="semiFinishModal"
          dismissOnBackgroundClick={true}
          width="60%"
        >
          <h1>
            {this.props.title}
          </h1>
          <div>
            {this.props.content}
          </div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
