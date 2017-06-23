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
      <ModalContainer onClose={this.props.onClose} id="finishModal">
        <ModalDialog
          onClose={this.props.onClose}
          id="finishModal"
          dismissOnBackgroundClick={true}
          width="60%"
        >
          <img src={this.props.imageUrl} alt={this.props.title} className="modalImg" />
          <h1>{this.props.title}</h1>
          <div>{this.props.content}</div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}
