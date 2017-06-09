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

  render() {
    return (
      <ModalContainer onClose={this.props.onClose}>
        {this.props.isLoading
          ? <ReactSpinner />
          : <ModalDialog
              onClose={this.props.onClose}
              className="start-modal"
              dismissOnBackgroundClick={true}
              width="80%"
            >
              <h1>{this.props.title}</h1>
              <div>{this.props.content}</div>
            </ModalDialog>}
      </ModalContainer>
    );
  }
}
