import React, { Component } from "react";

export default class TranslationInputDE extends Component {
  s_Timeout = 0;
  alreadyPressedSpecialKeyCode = -1;
  uppercase = false;
  oneSpaceIsEaten = false;
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
    18: ", ", // left alt
  };

  specialKeySubstitutions = {
    83: "ß",
    65: "ä",
    85: "ü",
    79: "ö",
  };

  handleOnChange = (event) => {
    this.props.onChange(event);
  };

  handleKeyDown = (event) => {
    let thePressedkey = this.normalKeySubstitutions[event.keyCode];
    console.info(`---- NEW KEY PRESSED! Code: ${event.keyCode} Key: ${thePressedkey} -----`);

    if (event.keyCode === 32) {
      this.uppercase = true;
      console.info(`  This is a space press. Have set UPPERCASE to ${this.uppercase}`);
      event.preventDefault();
    }

    if (event.getModifierState("Shift")) {
      console.info("  SHIFT is PRESSED so setting UPPERCASE to TRUE and continuing");
      this.uppercase = true;
    }

    // 27: esc     109: -       107: +
    if (event.keyCode === 27 || event.keyCode === 109) {
      console.debug("  ESC or MINUS was pressed. Handling esc press: " + event.keyCode);
      this.handleEscPress(event);
    } else if (event.keyCode === 107) {
      console.debug("  PLUS was pressed. Handling plus press: " + event.keyCode);
      this.handlePlusPress(event);
    } else if (this.normalKeySubstitutions[event.keyCode]) {
      console.info("  Handling normal key press. If it is special, then we will transform this letter. Code = " + event.keyCode);
      this.handleNormalKeyPress(event);
    }

    if (this.specialKeySubstitutions[event.keyCode]) {
      if (this.sameSpecialKeyPressed(event.keyCode)) {
        console.debug(" handling same special key press: " + event.keyCode);
        this.handleSameSpecialKeyPress(event);
      } else {
        console.debug("  handling special key press: " + event.keyCode);
        this.handleSpecialKeyPress(event);
      }
    }
    this.scrollToEnd(this.refs.input);
  };

  handleKeyUp = (event) => {
    if (event.keyCode === 32) {
      console.debug("*****************space UNpress: " + event.keyCode);
      const lastChar = event.target.value.slice(-1);
      if (lastChar === lastChar.toLowerCase() || this.oneSpaceIsEaten === true) {
        console.debug(`event.target.value=${event.target.value} and oneSpaceIsEaten=${this.oneSpaceIsEaten} so ADDING SPACE`);
        event.target.value += " "; // lastChar is lowercase so space was not used for uppercase mode, so add a real space
        console.debug("Setting onSpaceIsEaten TO FALSE");
        this.oneSpaceIsEaten = false; // reset oneSpaceIsEaten. We do not want it for the next iteration
      } else {
        console.debug(`event.target.value=${event.target.value} and oneSpaceIsEaten=${this.oneSpaceIsEaten} so NOT ADDING SPACE`);
        console.debug("Setting onSpaceIsEaten TO TRUE");
        this.oneSpaceIsEaten = true;
      }
      this.scrollToEnd(this.refs.input);
      this.uppercase = false;
      console.debug("this.uppercase set to " + this.uppercase);
    }

    if (event.keyCode === 16) {
      const lastChar = event.target.value.slice(-1);
      if (lastChar === lastChar.toUpperCase()) {
        // αν το shift χρησιμοποιήθηκε, τότε το επόμενο space πρέπει να δώσει κανονικά διάστημα
        this.oneSpaceIsEaten = true;
      }
      this.uppercase = false;
      console.debug(`SHIFT unpressed so this.uppercase set to ${this.uppercase} this.oneSpaceIsEaten=${this.oneSpaceIsEaten}`);
    }
  };

  handleNormalKeyPress = (event) => {
    console.debug(`Handling normal key press with code = ${event.keyCode} and uppercase = ${this.uppercase}`);
    let letterToAdd = this.normalKeySubstitutions[event.keyCode];
    if (this.uppercase) {
      letterToAdd = letterToAdd.toUpperCase();
      console.debug(`just uppercased letter to ${letterToAdd} uppercase=${this.uppercase}`);
    }
    event.target.value += letterToAdd;
    this.handleOnChange(event);
    event.preventDefault();
  };

  resetSpecialKeyPress = () => {
    console.info(`Clearing special key press timeout ${this.s_Timeout}`);
    clearTimeout(this.s_Timeout);
    this.s_Timeout = 0;
    this.alreadyPressedSpecialKeyCode = -1;
  };

  handleSpecialKeyPress = (event) => {
    this.resetSpecialKeyPress(); // get rid of previous presses
    this.s_Timeout = setTimeout(this.resetSpecialKeyPress, 165);
    console.debug(`Special key (${event.keyCode}) pressed for the FIRST time. Setting timeout ${this.s_Timeout}`);
    this.alreadyPressedSpecialKeyCode = event.keyCode;
  };

  handleSameSpecialKeyPress = (event) => {
    let letterToAdd = this.specialKeySubstitutions[event.keyCode];
    console.debug(`handleSameSpecialKeyPress:: letter=${letterToAdd}.uppercase=${this.uppercase}}`);
    if (this.uppercase === true) {
      letterToAdd = letterToAdd.toUpperCase();
      console.debug(`letter transformed to ${letterToAdd}`);
    }
    const initialBoxValue = event.target.value;
    const correct_input_box_value = initialBoxValue.substr(0, initialBoxValue.length - 2) + letterToAdd;
    console.debug(`** handleSameSpecialKeyPress:: TRANSFORMING ${initialBoxValue} to ${correct_input_box_value}`);
    event.target.value = correct_input_box_value;
    this.handleOnChange(event);
    this.resetSpecialKeyPress();
    event.preventDefault();
  };

  sameSpecialKeyPressed = (keyCode) => {
    return keyCode === this.alreadyPressedSpecialKeyCode;
  };

  handleEscPress = (event) => {
    if (!this.props.disableSpecialEscPress) {
      this.props.onEscPress();
      event.preventDefault();
    }
  };

  handlePlusPress = (event) => {
    if (!this.props.disableSpecialPlusPress) {
      this.props.onPlusPress();
      event.preventDefault();
    }
  };

  scrollToEnd = (inputBox) => {
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
