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
    let uppercase = false;
    let keyPressed = this.normalKeySubstitutions[event.keyCode];
    console.info(`NEW KEY PRESSED code: ${event.keyCode} key: ${keyPressed}`);

    if (event.keyCode === 32) {
      console.info("*******************space press: " + event.keyCode);
      this.spaceIsPressed = true;
      console.info("killing space event");
      event.preventDefault();
    }

    if (event.getModifierState("Shift") || event.getModifierState("CapsLock") || this.spaceIsPressed) {
      console.info("***************************setting uppercase to true");
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
      console.info("normal key press: " + event.keyCode);
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

  handleKeyUp = (event) => {
    if (event.keyCode === 32) {
      this.spaceIsPressed = false;
      console.info("*****************space UNpress: " + event.keyCode);
      if (this.uppercaseUsed === true) {
        console.info("*****************upercaseUsed is true so killing space event");
        event.preventDefault(); // kill space event
        this.uppercaseUsed = false;
        console.info("this.uppercaseUsed set to " + this.uppercaseUsed);
      } else {
        // uppercaseUsed is false below
        console.info("this.uppercaseUsed is currently " + this.uppercaseUsed);
        console.info("*****************adding real space");
        event.target.value += " "; // this is a real space so add it
        this.scrollToEnd(this.refs.input);
      }
    }
  };

  handleNormalKeyPress = (event, uppercase) => {
    let letterToAdd = this.normalKeySubstitutions[event.keyCode];
    if (uppercase) {
      if (event.target.value.substr(-1) === " ") {
        // αν προλάβαμε να αφήσουμε το space
        letterToAdd = letterToAdd.toUpperCase();
      } else {
        // πρόσθεσε και το space γιατί μάλλον δεν προλάβαμε να το αφήσουμε
        letterToAdd = " " + letterToAdd.toUpperCase();
      }
      this.uppercaseUsed = true;
      console.info("this.uppercaseUsed set to " + this.uppercaseUsed);
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
    this.s_Timeout = setTimeout(this.resetSpecialKeyPress, 155);
    console.debug(`Special key (${event.keyCode}) pressed for the FIRST time. Setting timeout ${this.s_Timeout}`);
    this.alreadyPressedSpecialKeyCode = event.keyCode;
  };

  handleSameSpecialKeyPress = (event, uppercase) => {
    let letterToAdd = this.specialKeySubstitutions[event.keyCode];
    if (uppercase) {
      // δες λίγο τί γίνεται με το uppercase στην handleNormalKeyPress (για το όταν το ξεχάσουμε το space πατημένο. Εδώ δεν το βάζεις)
      letterToAdd = letterToAdd.toUpperCase();
      this.uppercaseUsed = true;
      console.info("this.uppercaseUsed set to " + this.uppercaseUsed);
    }
    const initialBoxValue = event.target.value;
    const correct_input_box_value = initialBoxValue.substr(0, initialBoxValue.length - 2) + letterToAdd;
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
