import React, { Component } from "react";

export default class SearchInput extends Component {
  s_Timeout = 0;
  alreadyPressedSpecialKeyCode = -1;

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

    if (this.specialKeySubstitutions[event.keyCode]) {
      if (this.sameSpecialKeyPressed(event.keyCode)) {
        console.debug("same special key press: " + event.keyCode);
        this.handleSameSpecialKeyPress(event, uppercase);
      } else {
        console.debug("special key press: " + event.keyCode);
        this.handleSpecialKeyPress(event);
      }
    }
    console.debug("key down: " + event.keyCode);
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
    const correct_input_box_value = initialBoxValue.substr(0, initialBoxValue.length - 1) + letterToAdd;
    event.target.value = correct_input_box_value;
    this.handleOnChange(event);
    this.resetSpecialKeyPress();
    event.preventDefault();
  };

  sameSpecialKeyPressed = keyCode => {
    return keyCode === this.alreadyPressedSpecialKeyCode;
  };

  onKeyPress = event => {
    if (event.key === "Enter") {
      this.props.onSearchSubmit(event);
    }
  };

  render() {
    return (
      <input
        onKeyPress={this.onKeyPress}
        ref="actual_input_ref"
        className="app__header__headerForm__searchInput"
        name="searchInput"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        value={this.props.currentValueOfSearchInput}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleOnChange}
        placeholder="αναζήτηση..."
      />
    );
  }
}
