import React, { Component } from "react";

export default class TranslationInputGR extends Component {
  handleOnChange = event => {
    this.props.onChange(event);
  };

  handleKeyDown = event => {
    if (event.keyCode === 27 || event.keyCode === 109) {
      this.handleEscPress(event);
    } else if (event.keyCode === 107) {
      this.handlePlusPress(event);
    } else {
      console.debug("normal key pressed");
    }
  };

  handleEscPress = event => {
    if (!this.props.disableSpecialEscPress) {
      // console.info("\nESC key pressed");
      this.props.onEscPress();
      event.preventDefault();
    }
  };

  handlePlusPress = event => {
    if (!this.props.disableSpecialPlusPress) {
      this.props.onPlusPress();
      event.preventDefault();
    }
  };

  constructCssClassName = () => {
    let className = this.props.inputClassName;
    let attribute = this.props.correctTranslation ? " translationInput--correctTranslation" : "";
    return className + attribute;
  };

  render() {
    return (
      <input
        ref="input"
        className={this.constructCssClassName()}
        name="translationInputGR"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentInputValue}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleOnChange}
        placeholder={this.props.placeholder}
      />
    );
  }
}
