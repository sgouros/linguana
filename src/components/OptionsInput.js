import React, { Component } from "react";

export default class OptionsInput extends Component {
  render() {
    return (
      <input
        onKeyPress={this.onKeyPress}
        ref="options_input_ref"
        className="app__header__headerForm__optionsInput"
        name="optionsInput"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentValueOfActualOptionsInput}
        onChange={this.props.onOptionsChange}
        placeholder="1 for 1-way | 2 for 2-way ..."
      />
    );
  }
}
