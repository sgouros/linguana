import React, { Component } from "react";

class TranslationInput extends Component {
  s_Timeout = 0;

  special_letter_substitutions = [
    [83, "s", "ß"],
    [65, "a", "ä"],
    [85, "u", "ü"],
    [79, "o", "ö"]
  ];

  handleOnChange = event => {
    this.props.onChange(event);
  };

  specialKeyAlreadyPressed = () => {
    return this.s_Timeout === 0 ? false : true;
  };

  handleKeyDown = event => {
    if (
      event.keyCode === 65 ||
      event.keyCode === 85 ||
      event.keyCode === 79 ||
      event.keyCode === 83
    ) {
      this.handleSpecialKeyPress(event);
    } else if (event.keyCode === 27) {
      this.handleEscPress(event);
    } else {
      console.debug("normal key pressed");
    }
  };

  tick = () => {
    console.debug(`auto clearing special key press timeout ${this.s_Timeout}`);
    this.s_Timeout = 0;
  };

  handleSpecialKeyPress = event => {
    const index_of_substitution_pair = this.special_letter_substitutions.findIndex(
      item => item[0] === event.keyCode
    );

    if (this.specialKeyAlreadyPressed()) {
      console.debug("special key already pressed.");
      clearTimeout(this.s_Timeout);
      this.s_Timeout = 0;
      const initial_value = event.target.value;
      const correct_input_box_value =
        initial_value.substr(0, initial_value.length - 1) +
        this.special_letter_substitutions[index_of_substitution_pair][2];
      event.target.value = correct_input_box_value;
      event.preventDefault();
    } else {
      this.s_Timeout = setTimeout(this.tick, 190);
      console.debug(
        `special key NOT already pressed. Setting timeout ${this.s_Timeout}`
      );
    }
  };

  handleEscPress = event => {
    console.info("\n--- esc key pressed.");
    this.props.onEscPress();
  };

  render() {
    //const {} = this.props
    return (
      <input
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
