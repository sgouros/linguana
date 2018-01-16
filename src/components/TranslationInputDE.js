import React, { Component } from "react";

export default class TranslationInputDE extends Component {
  s_Timeout = 0;
  alreadyPressedSpecialKeyCode = -1;

  normalKeySubstitutions = {
    186: "q",
    87: "w",
    69: "e",
    82: "r",
    84: "t",
    89: "y",
    85: "u",
    73: "i",
    79: "o",
    80: "p",
    65: "a",
    83: "s",
    68: "d",
    70: "f",
    71: "g",
    72: "h",
    74: "j",
    75: "k",
    76: "l",
    90: "z",
    88: "x",
    67: "c",
    86: "v",
    66: "b",
    78: "n",
    77: "m"
  };

  specialKeySubstitutions = {
    83: "ß",
    65: "ä",
    85: "ü",
    79: "ö"
  };

  handleOnChange = event => {
    this.props.onChange(event);
  };

  handleKeyDown = event => {
    let uppercase = false;
    if (event.getModifierState("Shift") || event.getModifierState("CapsLock")) {
      uppercase = true;
    }
    // 27: esc 109: -  107: +
    if (event.keyCode === 27 || event.keyCode === 109) {
      console.debug("esc press: " + event.keyCode);
      this.handleEscPress(event);
    } else if (event.keyCode === 107) {
      console.debug("plus press: " + event.keyCode);
      this.handlePlusPress(event);
    } else if (this.normalKeySubstitutions[event.keyCode]) {
      console.debug("normal key press: " + event.keyCode);
      this.handleNormalKeyPress(event, uppercase);
    }

    if (this.specialKeySubstitutions[event.keyCode]) {
      if (this.sameSpecialKeyPressed(event.keyCode)) {
        console.debug("same special key press: " + event.keyCode);
        this.handleSameSpecialKeyPress(event, uppercase);
      } else {
        console.debug("special key press: " + event.keyCode);
        this.handleSpecialKeyPress(event);
      }
    }
  };

  handleNormalKeyPress = (event, uppercase) => {
    let letterToAdd = this.normalKeySubstitutions[event.keyCode];
    if (uppercase) {
      letterToAdd = letterToAdd.toUpperCase();
    }

    event.target.value += letterToAdd;
    console.info("******** event.target.value = " + event.target.value);

    // let text = event.target.value;
    // console.info(text);
    // text = text.slice(0, -1);
    // console.info(text);
    // text += letterToAdd;
    // console.info(text);
    // event.target.value = text;
    this.handleOnChange(event);
    // event.preventDefault();
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
    console.debug(`Special key (${event.keyCode}) pressed for the FIRST time. Setting timeout ${this.s_Timeout}`);
    this.alreadyPressedSpecialKeyCode = event.keyCode;
  };

  handleSameSpecialKeyPress = (event, uppercase) => {
    let letterToAdd = this.specialKeySubstitutions[event.keyCode];
    if (uppercase) {
      letterToAdd = letterToAdd.toUpperCase();
    }
    const initialBoxValue = event.target.value;
    const correct_input_box_value = initialBoxValue.substr(0, initialBoxValue.length - 2) + letterToAdd;
    event.target.value = correct_input_box_value;
    this.handleOnChange(event);
    this.resetSpecialKeyPress();
    event.preventDefault();
  };

  sameSpecialKeyPressed = keyCode => {
    return keyCode === this.alreadyPressedSpecialKeyCode;
  };

  handleEscPress = event => {
    if (!this.props.disableSpecialEscPress) {
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
    let sizeAttribute = this.props.currentInputValue.length > 17 ? "" : " translationInput--centered_text";
    return className + attribute + sizeAttribute;
  };

  render() {
    return (
      <input
        ref="input"
        className={this.constructCssClassName()}
        id={this.props.cssID}
        name="translationInputDE"
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
