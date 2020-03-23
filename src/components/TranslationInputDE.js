import React, { Component } from "react";

export default class TranslationInputDE extends Component {
  s_Timeout = 0;
  alreadyPressedSpecialKeyCode = -1;
  spaceIsPressed = false;
  uppercaseUsed = false;
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
    77: "m",
    18: ", " // left alt
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

    if (event.keyCode === 32) {
      console.debug("*******************space press: " + event.keyCode);
      this.spaceIsPressed = true;
      // kill space (we'll add it later if needed)
      event.preventDefault();
    }

    if (event.getModifierState("Shift") || event.getModifierState("CapsLock") || this.spaceIsPressed) {
      console.debug("***************************uppercase is true");
      uppercase = true;
    }
    // 27: esc     109: -       107: +
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
    this.scrollToEnd(this.refs.input);
  };

  handleKeyUp = event => {
    if (event.keyCode === 32) {
      this.spaceIsPressed = false;
      console.debug("*****************space UNpress: " + event.keyCode);
      if (this.uppercaseUsed === true) {
        event.preventDefault(); // kill space event
        this.uppercaseUsed = false;
      } else {
        event.target.value += " "; // this is a real space so add it
        this.scrollToEnd(this.refs.input);
      }
    }
  };

  handleNormalKeyPress = (event, uppercase) => {
    let letterToAdd = this.normalKeySubstitutions[event.keyCode];
    if (uppercase) {
      letterToAdd = letterToAdd.toUpperCase();
      this.uppercaseUsed = true;
    }
    event.target.value += letterToAdd;
    this.handleOnChange(event);
    event.preventDefault();
  };

  resetSpecialKeyPress = () => {
    console.debug(`Clearing special key press timeout ${this.s_Timeout}`);
    clearTimeout(this.s_Timeout);
    this.s_Timeout = 0;
    this.alreadyPressedSpecialKeyCode = -1;
  };

  handleSpecialKeyPress = event => {
    this.resetSpecialKeyPress(); // get rid of previous presses
    this.s_Timeout = setTimeout(this.resetSpecialKeyPress, 155);
    console.debug(`Special key (${event.keyCode}) pressed for the FIRST time. Setting timeout ${this.s_Timeout}`);
    this.alreadyPressedSpecialKeyCode = event.keyCode;
  };

  handleSameSpecialKeyPress = (event, uppercase) => {
    let letterToAdd = this.specialKeySubstitutions[event.keyCode];
    if (uppercase) {
      letterToAdd = letterToAdd.toUpperCase();
      this.uppercaseUsed = true;
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

  scrollToEnd = inputBox => {
    inputBox.focus();
    inputBox.scrollLeft = inputBox.scrollWidth;
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
        id={this.props.cssID}
        name="translationInputDE"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentInputValue}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        onChange={this.handleOnChange}
        placeholder={this.props.placeholder}
      />
    );
  }
}
