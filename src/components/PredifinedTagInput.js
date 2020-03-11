import React, { Component } from "react";

export default class PredifinedTagInput extends Component {
  // handleOnChange = event => {
  //   this.props.onChange(event);
  // };

  onKeyPress = event => {
    if (event.key === "Enter") {
      this.props.onPredifinedTagSubmit(event);
    }
  };

  render() {
    return (
      <input
        onKeyPress={this.onKeyPress}
        ref="actual_input_ref"
        className="app__header__headerForm__predifinedTagInput"
        name="predifinedTagInput"
        type="text"
        autoComplete="on"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentValueOfActualPredifinedTagInput}
        onChange={this.props.onTagChange}
        placeholder="optional tag ..."
      />
    );
  }
}
