import React, { Component } from "react";

export default class SessionTagInput extends Component {
  handleOnChange = event => {
    this.props.onChange(event);
  };

  render() {
    return (
      <input
        ref="input"
        className="app__header__sessionTagForm__sessionTagInput"
        name="sessionTagInput"
        type="text"
        autoComplete="on"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentSessionTagInputValue}
        onChange={this.handleOnChange}
        placeholder="optional tag ..."
      />
    );
  }
}
