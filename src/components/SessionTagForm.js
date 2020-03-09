import React, { Component } from "react";
import SessionTagInput from "./SessionTagInput.js";

export default class SessionTagForm extends Component {
  render() {
    return (
      <form className="app__header__sessionTagForm">
        <SessionTagInput
          ref="sessionTagInput"
          value={this.props.currentSessionTagInputValue}
          onChange={this.props.onInputChange}
        />
      </form>
    );
  }
}
