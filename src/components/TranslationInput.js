import React, { Component } from "react";

class TranslationInput extends Component {
  s_Timeout = 0;
  alreadyPressedSpecialKeyCode = -1;
  special_letter_substitutions = [
    [83, "s", "ß"],
    [65, "a", "ä"],
    [85, "u", "ü"],
    [79, "o", "ö"]
  ];

  handleOnChange = event => {
    this.props.onChange(event);
  };

  handleKeyDown = event => {
    if (
      event.keyCode === 65 ||
      event.keyCode === 85 ||
      event.keyCode === 79 ||
      event.keyCode === 83
    ) {
      if (this.sameSpecialKeyPressed(event.keyCode)) {
        this.handleSameSpecialKeyPress(event);
      } else {
        this.handleSpecialKeyPress(event);
      }
    } else if (event.keyCode === 27) {
      this.handleEscPress(event);
    } else if (event.keyCode === 107) {
      this.handlePlusPress(event);
    } else {
      console.debug("normal key pressed");
    }
  };

  resetSpecialKeyPress = () => {
    console.debug(`Clearing special key press timeout ${this.s_Timeout}`);
    clearTimeout(this.s_Timeout);
    this.s_Timeout = 0;
    this.alreadyPressedSpecialKeyCode = -1;
  };

  handleSpecialKeyPress = event => {
    this.resetSpecialKeyPress(); // get rid of previous presses
    this.s_Timeout = setTimeout(this.resetSpecialKeyPress, 190);
    console.debug(
      `Special key (${event.keyCode}) pressed for the FIRST time. Setting timeout ${this.s_Timeout}`
    );
    this.alreadyPressedSpecialKeyCode = event.keyCode;
  };

  handleSameSpecialKeyPress = event => {
    console.debug("SAME special key pressed AGAIN");

    const initial_value = event.target.value;
    const specialKeyPairIndex = this.special_letter_substitutions.findIndex(
      item => item[0] === event.keyCode
    );
    const correct_input_box_value =
      initial_value.substr(0, initial_value.length - 1) +
      this.special_letter_substitutions[specialKeyPairIndex][2];
    event.target.value = correct_input_box_value;

    this.resetSpecialKeyPress();
    event.preventDefault();
  };

  sameSpecialKeyPressed = keyCode => {
    return keyCode === this.alreadyPressedSpecialKeyCode;
  };

  handleEscPress = event => {
    console.info("\nESC key pressed");
    this.props.onEscPress();
  };

  handlePlusPress = event => {
    console.info("\n+ key pressed");
    this.props.onPlusPress();
    event.preventDefault();
  };

  render() {
    return (
      <input
        ref="theInput"
        className={this.props.cssBackgroundClassName}
        id="translation_input"
        name="translation_input"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentInputValue}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default TranslationInput;
