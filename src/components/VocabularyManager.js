import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInput from "./TranslationInput.js";
// import WordComparisonDialog from "./WordComparisonDialog.js";

export default class VocabularyManager extends Component {
  state = {
    currentTermInputValue: "",
    currentTranslationInputValue: ""
  };

  handleTranslationInputChange = event => {
    console.debug("setting Translation Input to:");
    console.debug(event.target.value);

    this.setState({
      currentTranslationInputValue: event.target.value
    });
  };

  handleTermInputChange = event => {
    console.debug("setting Term Input to:");
    console.debug(event.target.value);
    this.setState({
      currentTermInputValue: event.target.value
    });
  };

  handleSubmit = event => {
    console.debug("submit hitted");
    let term = this.state.currentTermInputValue;
    let translation = this.state.currentTranslationInputValue;
    this.props.onNewEntrySubmitted(term, translation);
    this.clearInputs();
    event.preventDefault();
  };

  clearInputs = () => {
    this.setState({
      currentTermInputValue: "",
      currentTranslationInputValue: ""
    });
  };

  render() {
    return (
      <div id="vocabulary-manager-div">
        <form className="vocabulary-manager-form" onSubmit={this.handleSubmit}>

          <TranslationInput
            ref="vocabularyManagerTermInput"
            currentInputValue={this.state.currentTermInputValue}
            onChange={this.handleTermInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
          />

          <TranslationInput
            ref="vocabularyManagerTranslationInput"
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
          />
          <input
            type="submit"
            id="VocabularyManagerSubmitButton"
            value="submit"
          />
        </form>

      </div>
    );
  }
}
