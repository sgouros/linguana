import React, { Component } from "react";
// import PropTypes from "prop-types";
import TranslationInputDE from "./TranslationInputDE.js";
import TranslationInputGR from "./TranslationInputGR.js";

// *** todo Κάποτε πρέπει να κάνω ένα refactor στο οποίο να δημιουργήσω το Vocabulary ως class (τώρα έχω πίνακες)

export default class VocabularyManager extends Component {
  state = {
    currentTermInputValue: "",
    currentTranslationInputValue: ""
  };

  handleTranslationInputChange = event => {
    this.setState({
      currentTranslationInputValue: event.target.value
    });
  };

  handleTermInputChange = event => {
    this.setState({
      currentTermInputValue: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    let term = this.state.currentTermInputValue;
    let translation = this.state.currentTranslationInputValue;
    this.props.onNewEntrySubmitted(term, translation);
    this.clearInputs();
    this.refs.vocabularyManagerTermInput.refs.input.focus();
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

        <form id="vocabularyManagerForm" onSubmit={this.handleSubmit}>
          <img className="greekFlag" src="/img/greekFlag.jpg" alt="greek flag" />
          <TranslationInputGR
            ref="vocabularyManagerTermInput"
            currentInputValue={this.state.currentTermInputValue}
            onChange={this.handleTermInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
            cssID="vocabularyManagerTranslationInputGR"
          />
          <img className="germanFlag" src="/img/germanFlag.jpg" alt="german flag" />
          <TranslationInputDE
            ref="vocabularyManagerTranslationInput"
            currentInputValue={this.state.currentTranslationInputValue}
            onChange={this.handleTranslationInputChange}
            disableSpecialEscPress={true}
            disableSpecialPlusPress={true}
            cssID="vocabularyManagerTranslationInputDE"
          />
          <input type="submit" id="VocabularyManagerSubmitButton" value="submit" />
        </form>

      </div>
    );
  }
}
